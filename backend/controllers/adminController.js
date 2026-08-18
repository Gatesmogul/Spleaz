'use strict';

const crypto = require('crypto');

const User = require('../models/User');

const {
  ADMIN_ROLES,
  ADMIN_PERMISSIONS,
  FOUNDER_ADMIN_EMAILS,
  getAdminPermissions,
  normalizeEmail,
  isFounderAdminEmail,
} = require('../admin/founderAdmin');

const {
  sendAdminPasswordSetupEmail,
} = require('../services/adminEmailService');

/**
 * Generate a secure one-time password setup token.
 */
function generatePasswordSetupToken() {
  return crypto.randomBytes(48).toString('hex');
}

/**
 * Hash password setup token before storing it.
 */
function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

/**
 * Founder Admin bootstrap.
 *
 * This creates the three protected Founder Admin records
 * if they do not already exist.
 *
 * No password is generated or stored.
 */
async function bootstrapFounderAdmins() {
  for (const email of FOUNDER_ADMIN_EMAILS) {
    const normalizedEmail = normalizeEmail(email);

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      user = await User.create({
        email: normalizedEmail,

        fullName: 'Spleaz Founder Admin',

        role: 'admin',

        isAdmin: true,

        adminRole: ADMIN_ROLES.FOUNDER,

        adminPermissions: getAdminPermissions(
          ADMIN_ROLES.FOUNDER
        ),

        isActive: true,

        isSuspended: false,

        mustSetPassword: true,

        createdByAdmin: 'SYSTEM',
      });
    } else {
      user.isAdmin = true;
      user.adminRole = ADMIN_ROLES.FOUNDER;
      user.adminPermissions =
        getAdminPermissions(ADMIN_ROLES.FOUNDER);
      user.isActive = true;
      user.isSuspended = false;

      await user.save();
    }
  }
}

/**
 * Send password setup email to an administrator.
 */
async function sendPasswordSetupForAdmin(user) {
  const token = generatePasswordSetupToken();

  const tokenHash = hashToken(token);

  user.passwordResetTokenHash = tokenHash;

  user.passwordResetExpiresAt = new Date(
    Date.now() + 30 * 60 * 1000
  );

  user.mustSetPassword = true;

  await user.save();

  await sendAdminPasswordSetupEmail({
    email: user.email,
    token,
    adminRole: user.adminRole,
  });
}

/**
 * Request password setup for a Founder Admin.
 */
async function requestFounderPasswordSetup(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);

    if (!isFounderAdminEmail(email)) {
      return res.status(403).json({
        success: false,
        message: 'This email is not authorized as a Founder Admin.',
      });
    }

    const user = await User.findOne({
      email,
      isAdmin: true,
      adminRole: ADMIN_ROLES.FOUNDER,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Founder Admin account has not been initialized.',
      });
    }

    await sendPasswordSetupForAdmin(user);

    return res.status(200).json({
      success: true,
      message:
        'A secure password setup email has been sent to the authorized email address.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a Senior or Junior Admin.
 *
 * Only Founder Admins and permitted Senior Admins can
 * create Junior Admins.
 */
async function createAdmin(req, res, next) {
  try {
    const {
      email,
      fullName,
      adminRole,
    } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !fullName || !adminRole) {
      return res.status(400).json({
        success: false,
        message:
          'Email, full name and administrator role are required.',
      });
    }

    if (
      ![
        ADMIN_ROLES.SENIOR,
        ADMIN_ROLES.JUNIOR,
      ].includes(adminRole)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Only Senior Admin or Junior Admin accounts can be created through this endpoint.',
      });
    }

    /**
     * Founder email addresses can never be downgraded
     * into Junior/Senior Admin accounts.
     */
    if (isFounderAdminEmail(normalizedEmail)) {
      return res.status(409).json({
        success: false,
        message:
          'Founder Admin email addresses are protected and cannot be reassigned.',
      });
    }

    /**
     * Senior Admins can only create Junior Admins.
     */
    if (
      req.admin.adminRole === ADMIN_ROLES.SENIOR &&
      adminRole !== ADMIN_ROLES.JUNIOR
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Senior Admins can only create Junior Admin accounts.',
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          'An account already exists with this email address.',
      });
    }

    const newAdmin = await User.create({
      email: normalizedEmail,

      fullName: fullName.trim(),

      role: 'admin',

      isAdmin: true,

      adminRole,

      adminPermissions:
        getAdminPermissions(adminRole),

      isActive: true,

      isSuspended: false,

      mustSetPassword: true,

      createdByAdmin: req.admin.email,
    });

    await sendPasswordSetupForAdmin(newAdmin);

    return res.status(201).json({
      success: true,
      message:
        'Administrator created successfully. A password setup email has been sent.',
      data: {
        id: newAdmin._id,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        adminRole: newAdmin.adminRole,
        permissions: newAdmin.adminPermissions,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List registered customers and drivers.
 */
async function listUsers(req, res, next) {
  try {
    const {
      role,
      page = 1,
      limit = 50,
      search = '',
    } = req.query;

    const safePage = Math.max(Number(page) || 1, 1);

    const safeLimit = Math.min(
      Math.max(Number(limit) || 50, 1),
      100
    );

    const filter = {
      role: {
        $in: ['customer', 'driver'],
      },
    };

    if (
      role === 'customer' ||
      role === 'driver'
    ) {
      filter.role = role;
    }

    if (search.trim()) {
      filter.$or = [
        {
          fullName: {
            $regex: search.trim(),
            $options: 'i',
          },
        },
        {
          email: {
            $regex: search.trim(),
            $options: 'i',
          },
        },
        {
          phoneNumber: {
            $regex: search.trim(),
            $options: 'i',
          },
        },
      ];
    }

    const skip =
      (safePage - 1) * safeLimit;

    const [users, total] =
      await Promise.all([
        User.find(filter)
          .select(
            '-password -passwordResetTokenHash'
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(safeLimit)
          .lean(),

        User.countDocuments(filter),
      ]);

    return res.status(200).json({
      success: true,

      data: {
        users,

        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          pages: Math.ceil(
            total / safeLimit
          ),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Suspend an account.
 */
async function suspendUser(req, res, next) {
  try {
    const { userId } = req.params;
    const reason =
      String(req.body.reason || '').trim();

    if (!reason) {
      return res.status(400).json({
        success: false,
        message:
          'A suspension reason is required.',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (user.isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          'Administrative accounts cannot be suspended through the user moderation endpoint.',
      });
    }

    user.isSuspended = true;
    user.isActive = false;
    user.suspensionReason = reason;
    user.suspendedAt = new Date();
    user.suspendedBy = req.admin.email;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        'User account suspended successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reactivate a suspended account.
 */
async function reactivateUser(req, res, next) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (user.isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          'Administrative accounts must be managed through the admin management endpoint.',
      });
    }

    user.isSuspended = false;
    user.isActive = true;
    user.suspensionReason = null;
    user.suspendedAt = null;
    user.suspendedBy = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        'User account reactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Deactivate an account.
 */
async function deactivateUser(req, res, next) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (user.isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          'Administrative accounts cannot be deactivated through the user moderation endpoint.',
      });
    }

    user.isActive = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        'User account deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List administrators.
 */
async function listAdmins(req, res, next) {
  try {
    const admins = await User.find({
      isAdmin: true,
    })
      .select(
        '-password -passwordResetTokenHash'
      )
      .sort({
        adminRole: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Disable a Junior/Senior Admin.
 *
 * Founder Admin only.
 */
async function disableAdmin(req, res, next) {
  try {
    const { adminId } = req.params;

    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message:
          'Administrator account not found.',
      });
    }

    if (admin.adminRole === ADMIN_ROLES.FOUNDER) {
      return res.status(403).json({
        success: false,
        message:
          'Founder Admin accounts are protected and cannot be disabled.',
      });
    }

    admin.isActive = false;

    await admin.save();

    return res.status(200).json({
      success: true,
      message:
        'Administrator account disabled successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  bootstrapFounderAdmins,
  requestFounderPasswordSetup,
  createAdmin,
  listUsers,
  suspendUser,
  reactivateUser,
  deactivateUser,
  listAdmins,
  disableAdmin,
};

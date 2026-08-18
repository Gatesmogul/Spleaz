'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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
 * ============================================================
 * CONFIGURATION
 * ============================================================
 */

const PASSWORD_SETUP_EXPIRY_MINUTES = 30;
const BCRYPT_SALT_ROUNDS = 12;

/**
 * ============================================================
 * HELPER FUNCTIONS
 * ============================================================
 */

/**
 * Generate a cryptographically secure one-time password
 * setup token.
 */
function generatePasswordSetupToken() {
  return crypto.randomBytes(48).toString('hex');
}

/**
 * Hash a password setup token before storing it.
 *
 * The raw token is only sent through the email link.
 * The database stores only the hash.
 */
function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

/**
 * Create a temporary random password.
 *
 * This password is never sent to the administrator.
 * The administrator must use the password setup email.
 */
function generateTemporaryPassword() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * ============================================================
 * FOUNDER ADMIN BOOTSTRAP
 * ============================================================
 */

/**
 * Create or repair the protected Founder Admin accounts.
 *
 * Founder Admin emails are defined in:
 *
 * backend/admin/founderAdmin.js
 *
 * Founder accounts:
 * - Cannot be downgraded to Senior Admin
 * - Cannot be downgraded to Junior Admin
 * - Are always marked as administrators
 * - Must set their own password
 */
async function bootstrapFounderAdmins() {
  for (const email of FOUNDER_ADMIN_EMAILS) {
    const normalizedEmail = normalizeEmail(email);

    let user = await User.findOne({
      email: normalizedEmail,
    }).select('+password');

    if (!user) {
      /**
       * User.password is required by the User schema.
       *
       * We therefore create a random temporary password.
       * The administrator does not receive this password.
       * They receive a secure password setup email instead.
       */
      const temporaryPassword =
        generateTemporaryPassword();

      const hashedTemporaryPassword =
        await bcrypt.hash(
          temporaryPassword,
          BCRYPT_SALT_ROUNDS
        );

      user = await User.create({
        email: normalizedEmail,

        fullName: 'Spleaz Founder Admin',

        role: 'admin',

        password: hashedTemporaryPassword,

        isAdmin: true,

        adminRole: ADMIN_ROLES.FOUNDER,

        adminPermissions:
          getAdminPermissions(
            ADMIN_ROLES.FOUNDER
          ),

        isActive: true,

        isSuspended: false,

        mustSetPassword: true,

        createdByAdmin: 'SYSTEM',
      });
    } else {
      /**
       * Founder email addresses are permanently protected.
       */
      user.isAdmin = true;
      user.role = 'admin';

      user.adminRole =
        ADMIN_ROLES.FOUNDER;

      user.adminPermissions =
        getAdminPermissions(
          ADMIN_ROLES.FOUNDER
        );

      user.isActive = true;
      user.isSuspended = false;
      user.mustSetPassword = true;

      /**
       * Existing Founder accounts are not given a new
       * password automatically.
       *
       * They must use the password setup endpoint.
       */

      await user.save();
    }
  }
}

/**
 * ============================================================
 * ADMIN PASSWORD SETUP
 * ============================================================
 */

/**
 * Generate and send a password setup email to an administrator.
 *
 * The password setup token:
 * - Is randomly generated
 * - Is hashed before database storage
 * - Expires after 30 minutes
 * - Can only be used once
 */
async function sendPasswordSetupForAdmin(user) {
  const token =
    generatePasswordSetupToken();

  const tokenHash =
    hashToken(token);

  user.passwordResetTokenHash =
    tokenHash;

  user.passwordResetExpiresAt =
    new Date(
      Date.now() +
        PASSWORD_SETUP_EXPIRY_MINUTES *
          60 *
          1000
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
 *
 * POST:
 *
 * /auth/admin/request-password-setup
 *
 * Body:
 *
 * {
 *   "email": "founder@example.com"
 * }
 */
async function requestFounderPasswordSetup(
  req,
  res,
  next
) {
  try {
    const email = normalizeEmail(
      req.body?.email
    );

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          'Email address is required.',
      });
    }

    /**
     * Only the three protected Founder Admin
     * email addresses may use this endpoint.
     */
    if (!isFounderAdminEmail(email)) {
      return res.status(403).json({
        success: false,
        message:
          'This email is not authorized as a Founder Admin.',
      });
    }

    const user =
      await User.findOne({
        email,
        isAdmin: true,
        adminRole:
          ADMIN_ROLES.FOUNDER,
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'Founder Admin account has not been initialized.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message:
          'This administrator account is suspended.',
      });
    }

    await sendPasswordSetupForAdmin(
      user
    );

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
 * Set a new administrator password using the one-time
 * password setup token.
 *
 * POST:
 *
 * /auth/admin/set-password
 *
 * Body:
 *
 * {
 *   "token": "...",
 *   "newPassword": "..."
 * }
 */
async function setAdminPassword(
  req,
  res,
  next
) {
  try {
    const {
      token,
      newPassword,
    } = req.body || {};

    if (
      !token ||
      typeof token !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Password setup token is required.',
      });
    }

    if (
      !newPassword ||
      typeof newPassword !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'New password is required.',
      });
    }

    /**
     * Enforce a strong administrator password.
     */
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long.',
      });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must contain at least one uppercase letter.',
      });
    }

    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must contain at least one lowercase letter.',
      });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must contain at least one number.',
      });
    }

    if (
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Password must contain at least one special character.',
      });
    }

    const tokenHash =
      hashToken(token);

    /**
     * Find an administrator whose password setup
     * token matches and has not expired.
     */
    const admin =
      await User.findOne({
        isAdmin: true,
        passwordResetTokenHash:
          tokenHash,
        passwordResetExpiresAt: {
          $gt: new Date(),
        },
      }).select('+password');

    if (!admin) {
      return res.status(400).json({
        success: false,
        message:
          'Password setup token is invalid or has expired.',
      });
    }

    if (admin.isSuspended) {
      return res.status(403).json({
        success: false,
        message:
          'This administrator account is suspended.',
      });
    }

    /**
     * Hash the administrator's new password.
     */
    admin.password =
      await bcrypt.hash(
        newPassword,
        BCRYPT_SALT_ROUNDS
      );

    /**
     * Password has now been successfully established.
     */
    admin.mustSetPassword = false;

    /**
     * Invalidate the setup token immediately.
     * This makes the password setup link one-time use.
     */
    admin.passwordResetTokenHash = null;
    admin.passwordResetExpiresAt = null;

    admin.passwordChangedAt =
      new Date();

    admin.isActive = true;

    await admin.save();

    return res.status(200).json({
      success: true,
      message:
        'Administrator password has been set successfully. You can now sign in.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ============================================================
 * CREATE ADMINISTRATOR
 * ============================================================
 */

/**
 * Create a Senior Admin or Junior Admin.
 *
 * Founder Admin:
 * - Can create Senior Admins
 * - Can create Junior Admins
 *
 * Senior Admin:
 * - Can create Junior Admins only
 *
 * Junior Admin:
 * - Cannot create administrators
 */
async function createAdmin(
  req,
  res,
  next
) {
  try {
    const {
      email,
      fullName,
      adminRole,
    } = req.body || {};

    const normalizedEmail =
      normalizeEmail(email);

    if (
      !normalizedEmail ||
      !fullName ||
      !adminRole
    ) {
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
     * Founder emails are permanently protected.
     */
    if (
      isFounderAdminEmail(
        normalizedEmail
      )
    ) {
      return res.status(409).json({
        success: false,
        message:
          'Founder Admin email addresses are protected and cannot be reassigned.',
      });
    }

    /**
     * req.admin should be populated by the
     * administrator authorization middleware.
     */
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message:
          'Administrator authentication is required.',
      });
    }

    /**
     * Senior Admins can only create Junior Admins.
     */
    if (
      req.admin.adminRole ===
        ADMIN_ROLES.SENIOR &&
      adminRole !==
        ADMIN_ROLES.JUNIOR
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Senior Admins can only create Junior Admin accounts.',
      });
    }

    /**
     * Junior Admins cannot create administrators.
     */
    if (
      req.admin.adminRole ===
      ADMIN_ROLES.JUNIOR
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Junior Admins do not have permission to create administrator accounts.',
      });
    }

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          'An account already exists with this email address.',
      });
    }

    /**
     * User.password is required by the schema.
     *
     * Generate a random temporary password and hash it.
     * The administrator never receives this password.
     */
    const temporaryPassword =
      generateTemporaryPassword();

    const hashedTemporaryPassword =
      await bcrypt.hash(
        temporaryPassword,
        BCRYPT_SALT_ROUNDS
      );

    const newAdmin =
      await User.create({
        email: normalizedEmail,

        fullName:
          String(fullName).trim(),

        role: 'admin',

        password:
          hashedTemporaryPassword,

        isAdmin: true,

        adminRole,

        adminPermissions:
          getAdminPermissions(
            adminRole
          ),

        isActive: true,

        isSuspended: false,

        mustSetPassword: true,

        createdByAdmin:
          req.admin.email,
      });

    try {
      await sendPasswordSetupForAdmin(
        newAdmin
      );
    } catch (emailError) {
      /**
       * Do not leave an administrator account
       * without a usable password setup process.
       */
      await User.findByIdAndDelete(
        newAdmin._id
      );

      throw emailError;
    }

    return res.status(201).json({
      success: true,
      message:
        'Administrator created successfully. A password setup email has been sent.',
      data: {
        id: newAdmin._id,
        email: newAdmin.email,
        fullName:
          newAdmin.fullName,
        adminRole:
          newAdmin.adminRole,
        permissions:
          newAdmin.adminPermissions,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ============================================================
 * USER MANAGEMENT
 * ============================================================
 */

/**
 * List registered customers and drivers.
 */
async function listUsers(
  req,
  res,
  next
) {
  try {
    const {
      role,
      page = 1,
      limit = 50,
      search = '',
    } = req.query;

    const safePage =
      Math.max(
        Number(page) || 1,
        1
      );

    const safeLimit =
      Math.min(
        Math.max(
          Number(limit) || 50,
          1
        ),
        100
      );

    const filter = {
      role: {
        $in: [
          'customer',
          'driver',
        ],
      },
    };

    if (
      role === 'customer' ||
      role === 'driver'
    ) {
      filter.role = role;
    }

    const cleanSearch =
      String(search || '').trim();

    if (cleanSearch) {
      filter.$or = [
        {
          fullName: {
            $regex:
              cleanSearch,
            $options: 'i',
          },
        },
        {
          email: {
            $regex:
              cleanSearch,
            $options: 'i',
          },
        },
        {
          phone: {
            $regex:
              cleanSearch,
            $options: 'i',
          },
        },
      ];
    }

    const skip =
      (safePage - 1) *
      safeLimit;

    const [
      users,
      total,
    ] = await Promise.all([
      User.find(filter)
        .select(
          '-password -passwordResetTokenHash -passwordResetExpiresAt'
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      User.countDocuments(
        filter
      ),
    ]);

    return res.status(200).json({
      success: true,

      data: {
        users,

        pagination: {
          page: safePage,
          limit: safeLimit,
          total,

          pages:
            Math.ceil(
              total /
                safeLimit
            ),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ============================================================
 * ACCOUNT MODERATION
 * ============================================================
 */

/**
 * Suspend a customer or driver account.
 */
async function suspendUser(
  req,
  res,
  next
) {
  try {
    const { userId } =
      req.params;

    const reason =
      String(
        req.body?.reason || ''
      ).trim();

    if (!reason) {
      return res.status(400).json({
        success: false,
        message:
          'A suspension reason is required.',
      });
    }

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'User account not found.',
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

    user.suspensionReason =
      reason;

    user.suspendedAt =
      new Date();

    user.suspendedBy =
      req.admin.email;

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
async function reactivateUser(
  req,
  res,
  next
) {
  try {
    const { userId } =
      req.params;

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'User account not found.',
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

    user.suspensionReason =
      null;

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
async function deactivateUser(
  req,
  res,
  next
) {
  try {
    const { userId } =
      req.params;

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'User account not found.',
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
 * ============================================================
 * ADMIN MANAGEMENT
 * ============================================================
 */

/**
 * List all administrators.
 */
async function listAdmins(
  req,
  res,
  next
) {
  try {
    const admins =
      await User.find({
        isAdmin: true,
      })
        .select(
          '-password -passwordResetTokenHash -passwordResetExpiresAt'
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
 * Disable a Senior or Junior Admin.
 *
 * Founder Admin only.
 */
async function disableAdmin(
  req,
  res,
  next
) {
  try {
    const { adminId } =
      req.params;

    const admin =
      await User.findById(
        adminId
      );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message:
          'Administrator account not found.',
      });
    }

    if (
      admin.adminRole ===
      ADMIN_ROLES.FOUNDER
    ) {
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

/**
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {
  bootstrapFounderAdmins,

  requestFounderPasswordSetup,

  setAdminPassword,

  createAdmin,

  listUsers,

  suspendUser,

  reactivateUser,

  deactivateUser,

  listAdmins,

  disableAdmin,
};

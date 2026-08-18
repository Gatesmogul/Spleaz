'use strict';

const User = require('../models/User');

const {
  ADMIN_ROLES,
  ADMIN_PERMISSIONS,
  hasAdminPermission,
} = require('../admin/founderAdmin');

/**
 * Require an authenticated administrative user.
 *
 * This middleware expects your existing authentication
 * middleware to have already populated req.user.
 */
async function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userId = req.user.id || req.user._id || req.user.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication identity.',
      });
    }

    const adminUser = await User.findById(userId).select(
      '-password -passwordResetTokenHash'
    );

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Administrator account not found.',
      });
    }

    if (!adminUser.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Administrator privileges are required.',
      });
    }

    if (!adminUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This administrator account is inactive.',
      });
    }

    if (adminUser.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'This administrator account is suspended.',
      });
    }

    if (!Object.values(ADMIN_ROLES).includes(adminUser.adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid administrator role.',
      });
    }

    req.admin = adminUser;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require a specific admin permission.
 */
function requireAdminPermission(permission) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Administrator authentication required.',
      });
    }

    if (!Object.values(ADMIN_PERMISSIONS).includes(permission)) {
      return res.status(500).json({
        success: false,
        message: 'Invalid administrative permission.',
      });
    }

    if (
      !hasAdminPermission(
        req.admin.adminRole,
        permission
      )
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
}

/**
 * Require Founder Admin specifically.
 */
function requireFounderAdmin(req, res, next) {
  if (!req.admin) {
    return res.status(403).json({
      success: false,
      message: 'Administrator authentication required.',
    });
  }

  if (req.admin.adminRole !== ADMIN_ROLES.FOUNDER) {
    return res.status(403).json({
      success: false,
      message: 'Founder Admin privileges are required.',
    });
  }

  next();
}

module.exports = {
  requireAdmin,
  requireAdminPermission,
  requireFounderAdmin,
};

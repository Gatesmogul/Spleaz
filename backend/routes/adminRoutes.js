'use strict';

const express = require('express');

const router = express.Router();

const {
  requireAdmin,
  requireAdminPermission,
  requireFounderAdmin,
} = require('../middleware/adminMiddleware');

const {
  createAdmin,
  listUsers,
  suspendUser,
  reactivateUser,
  deactivateUser,
  listAdmins,
  disableAdmin,
} = require('../controllers/adminController');

const {
  ADMIN_PERMISSIONS,
} = require('../admin/founderAdmin');

/**
 * All routes below require authenticated
 * administrator privileges.
 */
router.use(requireAdmin);

/**
 * -------------------------------------------------------
 * USER MANAGEMENT
 * -------------------------------------------------------
 */

router.get(
  '/users',
  requireAdminPermission(
    ADMIN_PERMISSIONS.VIEW_USERS
  ),
  listUsers
);

router.patch(
  '/users/:userId/suspend',
  requireAdminPermission(
    ADMIN_PERMISSIONS.SUSPEND_USERS
  ),
  suspendUser
);

router.patch(
  '/users/:userId/reactivate',
  requireAdminPermission(
    ADMIN_PERMISSIONS.UNSUSPEND_USERS
  ),
  reactivateUser
);

router.patch(
  '/users/:userId/deactivate',
  requireAdminPermission(
    ADMIN_PERMISSIONS.DEACTIVATE_USERS
  ),
  deactivateUser
);

/**
 * -------------------------------------------------------
 * ADMIN MANAGEMENT
 * -------------------------------------------------------
 */

router.get(
  '/administrators',
  requireAdminPermission(
    ADMIN_PERMISSIONS.VIEW_ADMIN_USERS
  ),
  listAdmins
);

router.post(
  '/administrators',
  requireAdminPermission(
    ADMIN_PERMISSIONS.CREATE_JUNIOR_ADMIN
  ),
  createAdmin
);

router.patch(
  '/administrators/:adminId/disable',
  requireFounderAdmin,
  requireAdminPermission(
    ADMIN_PERMISSIONS.DISABLE_ADMIN
  ),
  disableAdmin
);

module.exports = router;

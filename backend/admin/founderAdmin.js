'use strict';

/**
 * Spleaz Founder Administration Configuration
 *
 * This file defines the permanently authorized Founder Admin
 * email addresses and the permissions available to each
 * administrative level.
 *
 * IMPORTANT:
 * - Do NOT put passwords in this file.
 * - Do NOT put SMTP passwords in this file.
 * - Do NOT allow public registration to create admin accounts.
 * - Passwords must always be stored as secure hashes.
 */

const FOUNDER_ADMIN_EMAILS = Object.freeze([
  'ogunmola83@gmail.com',
  'adekunlegates@gmail.com',
  'gatesmogul@gmail.com',
]);

const ADMIN_ROLES = Object.freeze({
  FOUNDER: 'founder_admin',
  SENIOR: 'senior_admin',
  JUNIOR: 'junior_admin',
});

/**
 * Permissions available to administrative users.
 *
 * These permissions are enforced by backend middleware.
 * They are NOT merely frontend UI permissions.
 */
const ADMIN_PERMISSIONS = Object.freeze({
  VIEW_USERS: 'view_users',

  VIEW_CUSTOMERS: 'view_customers',

  VIEW_DRIVERS: 'view_drivers',

  VIEW_USER_DETAILS: 'view_user_details',

  SUSPEND_USERS: 'suspend_users',

  UNSUSPEND_USERS: 'unsuspend_users',

  DEACTIVATE_USERS: 'deactivate_users',

  REACTIVATE_USERS: 'reactivate_users',

  VIEW_UPLOADS: 'view_uploads',

  APPROVE_UPLOADS: 'approve_uploads',

  REJECT_UPLOADS: 'reject_uploads',

  VIEW_MODERATION_HISTORY: 'view_moderation_history',

  CREATE_JUNIOR_ADMIN: 'create_junior_admin',

  CREATE_SENIOR_ADMIN: 'create_senior_admin',

  DISABLE_ADMIN: 'disable_admin',

  VIEW_ADMIN_USERS: 'view_admin_users',
});

/**
 * Founder Admins have full administrative authority.
 */
const FOUNDER_PERMISSIONS = Object.freeze([
  ADMIN_PERMISSIONS.VIEW_USERS,
  ADMIN_PERMISSIONS.VIEW_CUSTOMERS,
  ADMIN_PERMISSIONS.VIEW_DRIVERS,
  ADMIN_PERMISSIONS.VIEW_USER_DETAILS,

  ADMIN_PERMISSIONS.SUSPEND_USERS,
  ADMIN_PERMISSIONS.UNSUSPEND_USERS,

  ADMIN_PERMISSIONS.DEACTIVATE_USERS,
  ADMIN_PERMISSIONS.REACTIVATE_USERS,

  ADMIN_PERMISSIONS.VIEW_UPLOADS,
  ADMIN_PERMISSIONS.APPROVE_UPLOADS,
  ADMIN_PERMISSIONS.REJECT_UPLOADS,

  ADMIN_PERMISSIONS.VIEW_MODERATION_HISTORY,

  ADMIN_PERMISSIONS.CREATE_JUNIOR_ADMIN,
  ADMIN_PERMISSIONS.CREATE_SENIOR_ADMIN,

  ADMIN_PERMISSIONS.DISABLE_ADMIN,
  ADMIN_PERMISSIONS.VIEW_ADMIN_USERS,
]);

/**
 * Senior Admins can perform normal administrative
 * and moderation duties.
 *
 * They cannot create Founder Admins.
 */
const SENIOR_PERMISSIONS = Object.freeze([
  ADMIN_PERMISSIONS.VIEW_USERS,
  ADMIN_PERMISSIONS.VIEW_CUSTOMERS,
  ADMIN_PERMISSIONS.VIEW_DRIVERS,
  ADMIN_PERMISSIONS.VIEW_USER_DETAILS,

  ADMIN_PERMISSIONS.SUSPEND_USERS,
  ADMIN_PERMISSIONS.UNSUSPEND_USERS,

  ADMIN_PERMISSIONS.DEACTIVATE_USERS,
  ADMIN_PERMISSIONS.REACTIVATE_USERS,

  ADMIN_PERMISSIONS.VIEW_UPLOADS,
  ADMIN_PERMISSIONS.APPROVE_UPLOADS,
  ADMIN_PERMISSIONS.REJECT_UPLOADS,

  ADMIN_PERMISSIONS.VIEW_MODERATION_HISTORY,

  ADMIN_PERMISSIONS.CREATE_JUNIOR_ADMIN,
  ADMIN_PERMISSIONS.VIEW_ADMIN_USERS,
]);

/**
 * Junior Admins have operational moderation access.
 */
const JUNIOR_PERMISSIONS = Object.freeze([
  ADMIN_PERMISSIONS.VIEW_USERS,
  ADMIN_PERMISSIONS.VIEW_CUSTOMERS,
  ADMIN_PERMISSIONS.VIEW_DRIVERS,
  ADMIN_PERMISSIONS.VIEW_USER_DETAILS,

  ADMIN_PERMISSIONS.SUSPEND_USERS,

  ADMIN_PERMISSIONS.VIEW_UPLOADS,
  ADMIN_PERMISSIONS.APPROVE_UPLOADS,
  ADMIN_PERMISSIONS.REJECT_UPLOADS,

  ADMIN_PERMISSIONS.VIEW_MODERATION_HISTORY,
]);

const ROLE_PERMISSIONS = Object.freeze({
  [ADMIN_ROLES.FOUNDER]: FOUNDER_PERMISSIONS,
  [ADMIN_ROLES.SENIOR]: SENIOR_PERMISSIONS,
  [ADMIN_ROLES.JUNIOR]: JUNIOR_PERMISSIONS,
});

/**
 * Normalize email addresses before comparison.
 */
function normalizeEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }

  return email.trim().toLowerCase();
}

/**
 * Check whether an email belongs to a Founder Admin.
 */
function isFounderAdminEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  return FOUNDER_ADMIN_EMAILS.includes(normalizedEmail);
}

/**
 * Get the administrative role for a Founder email.
 */
function getFounderAdminRole(email) {
  if (!isFounderAdminEmail(email)) {
    return null;
  }

  return ADMIN_ROLES.FOUNDER;
}

/**
 * Check whether an administrative role is valid.
 */
function isAdminRole(role) {
  return Object.values(ADMIN_ROLES).includes(role);
}

/**
 * Return permissions for a particular admin role.
 */
function getAdminPermissions(role) {
  if (!isAdminRole(role)) {
    return [];
  }

  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check whether a role has a particular permission.
 */
function hasAdminPermission(role, permission) {
  return getAdminPermissions(role).includes(permission);
}

/**
 * Return whether an email is one of the protected Founder
 * identities.
 */
function isProtectedFounderEmail(email) {
  return isFounderAdminEmail(email);
}

module.exports = {
  FOUNDER_ADMIN_EMAILS,
  ADMIN_ROLES,
  ADMIN_PERMISSIONS,
  ROLE_PERMISSIONS,

  normalizeEmail,
  isFounderAdminEmail,
  getFounderAdminRole,
  isAdminRole,
  getAdminPermissions,
  hasAdminPermission,
  isProtectedFounderEmail,
};

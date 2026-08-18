'use strict';

const express = require('express');

const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const {
  requestFounderPasswordSetup,
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');

// ============================================================
// PUBLIC AUTH ROUTES
// ============================================================

/**
 * Register a new customer or driver.
 *
 * POST /auth/register
 */
router.post('/register', register);

/**
 * Login customer, driver, or authorized administrator.
 *
 * POST /auth/login
 */
router.post('/login', login);

/**
 * Request password setup for an authorized Founder Admin.
 *
 * The email must belong to one of the protected Founder Admin
 * email addresses configured in:
 *
 * backend/admin/founderAdmin.js
 *
 * POST /auth/admin/request-password-setup
 */
router.post(
  '/admin/request-password-setup',
  requestFounderPasswordSetup
);

// ============================================================
// PROTECTED AUTH ROUTES
// ============================================================

/**
 * Get the currently authenticated user's profile.
 *
 * GET /auth/me
 */
router.get(
  '/me',
  protect,
  getMe
);

/**
 * Get the currently authenticated user's profile.
 *
 * This route is kept as an alias for frontend compatibility.
 *
 * GET /auth/profile
 */
router.get(
  '/profile',
  protect,
  getMe
);

/**
 * Update the currently authenticated user's profile.
 *
 * PUT /auth/profile
 */
router.put(
  '/profile',
  protect,
  updateProfile
);

/**
 * Change the password of the currently authenticated user.
 *
 * PUT /auth/update-password
 */
router.put(
  '/update-password',
  protect,
  updatePassword
);

/**
 * Request a normal password reset.
 *
 * POST /auth/forgot-password
 */
router.post(
  '/forgot-password',
  forgotPassword
);

/**
 * Complete a normal password reset.
 *
 * POST /auth/reset-password
 */
router.post(
  '/reset-password',
  resetPassword
);

/**
 * Sign out the currently authenticated user.
 *
 * JWT authentication is stateless. The frontend should remove
 * the stored authentication token after receiving this response.
 *
 * POST /auth/signout
 */
router.post(
  '/signout',
  protect,
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: 'Signed out successfully.',
    });
  }
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;

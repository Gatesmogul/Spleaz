'use strict';

const express = require('express');

const router = express.Router();

// ============================================================
// CONTROLLERS
// ============================================================

const {
  toggleOnlineStatus,
  updateLocation,
  getNearbyRideRequests,
  acceptRide,
  updateTripStatus,
  getCompletedTrips,
  getDriverEarnings,
  getDriverReceipts,
  uploadCommissionReceipt,
} = require('../controllers/driverController');

// ============================================================
// MIDDLEWARE
// ============================================================

const {
  protect,
  authorize,
} = require('../middleware/authMiddleware');

const {
  uploadSingleFile,
} = require('../middleware/uploadMiddleware');

// ============================================================
// DRIVER AUTHENTICATION
// ============================================================
//
// Every route in this file requires:
// 1. A valid authenticated user.
// 2. The authenticated user must have the driver role.
//
// ============================================================

router.use(
  protect,
  authorize('driver')
);

// ============================================================
// DRIVER ONLINE / OFFLINE STATUS
// ============================================================

/**
 * PUT /api/drivers/toggle-status
 *
 * Toggle driver online/offline status.
 */
router.put(
  '/toggle-status',
  toggleOnlineStatus
);

/**
 * POST /api/drivers/status
 *
 * Compatibility alias for the frontend.
 */
router.post(
  '/status',
  toggleOnlineStatus
);

// ============================================================
// DRIVER LOCATION
// ============================================================

/**
 * PUT /api/drivers/location
 *
 * Update the driver's current location.
 */
router.put(
  '/location',
  updateLocation
);

// ============================================================
// RIDE REQUESTS
// ============================================================

/**
 * GET /api/drivers/requests
 *
 * Get nearby ride requests.
 */
router.get(
  '/requests',
  getNearbyRideRequests
);

/**
 * GET /api/drivers/ride-offers
 *
 * Compatibility alias for nearby ride requests.
 */
router.get(
  '/ride-offers',
  getNearbyRideRequests
);

// ============================================================
// RIDE MANAGEMENT
// ============================================================

/**
 * POST /api/drivers/accept-ride
 *
 * Accept a ride request.
 */
router.post(
  '/accept-ride',
  acceptRide
);

/**
 * PATCH /api/drivers/update-trip-status
 *
 * Update the current trip status.
 */
router.patch(
  '/update-trip-status',
  updateTripStatus
);

// ============================================================
// COMPLETED TRIPS
// ============================================================

/**
 * GET /api/drivers/trips/completed
 *
 * Get completed trips for the authenticated driver.
 */
router.get(
  '/trips/completed',
  getCompletedTrips
);

// ============================================================
// DRIVER EARNINGS
// ============================================================

/**
 * GET /api/drivers/account/summary
 *
 * Get driver account earnings summary.
 */
router.get(
  '/account/summary',
  getDriverEarnings
);

/**
 * GET /api/drivers/earnings
 *
 * Compatibility alias for driver earnings.
 */
router.get(
  '/earnings',
  getDriverEarnings
);

// ============================================================
// COMMISSION RECEIPTS
// ============================================================

/**
 * GET /api/drivers/receipts
 *
 * Get driver commission receipts.
 */
router.get(
  '/receipts',
  getDriverReceipts
);

/**
 * GET /api/drivers/commission/receipts
 *
 * Compatibility alias for driver commission receipts.
 */
router.get(
  '/commission/receipts',
  getDriverReceipts
);

/**
 * POST /api/drivers/receipt
 *
 * Upload a commission payment receipt.
 *
 * Expected multipart/form-data field:
 * receipt
 */
router.post(
  '/receipt',
  uploadSingleFile('receipt'),

  (req, res, next) => {
    if (
      req.file &&
      req.file.storedUrl
    ) {
      req.body.receiptUrl =
        req.file.storedUrl;
    }

    return next();
  },

  uploadCommissionReceipt
);

/**
 * POST /api/drivers/commission-receipt
 *
 * Compatibility endpoint for uploading
 * a commission payment receipt.
 */
router.post(
  '/commission-receipt',
  uploadSingleFile('receipt'),

  (req, res, next) => {
    if (
      req.file &&
      req.file.storedUrl
    ) {
      req.body.receiptUrl =
        req.file.storedUrl;
    }

    return next();
  },

  uploadCommissionReceipt
);

/**
 * POST /api/drivers/commission/upload-receipt
 *
 * Primary commission receipt upload endpoint.
 *
 * Expected multipart/form-data field:
 * receipt
 */
router.post(
  '/commission/upload-receipt',
  uploadSingleFile('receipt'),

  (req, res, next) => {
    if (
      req.file &&
      req.file.storedUrl
    ) {
      req.body.receiptUrl =
        req.file.storedUrl;
    }

    return next();
  },

  uploadCommissionReceipt
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;

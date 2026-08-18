const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

// Define directory for storing uploaded receipts.
const uploadDir = path.join(__dirname, '../../uploads/receipts');

// Ensure upload directory exists synchronously on startup.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================================
// UPLOAD MODERATION DEFAULTS
// ============================================================

/**
 * Default moderation information for every newly uploaded file.
 *
 * IMPORTANT:
 * These values are attached to the upload request/file.
 * The actual database fields should also exist in the relevant
 * Mongoose model/schema.
 */
const uploadModerationDefaults = {
  uploadStatus: 'pending',
  moderationReason: null,
  moderatedBy: null,
  moderatedAt: null,
};

// ============================================================
// MULTER STORAGE
// ============================================================

/**
 * Configure Multer Disk Storage Engine.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    // Generate unique filename:
    // receipt-driverId-timestamp-random.ext

    const driverId = req.user?.id || 'unknown';

    const uniqueSuffix = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}`;

    const fileExt = path
      .extname(file.originalname)
      .toLowerCase();

    cb(
      null,
      `receipt-${driverId}-${uniqueSuffix}${fileExt}`
    );
  },
});

// ============================================================
// FILE FILTER
// ============================================================

/**
 * Strictly enforce valid image/document types.
 *
 * Allowed:
 * - JPEG
 * - JPG
 * - PNG
 * - WEBP
 * - PDF
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error(
      'Invalid file type. Only JPEG, JPG, PNG, WEBP images and PDF documents are allowed.'
    ),
    false
  );
};

// ============================================================
// MULTER INSTANCE
// ============================================================

/**
 * Multer upload configuration.
 *
 * Maximum file size: 

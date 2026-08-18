'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

// Directory used to store uploaded receipts.
const uploadDir = path.join(
  __dirname,
  '../../uploads/receipts'
);

// Ensure the directory exists when the server starts.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// ============================================================
// UPLOAD MODERATION DEFAULTS
// ============================================================

/**
 * Default moderation information attached to
 * newly uploaded files.
 *
 * IMPORTANT:
 * These values are request/file metadata only.
 * The actual moderation fields must also exist
 * in the relevant Mongoose schema.
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    // Get authenticated driver ID when available.
    const driverId =
      req.user && req.user.id
        ? req.user.id
        : 'unknown';

    // Generate a unique filename.
    const uniqueSuffix = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}`;

    // Preserve the original file extension.
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
 * Only allow supported receipt/document formats.
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
 * Maximum file size: 5 MB.
 */
const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ============================================================
// SINGLE FILE UPLOAD MIDDLEWARE
// ============================================================

/**
 * Handle a single file upload.
 *
 * Example:
 *
 * router.post(
 *   '/commission/receipt',
 *   protect,
 *   uploadSingleFile('receipt'),
 *   controller
 * );
 *
 * @param {string} fieldName
 * @returns {Function}
 */
const uploadSingleFile = (fieldName) => {
  if (
    !fieldName ||
    typeof fieldName !== 'string'
  ) {
    throw new TypeError(
      'uploadSingleFile requires a valid field name.'
    );
  }

  return (req, res, next) => {
    const uploadHandler =
      upload.single(fieldName);

    uploadHandler(
      req,
      res,
      (err) => {
        // ====================================================
        // MULTER ERROR
        // ====================================================

        if (err instanceof multer.MulterError) {
          if (
            err.code ===
            'LIMIT_FILE_SIZE'
          ) {
            return res.status(400).json({
              success: false,
              message:
                'File size exceeds the 5MB maximum limit.',
            });
          }

          return res.status(400).json({
            success: false,
            message:
              `Upload error: ${err.message}`,
          });
        }

        // ====================================================
        // FILE FILTER / OTHER ERROR
        // ====================================================

        if (err) {
          return res.status(400).json({
            success: false,
            message:
              err.message ||
              'An error occurred while uploading the file.',
          });
        }

        // ====================================================
        // FILE REQUIRED
        // ====================================================

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message:
              `Please upload a file in the '${fieldName}' field.`,
          });
        }

        // ====================================================
        // STORED FILE URL
        // ====================================================

        req.file.storedUrl =
          `/uploads/receipts/${req.file.filename}`;

        // ====================================================
        // MODERATION DEFAULTS
        // ====================================================

        req.file.uploadStatus =
          uploadModerationDefaults.uploadStatus;

        req.file.moderationReason =
          uploadModerationDefaults.moderationReason;

        req.file.moderatedBy =
          uploadModerationDefaults.moderatedBy;

        req.file.moderatedAt =
          uploadModerationDefaults.moderatedAt;

        // Continue to the controller.
        return next();
      }
    );
  };
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  upload,
  uploadSingleFile,
  uploadDir,
  uploadModerationDefaults,
};

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define directory for storing uploaded receipts
const uploadDir = path.join(__dirname, '../../uploads/receipts');

// Ensure upload directory exists synchronously on startup
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configure Multer Disk Storage Engine
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: receipt-driverId-timestamp.ext
    const driverId = req.user ? req.user.id : 'unknown';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `receipt-${driverId}-${uniqueSuffix}${fileExt}`);
  },
});

/**
 * File Filter to strictly enforce valid image file types (JPEG, JPG, PNG, WEBP, PDF)
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
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, JPG, PNG, WEBP images and PDF documents are allowed.'
      ),
      false
    );
  }
};

/**
 * Multer Instance with 5MB file size limit
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
});

/**
 * Express Middleware Wrapper for single file uploads with seamless error handling
 * 
 * @param {string} fieldName - Form field name expecting the file (e.g. 'receipt')
 */
const uploadSingleFile = (fieldName) => {
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldName);

    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific upload error (e.g., file too large)
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds the 5MB maximum limit.',
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        // Custom filter or unknown error
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: `Please upload a file in the '${fieldName}' field.`,
        });
      }

      // Constructs local URL path to be stored in DB
      req.file.storedUrl = `/uploads/receipts/${req.file.filename}`;
      next();
    });
  };
};

module.exports = {
  upload,
  uploadSingleFile,
};
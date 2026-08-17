const ApiError = require('../utils/ApiError');

/**
 * Global Error Handling Middleware for Express.
 * Catches all errors passed down from controllers (via next(err)) or unhandled exceptions.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error stack trace for debugging in development/server logs
  console.error('[Global Error Handler]:', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // 1. Mongoose Invalid ObjectId Error (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with ID: ${err.value}`;
    error = new ApiError(404, message);
  }

  // 2. Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    const message = `Duplicate value entered for ${field}: "${value}". Please use another value.`;
    error = new ApiError(409, message);
  }

  // 3. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error = new ApiError(400, `Validation Failed: ${message}`);
  }

  // 4. JWT JsonWebTokenError (Invalid signature)
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid authentication token. Access denied.';
    error = new ApiError(401, message);
  }

  // 5. JWT TokenExpiredError
  if (err.name === 'TokenExpiredError') {
    const message = 'Authentication token has expired. Please log in again.';
    error = new ApiError(401, message);
  }

  // Final Response Formatting
  const statusCode = error.statusCode || 500;
  const responseMessage = error.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message: responseMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Route Not Found Middleware.
 * Place before errorHandler in server.js to catch unhandled endpoint hits.
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Cannot ${req.method} ${req.originalUrl} - Route not found on Spleaz backend server.`);
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
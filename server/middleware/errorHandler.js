// Global Error Handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'The requested resource was not found. Please verify the link and try again.';
    return res.status(404).json({
      success: false,
      message
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    return res.status(400).json({
      success: false,
      message
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Some details are invalid. Please correct the highlighted fields and try again.',
      errors: messages
    });
  }

  // Too many requests
  if (err.status === 429 || err.statusCode === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests right now. Please wait a moment and try again.'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Your session is invalid. Please login again.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please login again.'
    });
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message:
      error.message ||
      'Something went wrong on our side. Please retry in a moment. If the issue persists, contact support.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Not Found Handler
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `The endpoint ${req.originalUrl} does not exist. Please check the route path or HTTP method.`
  });
};

// Async Handler Wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};

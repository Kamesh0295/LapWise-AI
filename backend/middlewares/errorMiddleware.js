const { AppError } = require('../utils/AppError');

/**
 * Custom error logging in development environment
 */
const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status || 'error',
    message: err.message,
    stack: err.stack,
    error: err
  });
};

/**
 * Client-safe error formatting in production environment
 */
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send user-friendly message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors || undefined // Include validation issues if present
    });
  }

  // Programming or unknown system error: do not leak details to client
  console.error('SYSTEM ERROR 💥:', err);
  res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong on our server. Please try again later.'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific MongoDB errors
  if (err.name === 'CastError') {
    err = new AppError(`Invalid value for ${err.path}: ${err.value}`, 400);
  }
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    err = new AppError(`Duplicate field value: '${err.keyValue[key]}'. Please use another ${key}.`, 400);
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(el => el.message);
    err = new AppError(`Validation failed: ${messages.join('. ')}`, 400);
  }
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid authentication token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    err = new AppError('Your authentication token has expired. Please log in again.', 401);
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    sendErrorProd(err, req, res);
  }
};

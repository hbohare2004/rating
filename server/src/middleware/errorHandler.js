const { errorResponse } = require('../utils/response');

/**
 * Global error handling middleware.
 * Catches unhandled errors and returns a consistent response.
 */
function errorHandler(err, req, res, _next) {
  console.error('Unhandled error:', err.message);
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'An unexpected error occurred. Please try again later.' : err.message;
  return errorResponse(res, message, statusCode);
}

module.exports = { errorHandler };

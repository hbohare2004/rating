/**
 * Sends a consistent success response.
 */
function successResponse(res, message, data = null, statusCode = 200) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
}

/**
 * Sends a consistent error response.
 */
function errorResponse(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, message });
}

module.exports = { successResponse, errorResponse };

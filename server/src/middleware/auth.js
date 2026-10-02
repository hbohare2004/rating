const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

/**
 * Verifies the JWT token from the Authorization header.
 * Attaches decoded user info to req.user.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return errorResponse(res, 'Authentication required. Please log in.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token. Please log in again.', 401);
  }
}

/**
 * Creates middleware that restricts access to specified roles.
 * @param  {...string} roles - Allowed roles (e.g., 'ADMIN', 'USER', 'STORE_OWNER')
 */
function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 'You do not have permission to access this resource.', 403);
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRole };

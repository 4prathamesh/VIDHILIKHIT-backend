const { verifyToken } = require('../utils/token');
const { error } = require('../utils/response');

/**
 * Middleware that authenticates incoming requests using Bearer JWT.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Authentication required. Bearer token missing.', null, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Access token has expired. Please log in again.', null, 401);
    }
    return error(res, 'Invalid access token.', null, 401);
  }
}

module.exports = authenticate;


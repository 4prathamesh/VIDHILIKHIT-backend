const { error } = require('../utils/response');

/**
 * Global error handling middleware.
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  // Body parser syntax error (invalid JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return error(res, 'Malformed JSON in request body.', null, 400);
  }

  // MySQL Duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return error(res, 'A record with this information already exists.', null, 409);
  }

  // App-specific business error with status code
  if (err.statusCode) {
    return error(res, err.message, err.errors || null, err.statusCode);
  }

  return error(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal error occurred.'
      : err.message,
    null,
    500
  );
}

module.exports = errorHandler;


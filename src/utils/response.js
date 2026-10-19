/**
 * Standardized API response utilities.
 */

function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
}

function error(res, message = 'Internal Server Error', errors = null, statusCode = 500) {
  const payload = {
    success: false,
    statusCode,
    message,
  };

  if (errors !== null) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  success,
  error,
};


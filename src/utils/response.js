// Assumption: Response envelope strictly follows { success, message, data, timestamp } per specification.
/**
 * Standardized API response utilities matching Vidhilikhit specification envelope:
 * {
 *   success: boolean,
 *   message: string,
 *   data: any,
 *   timestamp: string
 * }
 */

function success(res, data = null, message = 'Operation successful', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

function error(res, message = 'Internal Server Error', errors = null, statusCode = 500) {
  const payload = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
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

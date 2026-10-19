const { error } = require('../utils/response');

/**
 * Middleware factory for validating request data against a Joi schema.
 * @param {Object} schema - Joi schema object.
 * @param {string} source - 'body' | 'query' | 'params'
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error: validationError, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (validationError) {
      const formattedErrors = validationError.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));

      // Check if the validation failure is specifically about terms acceptance
      const termsError = formattedErrors.find((e) => e.field === 'termsAccepted');
      if (termsError) {
        return error(
          res,
          'Account creation rejected: Terms and conditions must be accepted.',
          formattedErrors,
          400
        );
      }

      return error(res, 'Validation error', formattedErrors, 422);
    }

    // Replace request payload with sanitized and validated values
    req[source] = value;
    next();
  };
}

module.exports = validate;


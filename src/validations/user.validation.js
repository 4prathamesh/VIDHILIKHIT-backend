const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Full name must have at least 2 characters.',
  }),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').allow(null, '').optional().messages({
    'any.only': 'Gender must be one of: male, female, other, prefer_not_to_say.',
  }),
  dob: Joi.string().isoDate().allow(null, '').optional().messages({
    'string.isoDate': 'Date of birth must be a valid ISO date (YYYY-MM-DD).',
  }),
  tobChoice: Joi.string().valid('exact', 'approximate', 'not_sure').optional().messages({
    'any.only': 'Time of birth choice must be exact, approximate, or not_sure.',
  }),
  tobTime: Joi.string().pattern(timeRegex).allow(null, '').when('tobChoice', {
    is: Joi.valid('exact', 'approximate'),
    then: Joi.string().pattern(timeRegex).required().messages({
      'any.required': 'Time of birth is required when exact or approximate is selected.',
      'string.pattern.base': 'Time of birth must be in HH:mm or HH:mm:ss format (e.g. 14:30:00).',
    }),
    otherwise: Joi.optional(),
  }),
  pob: Joi.string().trim().max(255).allow(null, '').optional().messages({
    'string.max': 'Place of birth cannot exceed 255 characters.',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update profile.',
});

module.exports = {
  updateProfileSchema,
};


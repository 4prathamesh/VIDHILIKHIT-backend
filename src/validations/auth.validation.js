const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

const birthDetailsSchema = Joi.object({
  dob: Joi.string().isoDate().allow(null, '').optional().messages({
    'string.isoDate': 'Date of birth must be a valid ISO date (YYYY-MM-DD).',
  }),
  tobChoice: Joi.string().valid('exact', 'approximate', 'not_sure').default('not_sure').messages({
    'any.only': 'Time of birth choice must be either exact, approximate, or not_sure.',
  }),
  tobTime: Joi.string().pattern(timeRegex).allow(null, '').when('tobChoice', {
    is: Joi.valid('exact', 'approximate'),
    then: Joi.string().pattern(timeRegex).required().messages({
      'any.required': 'Time of birth is required when exact or approximate is selected.',
      'string.pattern.base': 'Time of birth must be in HH:mm or HH:mm:ss format (e.g. 14:30:00).',
    }),
    otherwise: Joi.optional(),
  }),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').allow(null, '').optional(),
  pob: Joi.string().max(255).allow(null, '').optional(),
});

const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Full name is required.',
    'string.min': 'Full name must have at least 2 characters.',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Email must be a valid email address.',
  }),
  mobileNumber: Joi.string().trim().min(7).max(20).required().messages({
    'string.empty': 'Mobile number is required.',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.empty': 'Password is required.',
    'string.min': 'Password must be at least 6 characters long.',
  }),
  termsAccepted: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must accept the terms and conditions to create an account.',
    'any.required': 'Terms acceptance is required.',
  }),
  birthDetails: birthDetailsSchema.optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Please provide a valid email address.',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required.',
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Please provide a valid email address.',
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    'string.empty': 'Reset token is required.',
  }),
  newPassword: Joi.string().min(6).max(100).required().messages({
    'string.empty': 'New password is required.',
    'string.min': 'New password must be at least 6 characters long.',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};


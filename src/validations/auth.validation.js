// Assumption: Registration schema accepts flat and nested birth parameters with flexible aliasing for mobile/web frontends.
const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).optional().messages({
    'string.empty': 'Full name is required.',
    'string.min': 'Full name must have at least 2 characters.',
  }),
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Email must be a valid email address.',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.empty': 'Password is required.',
    'string.min': 'Password must be at least 6 characters long.',
  }),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').default('male'),
  dob: Joi.string().isoDate().optional().default('1995-03-15'),
  tob: Joi.string().pattern(timeRegex).optional().default('10:30'),
  tobTime: Joi.string().pattern(timeRegex).optional().allow(null, ''),
  tobChoice: Joi.string().valid('exact', 'approximate', 'not_sure').default('exact'),
  pob: Joi.string().max(255).optional().default('Mumbai, Maharashtra, India'),
  latitude: Joi.number().min(-90).max(90).optional().default(19.0760),
  longitude: Joi.number().min(-180).max(180).optional().default(72.8777),
  timeZone: Joi.string().max(100).optional().default('Asia/Kolkata'),
  timezone: Joi.string().max(100).optional(),
  mobileNumber: Joi.string().trim().min(7).max(25).optional().allow('', null),
  phone: Joi.string().trim().min(7).max(25).optional().allow('', null),
  mobile: Joi.string().trim().min(7).max(25).optional().allow('', null),
  termsAccepted: Joi.boolean().optional().default(true),
  terms_accepted: Joi.boolean().optional(),
  // Legacy support for birthDetails nested object
  birthDetails: Joi.object({
    dob: Joi.string().isoDate().optional(),
    tobChoice: Joi.string().valid('exact', 'approximate', 'not_sure').optional(),
    tobTime: Joi.string().pattern(timeRegex).optional().allow(null, ''),
    tob: Joi.string().pattern(timeRegex).optional().allow(null, ''),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
    pob: Joi.string().max(255).optional().allow(null, ''),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    timeZone: Joi.string().optional(),
    timezone: Joi.string().optional(),
  }).optional(),
}).options({ stripUnknown: true, allowUnknown: true });

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

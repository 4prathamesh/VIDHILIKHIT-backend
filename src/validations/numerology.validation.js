// Assumption: Validates input parameters for Numerology calculations and compatibility checks.
const Joi = require('joi');

const calculateNumerologySchema = Joi.object({
  fullName: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Full name is required.',
  }),
  dob: Joi.string().isoDate().required().messages({
    'string.empty': 'Date of birth is required.',
    'string.isoDate': 'Date of birth must be a valid ISO date (YYYY-MM-DD).',
  }),
  targetYear: Joi.number().integer().min(1900).max(2150).optional().default(2026),
  system: Joi.string().valid('chaldean', 'pythagorean', 'vedic').optional().default('chaldean'),
  isTransliterationConfirmed: Joi.boolean().optional().default(true),
}).options({ stripUnknown: true, allowUnknown: true });

const compatibilitySchema = Joi.object({
  yourName: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Your name is required.',
  }),
  partnerName: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Partner name is required.',
  }),
  yourDob: Joi.string().isoDate().required().messages({
    'string.empty': 'Your date of birth is required.',
  }),
  partnerDob: Joi.string().isoDate().required().messages({
    'string.empty': 'Partner date of birth is required.',
  }),
  relationshipType: Joi.string().valid('romantic', 'business', 'friendship', 'marriage').optional().default('romantic'),
}).options({ stripUnknown: true, allowUnknown: true });

module.exports = {
  calculateNumerologySchema,
  compatibilitySchema,
};

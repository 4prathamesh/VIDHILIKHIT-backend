// Assumption: Profile validation handles flexible time strings and default coordinates.
const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

const createProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Profile name is required.',
  }),
  relationship: Joi.string().valid('self', 'spouse', 'father', 'mother', 'child', 'other').default('self'),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').default('male'),
  dob: Joi.string().isoDate().required().messages({
    'string.empty': 'Date of birth is required.',
  }),
  tob: Joi.string().pattern(timeRegex).required().messages({
    'string.empty': 'Time of birth is required.',
  }),
  tobChoice: Joi.string().valid('exact', 'approximate', 'not_sure').default('exact'),
  pob: Joi.string().trim().max(255).required().messages({
    'string.empty': 'Place of birth is required.',
  }),
  latitude: Joi.number().min(-90).max(90).optional().default(19.0760),
  longitude: Joi.number().min(-180).max(180).optional().default(72.8777),
  timeZone: Joi.string().max(100).optional().default('Asia/Kolkata'),
  avatarUrl: Joi.string().uri().optional(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  relationship: Joi.string().valid('self', 'spouse', 'father', 'mother', 'child', 'other').optional(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
  dob: Joi.string().isoDate().optional(),
  tob: Joi.string().pattern(timeRegex).optional(),
  tobChoice: Joi.string().valid('exact', 'approximate', 'not_sure').optional(),
  pob: Joi.string().trim().max(255).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  timeZone: Joi.string().max(100).optional(),
  avatarUrl: Joi.string().uri().optional(),
}).min(1);

module.exports = {
  createProfileSchema,
  updateProfileSchema,
};


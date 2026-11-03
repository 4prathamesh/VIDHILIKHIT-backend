// Assumption: Matchmaking payload validates both individuals' birth coordinates and times, supporting person1/person2 as well as boy/girl/groom/bride aliases.
const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

const personSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Person name is required.',
    'any.required': 'Person name is required.',
  }),
  gender: Joi.string().valid('male', 'female', 'other', 'boy', 'girl').optional(),
  dob: Joi.string().isoDate().required().messages({
    'any.required': 'Date of birth (dob) is required in YYYY-MM-DD format.',
  }),
  tob: Joi.string().pattern(timeRegex).optional().default('12:00'),
  tobTime: Joi.string().pattern(timeRegex).optional(),
  tobChoice: Joi.string().valid('exact', 'approximate', 'not_sure').optional().default('exact'),
  pob: Joi.string().trim().optional().default('Mumbai, Maharashtra, India'),
  latitude: Joi.number().min(-90).max(90).optional().default(19.0760),
  longitude: Joi.number().min(-180).max(180).optional().default(72.8777),
  timeZone: Joi.string().optional().default('Asia/Kolkata'),
});

const calculateMatchSchema = Joi.object({
  person1: personSchema.optional(),
  person2: personSchema.optional(),
  boy: personSchema.optional(),
  girl: personSchema.optional(),
  groom: personSchema.optional(),
  bride: personSchema.optional(),
  male: personSchema.optional(),
  female: personSchema.optional(),
}).custom((value, helpers) => {
  const p1 = value.person1 || value.girl || value.bride || value.female || value.boy;
  const p2 = value.person2 || value.boy || value.groom || value.male || value.girl;

  if (!p1 || !p2) {
    return helpers.message('Please provide either { person1, person2 } or { boy, girl } with required birth details.');
  }

  return value;
});

module.exports = {
  calculateMatchSchema,
};

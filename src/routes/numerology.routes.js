// Assumption: /numerology routes support both authenticated sessions and public calculation parameters.
const express = require('express');
const numerologyController = require('../controllers/numerology.controller');
const validate = require('../middlewares/validate.middleware');
const { calculateNumerologySchema, compatibilitySchema } = require('../validations/numerology.validation');
const { verifyToken } = require('../utils/token');

const router = express.Router();

function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (err) {
      // continue without user
    }
  }
  next();
}

router.use(optionalAuthenticate);

/**
 * @route   POST /api/v1/numerology/calculate
 * @desc    Computes full numerology profile from name and DOB (Screen 3 & 4)
 * @access  Public / Token-assisted
 */
router.post('/calculate', validate(calculateNumerologySchema), (req, res, next) => {
  numerologyController.calculateProfile(req, res, next);
});

/**
 * @route   GET /api/v1/numerology/profile
 * @desc    Fetches active profile's Golden Trio and current cycles (Screen 4)
 * @access  Public / Token-assisted
 */
router.get('/profile', (req, res, next) => {
  numerologyController.getProfile(req, res, next);
});

/**
 * @route   GET /api/v1/numerology/destiny/:number
 * @desc    Destiny Number & Life Path Deep Analysis (Screen 5)
 * @access  Public / Token-assisted
 */
router.get('/destiny/:number', (req, res, next) => {
  numerologyController.getDestinyDetail(req, res, next);
});

/**
 * @route   GET /api/v1/numerology/core-numbers
 * @desc    Core Numbers Summary (Screen 6)
 * @access  Public / Token-assisted
 */
router.get('/core-numbers', (req, res, next) => {
  numerologyController.getCoreNumbers(req, res, next);
});

/**
 * @route   GET /api/v1/numerology/calculation-breakdown
 * @desc    Calculation Breakdown with letter-by-letter Chaldean values (Screen 7)
 * @access  Public / Token-assisted
 */
router.get('/calculation-breakdown', (req, res, next) => {
  numerologyController.getCalculationBreakdown(req, res, next);
});

/**
 * @route   GET /api/v1/numerology/personal-cycles
 * @desc    Personal Cycles & Yearly Forecast (Screen 8)
 * @access  Public / Token-assisted
 */
router.get('/personal-cycles', (req, res, next) => {
  numerologyController.getPersonalCycles(req, res, next);
});

/**
 * @route   GET /api/v1/numerology/kundali-alignment
 * @desc    Numerology & Kundali Planetary Synergy (Screen 9)
 * @access  Public / Token-assisted
 */
router.get('/kundali-alignment', (req, res, next) => {
  numerologyController.getKundaliAlignment(req, res, next);
});

/**
 * @route   POST /api/v1/numerology/compatibility
 * @desc    Numerology Compatibility Analysis across 3 Pillars (Screen 10)
 * @access  Public / Token-assisted
 */
router.post('/compatibility', validate(compatibilitySchema), (req, res, next) => {
  numerologyController.calculateCompatibility(req, res, next);
});

module.exports = router;

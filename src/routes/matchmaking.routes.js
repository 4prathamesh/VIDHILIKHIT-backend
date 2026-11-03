// Assumption: Matchmaking endpoints can be accessed with authentication.
const express = require('express');
const matchmakingController = require('../controllers/matchmaking.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { calculateMatchSchema } = require('../validations/matchmaking.validation');

const router = express.Router();

router.use(authenticate);

/**
 * @route   POST /api/v1/matchmaking/calculate
 * @desc    Calculate compatibility report
 * @access  Private
 */
router.post('/calculate', validate(calculateMatchSchema), (req, res, next) => {
  matchmakingController.calculateMatch(req, res, next);
});

/**
 * @route   GET /api/v1/matchmaking/:matchId/details
 * @desc    Get detailed Ashtakoota breakdown and 7 aspects
 * @access  Private
 */
router.get('/:matchId/details', (req, res, next) => {
  matchmakingController.getMatchDetails(req, res, next);
});

module.exports = router;


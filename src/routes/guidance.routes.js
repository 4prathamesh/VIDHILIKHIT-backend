// Assumption: /guidance routes provide Vedic forecast and panchang.
const express = require('express');
const guidanceController = require('../controllers/guidance.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/v1/guidance/forecast
 * @desc    Get daily guidance and panchang by timeframe
 * @access  Private
 */
router.get('/forecast', (req, res, next) => guidanceController.getForecast(req, res, next));

module.exports = router;


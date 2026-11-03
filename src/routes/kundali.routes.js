// Assumption: /kundali routes require authentication except chart SVG rendering.
const express = require('express');
const kundaliController = require('../controllers/kundali.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/v1/kundali/chart-render/:varga.svg
 * @desc    Renders Vedic astrology chart SVG image
 * @access  Public / Token-assisted
 */
router.get('/chart-render/:varga', (req, res, next) => {
  kundaliController.renderChartSvg(req, res, next);
});

// Protected calculation routes
router.use(authenticate);

/**
 * @route   GET /api/v1/kundali/overview
 * @desc    Get overview & Kundali Lagna chart
 * @access  Private
 */
router.get('/overview', (req, res, next) => kundaliController.getOverview(req, res, next));

/**
 * @route   GET /api/v1/kundali/grahas
 * @desc    Get 9 planetary positions with signs, houses, dignities
 * @access  Private
 */
router.get('/grahas', (req, res, next) => kundaliController.getGrahas(req, res, next));

/**
 * @route   GET /api/v1/kundali/bhavas
 * @desc    Get 12 houses analysis
 * @access  Private
 */
router.get('/bhavas', (req, res, next) => kundaliController.getBhavas(req, res, next));

/**
 * @route   GET /api/v1/kundali/vargas
 * @desc    Get divisional charts (D1, D9, D10, D7, D4, D12)
 * @access  Private
 */
router.get('/vargas', (req, res, next) => kundaliController.getVargas(req, res, next));

/**
 * @route   GET /api/v1/kundali/yogas
 * @desc    Get detected auspicious & important yogas
 * @access  Private
 */
router.get('/yogas', (req, res, next) => kundaliController.getYogas(req, res, next));

/**
 * @route   GET /api/v1/kundali/dasha
 * @desc    Get Vimshottari Mahadasha, Antardasha & upcoming timelines
 * @access  Private
 */
router.get('/dasha', (req, res, next) => kundaliController.getDasha(req, res, next));

module.exports = router;


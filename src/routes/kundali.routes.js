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

/**
 * @route   GET /api/v1/kundali/strengths
 * @desc    Get Shadbala (virupas, rupas, requiredRupas, ratio, rank, ishtaPhala) & Bhavbala
 * @access  Private
 */
router.get('/strengths', (req, res, next) => kundaliController.getStrengths(req, res, next));

/**
 * @route   GET /api/v1/kundali/transits
 * @desc    Get Lagna & Moon transit charts and transiting planets
 * @access  Private
 */
router.get('/transits', (req, res, next) => kundaliController.getTransits(req, res, next));

/**
 * @route   GET /api/v1/kundali/kp
 * @desc    Get KP Bhav Chalit chart, Ruling Planets, KP Planets with Sub-Lords, KP Cusps
 * @access  Private
 */
router.get('/kp', (req, res, next) => kundaliController.getKp(req, res, next));

/**
 * @route   GET /api/v1/kundali/ashtakavarga
 * @desc    Get Sarvashtakavarga (SAV) & Bhinna Ashtakavarga (BAV) for 7 planets
 * @access  Private
 */
router.get('/ashtakavarga', (req, res, next) => kundaliController.getAshtakavarga(req, res, next));

/**
 * @route   GET /api/v1/kundali/doshas
 * @desc    Get Manglik, Kalsarpa & Sade Sati analysis
 * @access  Private
 */
router.get('/doshas', (req, res, next) => kundaliController.getDoshas(req, res, next));

/**
 * @route   GET /api/v1/kundali/recommendations
 * @desc    Get Mukhi Rudraksha and Life, Lucky, Fortune Gemstones
 * @access  Private
 */
router.get('/recommendations', (req, res, next) => kundaliController.getRecommendations(req, res, next));

/**
 * @route   POST /api/v1/kundali/report/generate
 * @desc    Queue 55-page full Kundali PDF generation
 * @access  Private
 */
router.post('/report/generate', (req, res, next) => kundaliController.generateReport(req, res, next));

/**
 * @route   GET /api/v1/kundali/report/:reportId/status
 * @desc    Get PDF report generation status
 * @access  Private
 */
router.get('/report/:reportId/status', (req, res, next) => kundaliController.getReportStatus(req, res, next));

/**
 * @route   GET /api/v1/kundali/reports
 * @desc    Get paginated PDF reports history
 * @access  Private
 */
router.get('/reports', (req, res, next) => kundaliController.getReports(req, res, next));

module.exports = router;


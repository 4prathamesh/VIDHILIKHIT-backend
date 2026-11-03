// Assumption: /reports endpoints require Bearer JWT authentication.
const express = require('express');
const reportController = require('../controllers/report.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/v1/reports/catalog
 * @desc    Get available reports catalog with pricing
 * @access  Private
 */
router.get('/catalog', (req, res) => reportController.getCatalog(req, res));

/**
 * @route   POST /api/v1/reports/generate
 * @desc    Request report generation
 * @access  Private
 */
router.post('/generate', (req, res, next) => reportController.generateReport(req, res, next));

/**
 * @route   GET /api/v1/reports/status/:reportJobId
 * @desc    Check report status & download URL
 * @access  Private
 */
router.get('/status/:reportJobId', (req, res, next) => reportController.getStatus(req, res, next));

module.exports = router;


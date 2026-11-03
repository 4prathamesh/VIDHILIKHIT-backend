// Assumption: /home routes mounted at /api/v1/home with Bearer token authentication.
const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/v1/home/dashboard
 * @desc    Get home dashboard summary
 * @access  Private
 */
router.get('/dashboard', dashboardController.getDashboard);

module.exports = router;


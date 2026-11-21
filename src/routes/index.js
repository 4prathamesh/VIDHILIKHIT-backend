// Assumption: All API routes mount under /api/v1 prefix as defined in the Vidhilikhit specification.
const express = require('express');
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const dashboardRoutes = require('./dashboard.routes');
const kundaliRoutes = require('./kundali.routes');
const matchmakingRoutes = require('./matchmaking.routes');
const guidanceRoutes = require('./guidance.routes');
const reportRoutes = require('./report.routes');
const numerologyRoutes = require('./numerology.routes');
const locationRoutes = require('./location.routes');
const userRoutes = require('./user.routes');
const authenticate = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vidhilikhit API is healthy and operational.',
    timestamp: new Date().toISOString(),
  });
});

// Spec flow modules
router.use('/auth', authRoutes);
router.get('/me', authenticate, authController.getMe);
router.use('/profiles', profileRoutes);
router.use('/home', dashboardRoutes);
router.use('/kundali', kundaliRoutes);
router.use('/matchmaking', matchmakingRoutes);
router.use('/guidance', guidanceRoutes);
router.use('/reports', reportRoutes);
router.use('/numerology', numerologyRoutes);
// AI Bot Context API closed by configuration (disabled unless ENABLE_AI_BOT=true)
if (process.env.ENABLE_AI_BOT === 'true') {
  const botRoutes = require('./bot.routes');
  router.use('/bot', botRoutes);
} else {
  router.use('/bot', (req, res) => {
    return res.status(503).json({
      success: false,
      message: 'AI Bot Context API is currently closed and disabled.',
      data: null,
      timestamp: new Date().toISOString(),
    });
  });
}
router.use('/locations', locationRoutes);

// Compatibility route
router.use('/users', userRoutes);

module.exports = router;

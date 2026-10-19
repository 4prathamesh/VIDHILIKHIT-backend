const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vidhilikhit API is healthy and operational.',
    timestamp: new Date().toISOString(),
  });
});

// Mount module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;


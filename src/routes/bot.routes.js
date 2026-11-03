// Assumption: /bot routes are authenticated with Bearer JWT token.
const express = require('express');
const botController = require('../controllers/bot.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/v1/bot/chat/history
 * @desc    Get active chat session history
 * @access  Private
 */
router.get('/chat/history', (req, res, next) => botController.getChatHistory(req, res, next));

/**
 * @route   POST /api/v1/bot/chat/send
 * @desc    Send message to Vidhilikhit Bot
 * @access  Private
 */
router.post('/chat/send', (req, res, next) => botController.sendMessage(req, res, next));

module.exports = router;


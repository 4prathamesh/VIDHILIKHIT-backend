const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validations/auth.validation');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Create new user account and birth profile
 * @access  Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user with email and password, return JWT
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Initiate password recovery by email
 * @access  Public
 */
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using verification token
 * @access  Public
 */
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

/**
 * @route   GET /api/v1/auth/oauth/google
 * @desc    Initiate Google OAuth 2.0 redirect
 * @access  Public
 */
router.get('/oauth/google', authController.googleAuth);

/**
 * @route   GET /api/v1/auth/oauth/google/callback
 * @desc    Handle Google OAuth 2.0 authorization code callback
 * @access  Public
 */
router.get('/oauth/google/callback', authController.googleCallback);

/**
 * @route   POST /api/v1/auth/oauth/google/token
 * @desc    OAuth 2.0 token/profile login for SPA, mobile, and API testing
 * @access  Public
 */
router.post('/oauth/google/token', authController.googleTokenAuth);

module.exports = router;


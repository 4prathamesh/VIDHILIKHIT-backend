// Assumption: AuthController handles register, login, forgot-password, reset-password, and OAuth endpoints per spec.
const authService = require('../services/auth.service');
const { success } = require('../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return success(res, result, 'User registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return success(res, result, 'Login successful', 200);
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return success(res, result, result.message, 200);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      return success(res, null, result.message, 200);
    } catch (err) {
      next(err);
    }
  }

  async googleAuth(req, res, next) {
    try {
      const authUrl = authService.getGoogleAuthUrl();
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return success(res, { authUrl }, 'Google OAuth authorization URL', 200);
      }
      return res.redirect(authUrl);
    } catch (err) {
      next(err);
    }
  }

  async googleCallback(req, res, next) {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ success: false, message: 'Missing authorization code.' });
      }

      const result = await authService.handleGoogleCallback(code);
      return success(res, result, 'Google authentication successful.', 200);
    } catch (err) {
      next(err);
    }
  }

  async googleTokenAuth(req, res, next) {
    try {
      const { email, name, providerId } = req.body;
      if (!email || !providerId) {
        return res.status(400).json({
          success: false,
          message: 'Both email and providerId are required.',
        });
      }

      const result = await authService.loginWithOAuthProfile({
        provider: 'google',
        providerId,
        email,
        name,
      });

      return success(res, result, 'Google OAuth login successful.', 200);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await authService.getMe(userId);
      return success(res, result, 'User profile retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();

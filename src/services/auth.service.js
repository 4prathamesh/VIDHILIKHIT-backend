const bcrypt = require('bcryptjs');
const userDao = require('../daos/user.dao');
const passwordResetDao = require('../daos/passwordReset.dao');
const emailService = require('./email.service');
const { signToken, generateRandomToken, hashString } = require('../utils/token');
const config = require('../config/env');

class AuthService {
  /**
   * Registers a new user and creates their birth details profile.
   */
  async register(data) {
    const { fullName, email, mobileNumber, password, termsAccepted, birthDetails = {} } = data;

    // Strict terms check
    if (termsAccepted !== true) {
      const err = new Error('You must accept the terms and conditions to create an account.');
      err.statusCode = 400;
      throw err;
    }

    // Check if email already registered
    const existing = await userDao.findByEmail(email);
    if (existing) {
      const err = new Error('An account with this email address already exists.');
      err.statusCode = 409;
      throw err;
    }

    // Hash password with bcrypt
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Normalize Time of Birth
    const tobChoice = birthDetails.tobChoice || 'not_sure';
    const tobTime = tobChoice === 'not_sure' ? null : (birthDetails.tobTime || null);

    const profilePayload = {
      dob: birthDetails.dob || null,
      tobChoice,
      tobTime,
      gender: birthDetails.gender || null,
      pob: birthDetails.pob || null,
    };

    const userPayload = {
      fullName,
      email,
      mobileNumber,
      passwordHash,
      termsAccepted: true,
      authProvider: 'local',
      providerId: null,
    };

    const userId = await userDao.createUserWithProfile(userPayload, profilePayload);

    // Fetch newly created user profile
    const userProfile = await userDao.findUserWithProfileById(userId);

    // Generate JWT token
    const token = signToken({
      userId: userProfile.id,
      email: userProfile.email,
    });

    return {
      user: {
        id: userProfile.id,
        fullName: userProfile.fullName,
        email: userProfile.email,
        mobileNumber: userProfile.mobileNumber,
        termsAccepted: Boolean(userProfile.termsAccepted),
        termsAcceptedAt: userProfile.termsAcceptedAt,
        authProvider: userProfile.authProvider,
        createdAt: userProfile.createdAt,
        birthDetails: {
          dob: userProfile.dob,
          tobChoice: userProfile.tobChoice,
          tobTime: userProfile.tobTime,
          gender: userProfile.gender,
          pob: userProfile.pob,
        },
      },
      token,
    };
  }

  /**
   * Logs in a user with email and password, returning a JWT.
   */
  async login(email, password) {
    const user = await userDao.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    if (!user.password_hash) {
      const err = new Error(
        `This account was created using ${user.auth_provider}. Please sign in with ${user.auth_provider}.`
      );
      err.statusCode = 400;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const fullProfile = await userDao.findUserWithProfileById(user.id);

    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: fullProfile.id,
        fullName: fullProfile.fullName,
        email: fullProfile.email,
        mobileNumber: fullProfile.mobileNumber,
        termsAccepted: Boolean(fullProfile.termsAccepted),
        authProvider: fullProfile.authProvider,
        birthDetails: {
          dob: fullProfile.dob,
          tobChoice: fullProfile.tobChoice,
          tobTime: fullProfile.tobTime,
          gender: fullProfile.gender,
          pob: fullProfile.pob,
        },
      },
      token,
    };
  }

  /**
   * Initiates password recovery by email.
   */
  async forgotPassword(email) {
    const user = await userDao.findByEmail(email);

    // Prevent account enumeration: return success even if user not found
    if (!user) {
      return {
        message: 'If the provided email is registered, a password reset link has been dispatched.',
      };
    }

    const rawToken = generateRandomToken();
    const tokenHash = hashString(rawToken);
    await passwordResetDao.createResetToken(user.id, tokenHash, config.passwordReset.expiresInMinutes);
    // Dispatch email asynchronously so HTTP response is snappy
    emailService.sendPasswordResetEmail(user.email, rawToken).catch((err) => {
      console.warn('Email dispatch warning:', err.message);
    });

    const responseData = {
      message: 'If the provided email is registered, a password reset link has been dispatched.',
    };

    // In non-production environments, expose the token for direct Postman testing
    if (config.nodeEnv !== 'production') {
      responseData.devDebug = {
        rawToken,
        expiresInMinutes: config.passwordReset.expiresInMinutes,
      };
    }

    return responseData;
  }

  /**
   * Resets password using the received token.
   */
  async resetPassword(rawToken, newPassword) {
    const tokenHash = hashString(rawToken);
    const activeToken = await passwordResetDao.findValidToken(tokenHash);

    if (!activeToken) {
      const err = new Error('Password reset token is invalid or has expired.');
      err.statusCode = 400;
      throw err;
    }

    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await passwordResetDao.consumeTokenAndUpdatePassword(
      activeToken.user_id,
      newPasswordHash,
      activeToken.id
    );

    return {
      message: 'Password has been reset successfully. You may now log in with your new password.',
    };
  }

  /**
   * Generates Google OAuth consent screen redirect URL.
   */
  getGoogleAuthUrl() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: config.oauth.google.redirectUri,
      client_id: config.oauth.google.clientId,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  /**
   * Handles Google OAuth callback code exchange.
   */
  async handleGoogleCallback(code) {
    if (!config.oauth.google.clientId || !config.oauth.google.clientSecret) {
      const err = new Error('Google OAuth credentials are not configured in environment variables.');
      err.statusCode = 500;
      throw err;
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.oauth.google.clientId,
        client_secret: config.oauth.google.clientSecret,
        redirect_uri: config.oauth.google.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      const err = new Error(tokenData.error_description || 'Failed to exchange authorization code.');
      err.statusCode = 400;
      throw err;
    }

    // Fetch user info with access token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userResponse.json();
    if (!userResponse.ok) {
      const err = new Error('Failed to fetch user profile from Google.');
      err.statusCode = 400;
      throw err;
    }

    return await this._processOAuthUser({
      provider: 'google',
      providerId: googleUser.id,
      email: googleUser.email,
      name: googleUser.name || 'Google User',
    });
  }

  /**
   * Handles OAuth verification when receiving verified user info or id_token.
   */
  async loginWithOAuthProfile({ provider, providerId, email, name }) {
    return await this._processOAuthUser({
      provider: provider || 'google',
      providerId,
      email,
      name,
    });
  }

  /**
   * Internal helper to find or create an OAuth user and issue JWT.
   */
  async _processOAuthUser({ provider, providerId, email, name }) {
    let user = await userDao.findByProvider(provider, providerId);

    if (!user) {
      // Check if user exists by email
      const existingByEmail = await userDao.findByEmail(email);
      if (existingByEmail) {
        // Link account
        await userDao.linkOAuthProvider(existingByEmail.id, provider, providerId);
        user = existingByEmail;
      } else {
        // Create new user account with accepted terms for OAuth
        const newUserId = await userDao.createUserWithProfile(
          {
            fullName: name || 'OAuth User',
            email,
            mobileNumber: 'N/A',
            passwordHash: null,
            termsAccepted: true,
            authProvider: provider,
            providerId,
          },
          {
            tobChoice: 'not_sure',
            tobTime: null,
          }
        );
        user = await userDao.findById(newUserId);
      }
    }

    const fullProfile = await userDao.findUserWithProfileById(user.id);
    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: fullProfile.id,
        fullName: fullProfile.fullName,
        email: fullProfile.email,
        mobileNumber: fullProfile.mobileNumber,
        termsAccepted: Boolean(fullProfile.termsAccepted),
        authProvider: fullProfile.authProvider,
        birthDetails: {
          dob: fullProfile.dob,
          tobChoice: fullProfile.tobChoice,
          tobTime: fullProfile.tobTime,
          gender: fullProfile.gender,
          pob: fullProfile.pob,
        },
      },
      token,
    };
  }
}

module.exports = new AuthService();

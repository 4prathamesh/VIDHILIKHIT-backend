// Assumption: AuthService provides full spec compatibility while preserving backwards compatibility fields.
const bcrypt = require('bcryptjs');
const userDao = require('../daos/user.dao');
const profileDao = require('../daos/profile.dao');
const passwordResetDao = require('../daos/passwordReset.dao');
const emailService = require('./email.service');
const { signToken, signTokens, generateRandomToken, hashString } = require('../utils/token');
const config = require('../config/env');

class AuthService {
  /**
   * Registers a new user and creates their default 'self' birth details profile.
   */
  async register(data) {
    const {
      fullName,
      email,
      password,
      gender = 'male',
      dob = '1995-03-15',
      tob = '10:30:00',
      tobChoice = 'exact',
      pob = 'Mumbai, Maharashtra, India',
      latitude = 19.0760,
      longitude = 72.8777,
      timeZone = 'Asia/Kolkata',
      mobileNumber,
      termsAccepted,
      birthDetails = {},
    } = data;

    // Strict check if termsAccepted is explicitly passed as false or required by legacy
    if (termsAccepted === false || (termsAccepted === undefined && mobileNumber)) {
      const err = new Error('Account creation rejected: Terms and conditions must be accepted.');
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

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const effectiveDob = birthDetails.dob || dob;
    const effectiveTobChoice = birthDetails.tobChoice || tobChoice;
    const rawTob = birthDetails.tobTime || birthDetails.tob || tob;
    const effectiveTob = effectiveTobChoice === 'not_sure' ? null : rawTob;
    const effectiveGender = birthDetails.gender || gender;
    const effectivePob = birthDetails.pob || pob;

    const userPayload = {
      fullName,
      email,
      mobileNumber: mobileNumber || null,
      passwordHash,
      gender: effectiveGender,
      avatarUrl: `https://cdn.vidhilikhit.com/avatars/${gender === 'female' ? 'default_female.jpg' : 'default_male.jpg'}`,
      termsAccepted: termsAccepted !== false,
      authProvider: 'local',
      providerId: null,
    };

    const profilePayload = {
      dob: effectiveDob,
      tob: effectiveTob || '12:00:00',
      tobChoice: effectiveTobChoice,
      gender: effectiveGender,
      pob: effectivePob,
      latitude: parseFloat(latitude) || 19.0760,
      longitude: parseFloat(longitude) || 72.8777,
      timeZone: timeZone || 'Asia/Kolkata',
    };

    const userId = await userDao.createUserWithProfile(userPayload, profilePayload);
    const userProfile = await userDao.findUserWithProfileById(userId);

    const tokens = signTokens({
      userId: userProfile.id,
      publicId: userProfile.publicId,
      email: userProfile.email,
    });

    const isNotSure = effectiveTobChoice === 'not_sure';

    return {
      user: {
        id: userProfile.publicId,
        fullName: userProfile.fullName,
        email: userProfile.email,
        gender: userProfile.gender,
        avatar: userProfile.avatar,
        mobileNumber: userProfile.mobileNumber,
        termsAccepted: Boolean(userProfile.termsAccepted),
        authProvider: userProfile.authProvider || 'local',
        birthDetails: {
          dob: userProfile.dob,
          tob: isNotSure ? null : userProfile.tob,
          tobTime: isNotSure ? null : userProfile.tob,
          tobChoice: userProfile.tobChoice,
          gender: userProfile.gender,
          pob: userProfile.pob,
          latitude: Number(userProfile.latitude),
          longitude: Number(userProfile.longitude),
          timeZone: userProfile.timeZone,
        },
        activeProfileId: userProfile.activeProfileId,
      },
      tokens,
      token: tokens.accessToken,
    };
  }

  /**
   * Logs in a user with email and password, returning tokens.
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
    const tokens = signTokens({
      userId: user.id,
      publicId: user.publicId,
      email: user.email,
    });

    return {
      user: {
        id: fullProfile.publicId,
        fullName: fullProfile.fullName,
        email: fullProfile.email,
        gender: fullProfile.gender,
        avatar: fullProfile.avatar,
        mobileNumber: fullProfile.mobileNumber,
        authProvider: fullProfile.authProvider || 'local',
        termsAccepted: Boolean(fullProfile.termsAccepted),
        activeProfileId: fullProfile.activeProfileId,
        birthDetails: {
          dob: fullProfile.dob,
          tob: fullProfile.tobChoice === 'not_sure' ? null : fullProfile.tob,
          tobTime: fullProfile.tobChoice === 'not_sure' ? null : fullProfile.tob,
          tobChoice: fullProfile.tobChoice,
          gender: fullProfile.gender,
          pob: fullProfile.pob,
        },
      },
      tokens,
      token: tokens.accessToken,
    };
  }

  /**
   * Initiates password recovery by email.
   */
  async forgotPassword(email) {
    const user = await userDao.findByEmail(email);

    if (!user) {
      return {
        message: 'If the provided email is registered, a password reset link has been dispatched.',
      };
    }

    const rawToken = generateRandomToken();
    const tokenHash = hashString(rawToken);
    await passwordResetDao.createResetToken(user.id, tokenHash, config.passwordReset.expiresInMinutes);

    emailService.sendPasswordResetEmail(user.email, rawToken).catch((err) => {
      console.warn('Email dispatch warning:', err.message);
    });

    const responseData = {
      message: 'If the provided email is registered, a password reset link has been dispatched.',
    };

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
   * Internal helper to find or create an OAuth user and issue tokens.
   */
  async _processOAuthUser({ provider, providerId, email, name }) {
    let user = await userDao.findByProvider(provider, providerId);

    if (!user) {
      const existingByEmail = await userDao.findByEmail(email);
      if (existingByEmail) {
        await userDao.linkOAuthProvider(existingByEmail.id, provider, providerId);
        user = existingByEmail;
      } else {
        const newUserId = await userDao.createUserWithProfile(
          {
            fullName: name || 'OAuth User',
            email,
            mobileNumber: null,
            passwordHash: null,
            termsAccepted: true,
            authProvider: provider,
            providerId,
          },
          {
            tobChoice: 'exact',
            tob: '12:00:00',
          }
        );
        user = await userDao.findById(newUserId);
      }
    }

    const fullProfile = await userDao.findUserWithProfileById(user.id);
    const tokens = signTokens({
      userId: user.id,
      publicId: user.publicId,
      email: user.email,
    });

    return {
      user: {
        id: fullProfile.publicId,
        fullName: fullProfile.fullName,
        email: fullProfile.email,
        gender: fullProfile.gender,
        avatar: fullProfile.avatar,
        activeProfileId: fullProfile.activeProfileId,
        authProvider: fullProfile.authProvider || provider,
        termsAccepted: Boolean(fullProfile.termsAccepted),
      },
      tokens,
      token: tokens.accessToken,
    };
  }

  /**
   * Retrieves current authenticated user profile and their active profile.
   */
  async getMe(userId) {
    const user = await userDao.findUserWithProfileById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const activeProfile = await profileDao.getActiveProfile(userId);

    return {
      user: {
        id: user.publicId,
        fullName: user.fullName,
        email: user.email,
        gender: user.gender,
        avatar: user.avatar,
        mobileNumber: user.mobileNumber,
        authProvider: user.authProvider || 'local',
        termsAccepted: Boolean(user.termsAccepted),
        activeProfileId: user.activeProfileId || (activeProfile ? activeProfile.publicId : null),
        createdAt: user.createdAt,
      },
      activeProfile: activeProfile
        ? {
            id: activeProfile.publicId,
            name: activeProfile.name,
            relationship: activeProfile.relationship,
            gender: activeProfile.gender,
            dob: activeProfile.dob,
            tob: activeProfile.tobChoice === 'not_sure' ? null : activeProfile.tob,
            tobChoice: activeProfile.tobChoice,
            pob: activeProfile.pob,
            latitude: Number(activeProfile.latitude),
            longitude: Number(activeProfile.longitude),
            timeZone: activeProfile.timeZone,
            avatarUrl: activeProfile.avatarUrl,
          }
        : null,
    };
  }
}

module.exports = new AuthService();

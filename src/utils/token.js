const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');

/**
 * Signs a JWT access token.
 * @param {Object} payload - User identification payload.
 * @returns {string} - Signed JWT token string.
 */
function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Verifies a JWT token.
 * @param {string} token - The raw JWT token string.
 * @returns {Object} - Decoded payload.
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

/**
 * Generates a cryptographically strong random token (64 hex chars).
 * @returns {string}
 */
function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Computes the SHA-256 hash of a string.
 * @param {string} rawString
 * @returns {string}
 */
function hashString(rawString) {
  return crypto.createHash('sha256').update(rawString).digest('hex');
}

module.exports = {
  signToken,
  verifyToken,
  generateRandomToken,
  hashString,
};


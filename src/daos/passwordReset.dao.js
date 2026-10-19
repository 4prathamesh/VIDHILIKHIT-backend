const { query, withTransaction } = require('../config/db');

class PasswordResetDao {
  /**
   * Saves a hashed password reset token with expiration in minutes using MySQL internal clock.
   * @param {number|string} userId
   * @param {string} tokenHash
   * @param {number} expiresInMinutes
   */
  async createResetToken(userId, tokenHash, expiresInMinutes = 60) {
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at, is_used)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), 0)`,
      [userId, tokenHash, expiresInMinutes]
    );
  }

  /**
   * Finds an active (unexpired and unused) reset token by hash.
   * @param {string} tokenHash
   * @returns {Promise<Object|null>}
   */
  async findValidToken(tokenHash) {
    const rows = await query(
      `SELECT id, user_id, token_hash, expires_at, is_used, created_at 
       FROM password_resets 
       WHERE token_hash = ? 
         AND is_used = 0 
         AND expires_at > NOW() 
       ORDER BY id DESC 
       LIMIT 1`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  /**
   * In a transaction, updates the user's password and marks the reset token as used.
   * @param {number|string} userId
   * @param {string} newPasswordHash
   * @param {number|string} tokenId
   */
  async consumeTokenAndUpdatePassword(userId, newPasswordHash, tokenId) {
    return await withTransaction(async (conn) => {
      // Update user password
      await conn.query(
        `UPDATE users SET password_hash = ? WHERE id = ?`,
        [newPasswordHash, userId]
      );

      // Invalidate the token
      await conn.query(
        `UPDATE password_resets SET is_used = 1 WHERE id = ?`,
        [tokenId]
      );
    });
  }
}

module.exports = new PasswordResetDao();

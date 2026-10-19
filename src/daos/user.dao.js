const { query, withTransaction } = require('../config/db');

class UserDao {
  /**
   * Finds a user by email address.
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    const rows = await query(
      `SELECT id, full_name, email, mobile_number, password_hash, 
              terms_accepted, terms_accepted_at, auth_provider, provider_id, 
              created_at, updated_at 
       FROM users 
       WHERE email = ? 
       LIMIT 1`,
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  }

  /**
   * Finds a user by primary key ID.
   * @param {number|string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const rows = await query(
      `SELECT id, full_name, email, mobile_number, 
              terms_accepted, terms_accepted_at, auth_provider, provider_id, 
              created_at, updated_at 
       FROM users 
       WHERE id = ? 
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Finds a user along with their birth profile by user ID.
   * @param {number|string} id
   * @returns {Promise<Object|null>}
   */
  async findUserWithProfileById(id) {
    const sql = `
      SELECT 
        u.id,
        u.full_name AS fullName,
        u.email,
        u.mobile_number AS mobileNumber,
        u.terms_accepted AS termsAccepted,
        u.terms_accepted_at AS termsAcceptedAt,
        u.auth_provider AS authProvider,
        u.created_at AS createdAt,
        u.updated_at AS updatedAt,
        p.dob,
        p.tob_choice AS tobChoice,
        p.tob_time AS tobTime,
        p.gender,
        p.pob
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Finds a user by OAuth provider and provider ID.
   * @param {string} authProvider
   * @param {string} providerId
   * @returns {Promise<Object|null>}
   */
  async findByProvider(authProvider, providerId) {
    const rows = await query(
      `SELECT id, full_name, email, mobile_number, auth_provider, provider_id, created_at 
       FROM users 
       WHERE auth_provider = ? AND provider_id = ? 
       LIMIT 1`,
      [authProvider, providerId]
    );
    return rows[0] || null;
  }

  /**
   * Creates a new user and an associated profile inside an ACID transaction.
   * @param {Object} userData
   * @param {Object} profileData
   * @returns {Promise<Object>}
   */
  async createUserWithProfile(userData, profileData = {}) {
    return await withTransaction(async (conn) => {
      // Insert User
      const [userResult] = await conn.query(
        `INSERT INTO users (full_name, email, mobile_number, password_hash, terms_accepted, terms_accepted_at, auth_provider, provider_id)
         VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`,
        [
          userData.fullName,
          userData.email.toLowerCase().trim(),
          userData.mobileNumber,
          userData.passwordHash || null,
          userData.termsAccepted ? 1 : 0,
          userData.authProvider || 'local',
          userData.providerId || null,
        ]
      );

      const userId = userResult.insertId;

      // Insert User Profile
      await conn.query(
        `INSERT INTO user_profiles (user_id, dob, tob_choice, tob_time, gender, pob)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          profileData.dob || null,
          profileData.tobChoice || 'not_sure',
          profileData.tobChoice === 'not_sure' ? null : (profileData.tobTime || null),
          profileData.gender || null,
          profileData.pob || null,
        ]
      );

      return userId;
    });
  }

  /**
   * Updates user and profile fields inside a transaction.
   * @param {number|string} userId
   * @param {Object} userData - e.g. { fullName }
   * @param {Object} profileData - e.g. { dob, tobChoice, tobTime, gender, pob }
   */
  async updateUserAndProfile(userId, userData, profileData) {
    return await withTransaction(async (conn) => {
      if (userData.fullName) {
        await conn.query(
          `UPDATE users SET full_name = ? WHERE id = ?`,
          [userData.fullName, userId]
        );
      }

      // Upsert into user_profiles
      await conn.query(
        `INSERT INTO user_profiles (user_id, dob, tob_choice, tob_time, gender, pob)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           dob = VALUES(dob),
           tob_choice = VALUES(tob_choice),
           tob_time = VALUES(tob_time),
           gender = VALUES(gender),
           pob = VALUES(pob)`,
        [
          userId,
          profileData.dob !== undefined ? profileData.dob : null,
          profileData.tobChoice || 'not_sure',
          profileData.tobChoice === 'not_sure' ? null : (profileData.tobTime || null),
          profileData.gender !== undefined ? profileData.gender : null,
          profileData.pob !== undefined ? profileData.pob : null,
        ]
      );
    });
  }

  /**
   * Updates user password.
   * @param {number|string} userId
   * @param {string} passwordHash
   */
  async updatePassword(userId, passwordHash) {
    await query(
      `UPDATE users SET password_hash = ? WHERE id = ?`,
      [passwordHash, userId]
    );
  }

  /**
   * Links OAuth credentials to existing user.
   * @param {number|string} userId
   * @param {string} authProvider
   * @param {string} providerId
   */
  async linkOAuthProvider(userId, authProvider, providerId) {
    await query(
      `UPDATE users SET auth_provider = ?, provider_id = ? WHERE id = ?`,
      [authProvider, providerId, userId]
    );
  }
}

module.exports = new UserDao();


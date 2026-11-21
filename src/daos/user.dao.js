// Assumption: User and default profile are atomically created with consistent public IDs (usr_*, prof_*).
const { query, withTransaction } = require('../config/db');
const crypto = require('crypto');

class UserDao {
  /**
   * Generates public ID with prefix
   */
  generatePublicId(prefix = 'usr_') {
    return `${prefix}${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Finds a user by email address.
   */
  async findByEmail(email) {
    const rows = await query(
      `SELECT id, public_id AS publicId, full_name AS fullName, email, mobile_number AS mobileNumber,
              password_hash, gender, avatar_url AS avatarUrl, active_profile_id AS activeProfileId,
              terms_accepted AS termsAccepted, terms_accepted_at AS termsAcceptedAt, 
              auth_provider AS authProvider, provider_id AS providerId, 
              created_at AS createdAt, updated_at AS updatedAt 
       FROM users 
       WHERE email = ? 
       LIMIT 1`,
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  }

  /**
   * Finds a user by numeric primary key ID.
   */
  async findById(id) {
    const rows = await query(
      `SELECT id, public_id AS publicId, full_name AS fullName, email, mobile_number AS mobileNumber,
              gender, avatar_url AS avatarUrl, active_profile_id AS activeProfileId,
              terms_accepted AS termsAccepted, terms_accepted_at AS termsAcceptedAt, 
              auth_provider AS authProvider, provider_id AS providerId, 
              created_at AS createdAt, updated_at AS updatedAt 
       FROM users 
       WHERE id = ? 
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Finds a user along with their active profile details by user ID.
   */
  async findUserWithProfileById(id) {
    const sql = `
      SELECT 
        u.id,
        u.public_id AS publicId,
        u.full_name AS fullName,
        u.email,
        u.gender,
        COALESCE(u.avatar_url, 'https://cdn.vidhilikhit.com/avatars/default.jpg') AS avatar,
        u.active_profile_id AS activeProfileId,
        u.mobile_number AS mobileNumber,
        u.terms_accepted AS termsAccepted,
        u.terms_accepted_at AS termsAcceptedAt,
        u.auth_provider AS authProvider,
        u.created_at AS createdAt,
        u.updated_at AS updatedAt,
        p.dob,
        p.tob,
        p.tob_choice AS tobChoice,
        p.pob,
        p.latitude,
        p.longitude,
        p.time_zone AS timeZone
      FROM users u
      LEFT JOIN profiles p ON (u.active_profile_id IS NOT NULL AND u.active_profile_id = p.public_id)
                           OR (u.active_profile_id IS NULL AND p.user_id = u.id AND p.is_active = 1)
      WHERE u.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Finds a user by OAuth provider and provider ID.
   */
  async findByProvider(authProvider, providerId) {
    const rows = await query(
      `SELECT id, public_id AS publicId, full_name AS fullName, email, mobile_number AS mobileNumber,
              auth_provider AS authProvider, provider_id AS providerId, active_profile_id AS activeProfileId,
              created_at AS createdAt 
       FROM users 
       WHERE auth_provider = ? AND provider_id = ? 
       LIMIT 1`,
      [authProvider, providerId]
    );
    return rows[0] || null;
  }

  /**
   * Creates a new user and an associated active profile inside an ACID transaction.
   */
  async createUserWithProfile(userData, profileData = {}) {
    return await withTransaction(async (conn) => {
      const userPublicId = userData.publicId || this.generatePublicId('usr_');
      const profilePublicId = profileData.publicId || this.generatePublicId('prof_');
      const formattedDob = formatMySQLDate(profileData.dob);

      // Insert User
      const [userResult] = await conn.query(
        `INSERT INTO users 
         (public_id, full_name, email, mobile_number, password_hash, gender, avatar_url, active_profile_id, terms_accepted, terms_accepted_at, auth_provider, provider_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
        [
          userPublicId,
          userData.fullName,
          userData.email.toLowerCase().trim(),
          userData.mobileNumber || null,
          userData.passwordHash || null,
          userData.gender || profileData.gender || 'male',
          userData.avatarUrl || 'https://cdn.vidhilikhit.com/avatars/default.jpg',
          profilePublicId,
          userData.termsAccepted ? 1 : 0,
          userData.authProvider || 'local',
          userData.providerId || null,
        ]
      );

      const userId = userResult.insertId;

      // Insert Active Profile
      await conn.query(
        `INSERT INTO profiles 
         (public_id, user_id, name, relationship, gender, dob, tob, tob_choice, pob, latitude, longitude, time_zone, avatar_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          profilePublicId,
          userId,
          userData.fullName,
          'self',
          profileData.gender || userData.gender || 'male',
          formattedDob || '1995-03-15',
          profileData.tob || '10:30:00',
          profileData.tobChoice || 'exact',
          profileData.pob || 'Mumbai, Maharashtra, India',
          profileData.latitude !== undefined ? profileData.latitude : 19.0760,
          profileData.longitude !== undefined ? profileData.longitude : 72.8777,
          profileData.timeZone || 'Asia/Kolkata',
          userData.avatarUrl || 'https://cdn.vidhilikhit.com/avatars/default.jpg',
        ]
      );

      // Also maintain legacy user_profiles table for backwards compatibility
      await conn.query(
        `INSERT INTO user_profiles (user_id, dob, tob_choice, tob_time, gender, pob)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE dob = VALUES(dob)`,
        [
          userId,
          formattedDob || '1995-03-15',
          profileData.tobChoice || 'exact',
          profileData.tobChoice === 'not_sure' ? null : (profileData.tob || '10:30:00'),
          profileData.gender || userData.gender || 'male',
          profileData.pob || 'Mumbai, Maharashtra, India',
        ]
      );

      return userId;
    });
  }

  /**
   * Updates user and profile fields inside a transaction.
   */
  async updateUserAndProfile(userId, userData, profileData) {
    return await withTransaction(async (conn) => {
      if (userData.fullName) {
        await conn.query(`UPDATE users SET full_name = ? WHERE id = ?`, [userData.fullName, userId]);
      }

      const formattedDob = formatMySQLDate(profileData.dob);

      const active = await conn.query('SELECT active_profile_id FROM users WHERE id = ?', [userId]);
      const activeId = active[0]?.[0]?.active_profile_id;

      if (activeId) {
        const fields = [];
        const params = [];
        if (userData.fullName !== undefined) {
          fields.push('name = ?');
          params.push(userData.fullName);
        }
        if (profileData.gender !== undefined) {
          fields.push('gender = ?');
          params.push(profileData.gender);
        }
        if (formattedDob !== undefined) {
          fields.push('dob = ?');
          params.push(formattedDob);
        }
        if (profileData.tobChoice !== undefined) {
          fields.push('tob_choice = ?');
          params.push(profileData.tobChoice);
        }
        if (profileData.tob !== undefined || profileData.tobChoice === 'not_sure') {
          fields.push('tob = ?');
          params.push(profileData.tobChoice === 'not_sure' ? null : profileData.tob);
        }
        if (profileData.pob !== undefined) {
          fields.push('pob = ?');
          params.push(profileData.pob);
        }

        if (fields.length > 0) {
          params.push(activeId, userId);
          await conn.query(
            `UPDATE profiles SET ${fields.join(', ')} WHERE public_id = ? AND user_id = ?`,
            params
          );
        }

        // Also update legacy user_profiles if present
        await conn.query(
          `UPDATE user_profiles 
           SET dob = COALESCE(?, dob),
               gender = COALESCE(?, gender),
               pob = COALESCE(?, pob),
               tob_choice = COALESCE(?, tob_choice),
               tob_time = ?
           WHERE user_id = ?`,
          [
            formattedDob || null,
            profileData.gender || null,
            profileData.pob || null,
            profileData.tobChoice || null,
            profileData.tobChoice === 'not_sure' ? null : (profileData.tob || null),
            userId,
          ]
        );
      }
    });
  }

  /**
   * Updates user password.
   */
  async updatePassword(userId, passwordHash) {
    await query(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, userId]);
  }

  /**
   * Links OAuth credentials to existing user.
   */
  async linkOAuthProvider(userId, authProvider, providerId) {
    await query(`UPDATE users SET auth_provider = ?, provider_id = ? WHERE id = ?`, [
      authProvider,
      providerId,
      userId,
    ]);
  }
}

function formatMySQLDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error('Invalid date of birth');
    }
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'string') {
    const date = value.trim().slice(0, 10);

    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const parsed = new Date(`${date}T00:00:00.000Z`);

      if (!Number.isNaN(parsed.getTime()) &&
          parsed.toISOString().slice(0, 10) === date) {
        return date;
      }
    }
  }

  throw new Error('Invalid date of birth');
}

module.exports = new UserDao();

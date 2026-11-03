// Assumption: Profiles are identified by string public_id (e.g. prof_01) and linked to user_id.
const { query, withTransaction } = require('../config/db');
const crypto = require('crypto');

class ProfileDao {
  /**
   * Generates a unique public profile ID like 'prof_a8f9b2c3'
   */
  generatePublicId() {
    return `prof_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Returns all profiles for a given user.
   */
  async getProfilesByUserId(userId) {
    const sql = `
      SELECT id, public_id AS publicId, user_id AS userId, name, relationship, 
             gender, dob, tob, tob_choice AS tobChoice, pob, latitude, longitude, 
             time_zone AS timeZone, avatar_url AS avatarUrl, is_active AS isActive,
             created_at AS createdAt, updated_at AS updatedAt
      FROM profiles
      WHERE user_id = ?
      ORDER BY is_active DESC, created_at ASC
    `;
    return await query(sql, [userId]);
  }

  /**
   * Returns a specific profile by its public ID and user ID.
   */
  async getProfileByPublicId(publicId, userId = null) {
    const params = [publicId];
    let sql = `
      SELECT id, public_id AS publicId, user_id AS userId, name, relationship, 
             gender, dob, tob, tob_choice AS tobChoice, pob, latitude, longitude, 
             time_zone AS timeZone, avatar_url AS avatarUrl, is_active AS isActive,
             created_at AS createdAt, updated_at AS updatedAt
      FROM profiles
      WHERE public_id = ?
    `;
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    sql += ' LIMIT 1';
    const rows = await query(sql, params);
    return rows[0] || null;
  }

  /**
   * Returns the currently active profile for a user.
   */
  async getActiveProfile(userId) {
    const sql = `
      SELECT id, public_id AS publicId, user_id AS userId, name, relationship, 
             gender, dob, tob, tob_choice AS tobChoice, pob, latitude, longitude, 
             time_zone AS timeZone, avatar_url AS avatarUrl, is_active AS isActive,
             created_at AS createdAt, updated_at AS updatedAt
      FROM profiles
      WHERE user_id = ? AND is_active = 1
      LIMIT 1
    `;
    const rows = await query(sql, [userId]);
    if (rows[0]) return rows[0];

    // Fallback to first profile if none marked active
    const fallback = await query(
      `SELECT id, public_id AS publicId, user_id AS userId, name, relationship, 
              gender, dob, tob, tob_choice AS tobChoice, pob, latitude, longitude, 
              time_zone AS timeZone, avatar_url AS avatarUrl, is_active AS isActive,
              created_at AS createdAt, updated_at AS updatedAt
       FROM profiles WHERE user_id = ? ORDER BY id ASC LIMIT 1`,
      [userId]
    );
    return fallback[0] || null;
  }

  /**
   * Creates a new profile for a user.
   */
  async createProfile(userId, data) {
    const publicId = data.publicId || this.generatePublicId();
    const isActive = data.isActive ? 1 : 0;

    await withTransaction(async (conn) => {
      if (isActive) {
        await conn.query('UPDATE profiles SET is_active = 0 WHERE user_id = ?', [userId]);
        await conn.query('UPDATE users SET active_profile_id = ? WHERE id = ?', [publicId, userId]);
      }

      await conn.query(
        `INSERT INTO profiles 
         (public_id, user_id, name, relationship, gender, dob, tob, tob_choice, pob, latitude, longitude, time_zone, avatar_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          publicId,
          userId,
          data.name,
          data.relationship || 'self',
          data.gender || 'male',
          data.dob,
          data.tob,
          data.tobChoice || 'exact',
          data.pob,
          data.latitude || 19.0760,
          data.longitude || 72.8777,
          data.timeZone || 'Asia/Kolkata',
          data.avatarUrl || 'https://cdn.vidhilikhit.com/avatars/default.jpg',
          isActive,
        ]
      );
    });

    return await this.getProfileByPublicId(publicId);
  }

  /**
   * Activates a specific profile for a user.
   */
  async setActiveProfile(userId, publicId) {
    return await withTransaction(async (conn) => {
      // Verify profile belongs to user
      const [check] = await conn.query(
        'SELECT id, name FROM profiles WHERE public_id = ? AND user_id = ?',
        [publicId, userId]
      );
      if (!check.length) {
        const err = new Error('Profile not found or access denied.');
        err.statusCode = 404;
        throw err;
      }

      await conn.query('UPDATE profiles SET is_active = 0 WHERE user_id = ?', [userId]);
      await conn.query('UPDATE profiles SET is_active = 1 WHERE public_id = ?', [publicId]);
      await conn.query('UPDATE users SET active_profile_id = ? WHERE id = ?', [publicId, userId]);

      return check[0];
    });
  }

  /**
   * Updates an existing profile.
   */
  async updateProfile(userId, publicId, data) {
    const existing = await this.getProfileByPublicId(publicId, userId);
    if (!existing) {
      const err = new Error('Profile not found.');
      err.statusCode = 404;
      throw err;
    }

    const name = data.name !== undefined ? data.name : existing.name;
    const gender = data.gender !== undefined ? data.gender : existing.gender;
    const dob = data.dob !== undefined ? data.dob : existing.dob;
    const tob = data.tob !== undefined ? data.tob : existing.tob;
    const tobChoice = data.tobChoice !== undefined ? data.tobChoice : existing.tobChoice;
    const pob = data.pob !== undefined ? data.pob : existing.pob;
    const latitude = data.latitude !== undefined ? data.latitude : existing.latitude;
    const longitude = data.longitude !== undefined ? data.longitude : existing.longitude;
    const timeZone = data.timeZone !== undefined ? data.timeZone : existing.timeZone;
    const relationship = data.relationship !== undefined ? data.relationship : existing.relationship;
    const avatarUrl = data.avatarUrl !== undefined ? data.avatarUrl : existing.avatarUrl;

    await query(
      `UPDATE profiles
       SET name = ?, gender = ?, dob = ?, tob = ?, tob_choice = ?, pob = ?, 
           latitude = ?, longitude = ?, time_zone = ?, relationship = ?, avatar_url = ?
       WHERE public_id = ? AND user_id = ?`,
      [
        name,
        gender,
        dob,
        tob,
        tobChoice,
        pob,
        latitude,
        longitude,
        timeZone,
        relationship,
        avatarUrl,
        publicId,
        userId,
      ]
    );

    return await this.getProfileByPublicId(publicId, userId);
  }
}

module.exports = new ProfileDao();


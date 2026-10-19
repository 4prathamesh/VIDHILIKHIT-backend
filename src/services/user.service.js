const userDao = require('../daos/user.dao');

class UserService {
  /**
   * Retrieves user profile and birth details.
   * @param {number|string} userId
   */
  async getProfile(userId) {
    const user = await userDao.findUserWithProfileById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      termsAccepted: Boolean(user.termsAccepted),
      termsAcceptedAt: user.termsAcceptedAt,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      birthDetails: {
        dob: user.dob,
        tobChoice: user.tobChoice,
        tobTime: user.tobTime,
        gender: user.gender,
        pob: user.pob,
      },
    };
  }

  /**
   * Updates user name and birth profile details.
   * @param {number|string} userId
   * @param {Object} updateData
   */
  async updateProfile(userId, updateData) {
    const existing = await userDao.findUserWithProfileById(userId);
    if (!existing) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const { fullName, gender, dob, tobChoice, tobTime, pob } = updateData;

    // Determine target TOB values
    let targetTobChoice = tobChoice !== undefined ? tobChoice : existing.tobChoice;
    let targetTobTime;

    if (targetTobChoice === 'not_sure') {
      targetTobTime = null;
    } else if (tobTime !== undefined) {
      targetTobTime = tobTime;
    } else {
      targetTobTime = existing.tobTime;
    }

    // Enforce business rule: if tobChoice is exact or approximate, tobTime cannot be null
    if ((targetTobChoice === 'exact' || targetTobChoice === 'approximate') && !targetTobTime) {
      const err = new Error(`Time of birth is required when "${targetTobChoice}" is selected.`);
      err.statusCode = 422;
      throw err;
    }

    const userData = {
      fullName: fullName !== undefined ? fullName : existing.fullName,
    };

    const profileData = {
      dob: dob !== undefined ? dob : existing.dob,
      tobChoice: targetTobChoice,
      tobTime: targetTobTime,
      gender: gender !== undefined ? gender : existing.gender,
      pob: pob !== undefined ? pob : existing.pob,
    };

    await userDao.updateUserAndProfile(userId, userData, profileData);

    return await this.getProfile(userId);
  }
}

module.exports = new UserService();


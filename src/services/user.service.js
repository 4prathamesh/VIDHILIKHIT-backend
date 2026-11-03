// Assumption: UserService maintains backward compatibility for /users/profile endpoints.
const userDao = require('../daos/user.dao');
const profileDao = require('../daos/profile.dao');

class UserService {
  /**
   * Retrieves user profile and birth details.
   */
  async getProfile(userId) {
    const user = await userDao.findUserWithProfileById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    return {
      id: user.publicId || user.id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      gender: user.gender,
      termsAccepted: Boolean(user.termsAccepted),
      termsAcceptedAt: user.termsAcceptedAt,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      birthDetails: {
        dob: user.dob,
        tobChoice: user.tobChoice,
        tobTime: user.tob,
        gender: user.gender,
        pob: user.pob,
      },
    };
  }

  /**
   * Updates user name and birth profile details.
   */
  async updateProfile(userId, updateData) {
    const existing = await userDao.findUserWithProfileById(userId);
    if (!existing) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const { fullName, gender, dob, tobChoice, tobTime, tob, pob } = updateData;

    const timeVal = tobTime !== undefined ? tobTime : tob;
    let targetTobChoice = tobChoice !== undefined ? tobChoice : existing.tobChoice;
    let targetTobTime;

    if (targetTobChoice === 'not_sure') {
      targetTobTime = null;
    } else if (timeVal !== undefined) {
      targetTobTime = timeVal;
    } else {
      targetTobTime = existing.tob;
    }

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
      tob: targetTobTime,
      gender: gender !== undefined ? gender : existing.gender,
      pob: pob !== undefined ? pob : existing.pob,
    };

    await userDao.updateUserAndProfile(userId, userData, profileData);

    return await this.getProfile(userId);
  }
}

module.exports = new UserService();

// Assumption: ProfileController maps user profiles and active switching endpoints with standard responses.
const profileService = require('../services/profile.service');
const { success } = require('../utils/response');

class ProfileController {
  async getProfiles(req, res, next) {
    try {
      const result = await profileService.getProfiles(req.user.userId);
      return success(res, result, 'Profiles fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async activateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const result = await profileService.activateProfile(req.user.userId, id);
      return success(res, { activeProfileId: result.activeProfileId }, `Switched active profile to ${result.profileName}`, 200);
    } catch (err) {
      next(err);
    }
  }

  async addProfile(req, res, next) {
    try {
      const result = await profileService.addProfile(req.user.userId, req.body);
      return success(res, result, 'Profile created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const result = await profileService.updateProfile(req.user.userId, id, req.body);
      return success(res, result, 'Profile updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProfileController();


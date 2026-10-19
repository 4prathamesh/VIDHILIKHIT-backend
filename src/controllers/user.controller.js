const userService = require('../services/user.service');
const { success } = require('../utils/response');

class UserController {
  async getProfile(req, res, next) {
    try {
      const profile = await userService.getProfile(req.user.userId);
      return success(res, profile, 'Profile fetched successfully.', 200);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updatedProfile = await userService.updateProfile(req.user.userId, req.body);
      return success(res, updatedProfile, 'Profile updated successfully.', 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();


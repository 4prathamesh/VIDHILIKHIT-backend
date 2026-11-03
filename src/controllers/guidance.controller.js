// Assumption: Guidance forecast supports Today, Tomorrow, This Week, and This Month timeframes.
const astrologyService = require('../services/astrology.service');
const profileDao = require('../daos/profile.dao');
const { success } = require('../utils/response');

class GuidanceController {
  async getForecast(req, res, next) {
    try {
      const timeframe = req.query.timeframe || 'Today';
      let profile = null;
      if (req.user?.userId) {
        profile = await profileDao.getActiveProfile(req.user.userId);
      }

      const result = await astrologyService.getDailyGuidance(timeframe, profile);
      return success(res, result, 'Guidance forecast fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GuidanceController();


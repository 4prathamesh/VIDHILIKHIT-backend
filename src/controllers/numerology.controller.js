// Assumption: NumerologyController orchestrates all 8 endpoints of the Numerology module.
const numerologyService = require('../services/numerology.service');
const profileDao = require('../daos/profile.dao');
const astrologyService = require('../services/astrology.service');
const { success, error } = require('../utils/response');

class NumerologyController {
  async resolveProfile(req) {
    const userId = req.user?.userId;
    const profileId = req.query?.profileId || req.body?.profileId;

    if (profileId && userId) {
      const p = await profileDao.getProfileByPublicId(profileId, userId);
      if (p) return p;
    }

    if (userId) {
      const active = await profileDao.getActiveProfile(userId);
      if (active) return active;
    }

    // Fallback profile if called without stored profile
    return {
      name: 'Arjun Sharma',
      fullName: 'Arjun Sharma',
      dob: '1999-07-29',
      tob: '10:30',
      latitude: 19.0760,
      longitude: 72.8777,
    };
  }

  /**
   * 10.1 POST /api/v1/numerology/calculate
   */
  async calculateProfile(req, res, next) {
    try {
      const result = numerologyService.calculateFullProfile(req.body);
      return res.status(200).json({
        success: true,
        message: 'Numerology calculated successfully',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 10.2 GET /api/v1/numerology/profile
   */
  async getProfile(req, res, next) {
    try {
      const profile = await this.resolveProfile(req);
      const result = numerologyService.getActiveProfileView(profile);
      return success(res, result, 'Active numerology profile fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 10.3 GET /api/v1/numerology/destiny/:number
   */
  async getDestinyDetail(req, res, next) {
    try {
      const { number } = req.params;
      const profile = await this.resolveProfile(req).catch(() => null);
      const result = numerologyService.getDestinyDeepAnalysis(number, profile);
      return success(res, result, 'Destiny number deep analysis fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 10.4 GET /api/v1/numerology/core-numbers
   */
  async getCoreNumbers(req, res, next) {
    try {
      const profile = await this.resolveProfile(req);
      const result = numerologyService.getCoreNumbersSummary(profile);
      return success(res, result, 'Core numbers summary fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 10.5 GET /api/v1/numerology/calculation-breakdown
   */
  async getCalculationBreakdown(req, res, next) {
    try {
      const fullName = req.query.fullName || 'Arjun Sharma';
      const dob = req.query.dob || '1999-07-29';
      const system = req.query.system || 'chaldean';
      const result = numerologyService.getCalculationBreakdown(fullName, dob, system);
      return success(res, result, 'Calculation breakdown fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 10.6 GET /api/v1/numerology/personal-cycles
   */
  async getPersonalCycles(req, res, next) {
    try {
      const dob = req.query.dob || '1999-07-29';
      const year = req.query.year || req.query.targetYear || 2026;
      const result = numerologyService.getPersonalCyclesForecast(dob, year);
      return success(res, result, 'Personal cycles forecast fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 10.7 GET /api/v1/numerology/kundali-alignment
   */
  async getKundaliAlignment(req, res, next) {
    try {
      const profile = await this.resolveProfile(req);
      const result = await numerologyService.getKundaliAlignment(profile, astrologyService);
      return success(res, result, 'Numerology and Kundali alignment fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 10.8 POST /api/v1/numerology/compatibility
   */
  async calculateCompatibility(req, res, next) {
    try {
      const result = numerologyService.calculateCompatibility(req.body);
      return res.status(200).json({
        success: true,
        message: 'Compatibility calculated successfully',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NumerologyController();

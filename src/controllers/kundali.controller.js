// Assumption: KundaliController resolves profileId from query params, defaulting to user's active profile.
const profileDao = require('../daos/profile.dao');
const astrologyService = require('../services/astrology.service');
const { success, error } = require('../utils/response');

class KundaliController {
  /**
   * Helper to resolve requested profile or user's active profile.
   */
  async resolveProfile(req) {
    const userId = req.user.userId;
    const { profileId } = req.query;

    if (profileId) {
      const p = await profileDao.getProfileByPublicId(profileId, userId);
      if (p) return p;
    }

    const active = await profileDao.getActiveProfile(userId);
    if (!active) {
      const err = new Error('No birth profile found for calculations.');
      err.statusCode = 404;
      throw err;
    }
    return active;
  }

  async getOverview(req, res, next) {
    try {
      const profile = await this.resolveProfile(req);
      const chartStyle = req.query.chartStyle || 'north_indian';
      const hostUrl = `${req.protocol}://${req.get('host')}`;
      const overview = await astrologyService.getKundaliOverview(profile, chartStyle, hostUrl);
      return success(res, overview, 'Kundali overview fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getGrahas(req, res, next) {
    try {
      const profile = await this.resolveProfile(req);
      const { chart } = await astrologyService.calculateRawChart(profile.dob, profile.tob, profile.latitude, profile.longitude);
      const grahas = astrologyService.extractGrahas(chart).map((g) => ({
        id: g.id,
        name: g.name,
        sign: g.sign,
        signSanskrit: g.signSanskrit,
        house: g.house,
        houseNumber: g.houseNumber,
        degree: g.degree,
        isRetrograde: g.isRetrograde,
        isCombust: g.isCombust,
        dignity: g.dignity,
        nakshatra: g.nakshatra,
        imageKey: g.imageKey,
      }));
      return success(res, { grahas }, 'Graha positions fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getBhavas(req, res, next) {
    try {
      const profile = await this.resolveProfile(req);
      const { chart } = await astrologyService.calculateRawChart(profile.dob, profile.tob, profile.latitude, profile.longitude);
      const grahas = astrologyService.extractGrahas(chart);
      const bhavas = astrologyService.extractBhavas(chart, grahas);
      return success(res, { bhavas }, 'Bhavas fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getVargas(req, res, next) {
    try {
      const profile = await this.resolveProfile(req);
      const hostUrl = `${req.protocol}://${req.get('host')}`;
      const vargas = astrologyService.getVargasList(profile.publicId, hostUrl);
      return success(res, vargas, 'Vargas fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getYogas(req, res, next) {
    try {
      const profile = await this.resolveProfile(req);
      const yogas = await astrologyService.getYogas(profile);
      return success(res, yogas, 'Yogas fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getDasha(req, res, next) {
    try {
      const profile = await this.resolveProfile(req);
      const dasha = await astrologyService.getDashaTimeline(profile);
      return success(res, dasha, 'Vimshottari dasha fetched successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async renderChartSvg(req, res, next) {
    try {
      const { profileId } = req.query;
      let profile;
      if (profileId) {
        profile = await profileDao.getProfileByPublicId(profileId);
      }
      if (!profile && req.user) {
        profile = await profileDao.getActiveProfile(req.user.userId);
      }
      if (!profile) {
        profile = {
          dob: '1995-03-15',
          tob: '10:30',
          latitude: 19.0760,
          longitude: 72.8777,
        };
      }

      const { chart } = await astrologyService.calculateRawChart(profile.dob, profile.tob, profile.latitude, profile.longitude);
      const grahas = astrologyService.extractGrahas(chart);
      const ascSignIdx = Math.floor((chart.ascendant || 0) / 30);

      const houses = [];
      for (let h = 1; h <= 12; h++) {
        const sIdx = (ascSignIdx + (h - 1)) % 12;
        const planets = grahas.filter((g) => g.houseNumber === h).map((g) => g.name.split(' ')[0]);
        houses.push({
          house: h,
          signNumber: sIdx + 1,
          signName: grahas.find((g) => g.signNumber === sIdx + 1)?.signName || 'Aries',
          planets,
        });
      }

      const svg = astrologyService.renderChartSvg(houses, ascSignIdx + 1);
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(svg);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new KundaliController();


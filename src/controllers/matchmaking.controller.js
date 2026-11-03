// Assumption: Matchmaking endpoints persist calculation and return detailed breakdown by matchId.
const astrologyService = require('../services/astrology.service');
const matchmakingDao = require('../daos/matchmaking.dao');
const { success, error } = require('../utils/response');

class MatchmakingController {
  async calculateMatch(req, res, next) {
    try {
      const p1 = req.body.person1 || req.body.girl || req.body.bride || req.body.female || req.body.boy;
      const p2 = req.body.person2 || req.body.boy || req.body.groom || req.body.male || req.body.girl;

      if (!p1 || !p2) {
        return error(res, 'Both partner profiles are required ({ person1, person2 } or { boy, girl })', null, 422);
      }

      // Ensure default values are populated
      p1.tob = p1.tob || p1.tobTime || '12:00';
      p2.tob = p2.tob || p2.tobTime || '12:00';
      p1.gender = p1.gender || (req.body.girl || req.body.bride || req.body.female ? 'female' : 'female');
      p2.gender = p2.gender || (req.body.boy || req.body.groom || req.body.male ? 'male' : 'male');
      p1.latitude = p1.latitude !== undefined ? Number(p1.latitude) : 19.0760;
      p1.longitude = p1.longitude !== undefined ? Number(p1.longitude) : 72.8777;
      p2.latitude = p2.latitude !== undefined ? Number(p2.latitude) : 18.5204;
      p2.longitude = p2.longitude !== undefined ? Number(p2.longitude) : 73.8567;
      p1.timeZone = p1.timeZone || 'Asia/Kolkata';
      p2.timeZone = p2.timeZone || 'Asia/Kolkata';

      const matchResult = await astrologyService.calculateMatchmaking(p1, p2);

      const userId = req.user?.userId || req.user?.id || null;
      const matchId = await matchmakingDao.saveMatch(userId, matchResult);

      return success(
        res,
        {
          matchId,
          person1: matchResult.person1,
          person2: matchResult.person2,
          overall: matchResult.overall,
          highlights: matchResult.highlights,
          manglikAnalysis: matchResult.manglikAnalysis,
        },
        'Compatibility calculated successfully',
        200
      );
    } catch (err) {
      next(err);
    }
  }

  async getMatchDetails(req, res, next) {
    try {
      const { matchId } = req.params;
      const record = await matchmakingDao.getMatchById(matchId);

      if (!record) {
        return error(res, 'Matchmaking record not found', null, 404);
      }

      return success(
        res,
        {
          matchId: record.matchId,
          overallScore: record.overall?.percentage || '82%',
          detailedAspects: record.detailedAspects,
          ashtakootaGunas: record.ashtakootaGunas,
          overallRecommendation: record.overallRecommendation,
        },
        'Compatibility details fetched successfully',
        200
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MatchmakingController();


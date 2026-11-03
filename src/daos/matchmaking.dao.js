// Assumption: Matchmaking records store calculated 36 Gunas, Manglik analysis, and 7 compatibility dimensions in JSON columns.
const { query } = require('../config/db');
const crypto = require('crypto');

class MatchmakingDao {
  generateMatchId() {
    return `match_${crypto.randomBytes(3).toString('hex')}`;
  }

  async saveMatch(userId, matchData) {
    const matchId = matchData.matchId || this.generateMatchId();
    await query(
      `INSERT INTO matchmaking_records 
       (match_id, user_id, person1_data, person2_data, overall_data, highlights_data, detailed_aspects_data, ashtakoota_gunas_data, manglik_analysis_data, overall_recommendation_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        matchId,
        userId || null,
        JSON.stringify(matchData.person1),
        JSON.stringify(matchData.person2),
        JSON.stringify(matchData.overall),
        JSON.stringify(matchData.highlights),
        JSON.stringify(matchData.detailedAspects),
        JSON.stringify(matchData.ashtakootaGunas),
        JSON.stringify(matchData.manglikAnalysis),
        JSON.stringify(matchData.overallRecommendation),
      ]
    );

    return matchId;
  }

  async getMatchById(matchId) {
    const rows = await query(
      `SELECT match_id AS matchId, user_id AS userId, person1_data AS person1, person2_data AS person2,
              overall_data AS overall, highlights_data AS highlights, detailed_aspects_data AS detailedAspects,
              ashtakoota_gunas_data AS ashtakootaGunas, manglik_analysis_data AS manglikAnalysis,
              overall_recommendation_data AS overallRecommendation, created_at AS createdAt
       FROM matchmaking_records
       WHERE match_id = ?
       LIMIT 1`,
      [matchId]
    );

    if (!rows[0]) return null;

    const r = rows[0];
    return {
      matchId: r.matchId,
      person1: typeof r.person1 === 'string' ? JSON.parse(r.person1) : r.person1,
      person2: typeof r.person2 === 'string' ? JSON.parse(r.person2) : r.person2,
      overall: typeof r.overall === 'string' ? JSON.parse(r.overall) : r.overall,
      highlights: typeof r.highlights === 'string' ? JSON.parse(r.highlights) : r.highlights,
      detailedAspects: typeof r.detailedAspects === 'string' ? JSON.parse(r.detailedAspects) : r.detailedAspects,
      ashtakootaGunas: typeof r.ashtakootaGunas === 'string' ? JSON.parse(r.ashtakootaGunas) : r.ashtakootaGunas,
      manglikAnalysis: typeof r.manglikAnalysis === 'string' ? JSON.parse(r.manglikAnalysis) : r.manglikAnalysis,
      overallRecommendation: typeof r.overallRecommendation === 'string' ? JSON.parse(r.overallRecommendation) : r.overallRecommendation,
      createdAt: r.createdAt,
    };
  }
}

module.exports = new MatchmakingDao();


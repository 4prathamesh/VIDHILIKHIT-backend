// Assumption: Validates that Matchmaking API calculations are 100% dynamic and sensitive to partners' birth charts.
const { describe, test } = require('node:test');
const assert = require('node:assert');
const astrologyService = require('../src/services/astrology.service');

describe('Matchmaking Dynamic Calculation Verification', () => {
  test('Different couples must produce distinct Guna scores, Highlights, and Aspect breakdowns', async () => {
    const coupleA = [
      { name: 'Aarav Mehta', dob: '1995-03-15', tob: '10:30', latitude: 19.076, longitude: 72.8777, gender: 'male' },
      { name: 'Pooja Sharma', dob: '1996-08-22', tob: '14:15', latitude: 18.5204, longitude: 73.8567, gender: 'female' },
    ];

    const coupleB = [
      { name: 'Dev Malhotra', dob: '1992-01-10', tob: '05:20', latitude: 28.6139, longitude: 77.2090, gender: 'male' },
      { name: 'Meera Rao', dob: '1994-06-15', tob: '18:40', latitude: 13.0827, longitude: 80.2707, gender: 'female' },
    ];

    const matchA = await astrologyService.calculateMatchmaking(coupleA[0], coupleA[1]);
    const matchB = await astrologyService.calculateMatchmaking(coupleB[0], coupleB[1]);

    // 1. Overall Gunas must be dynamic and different
    assert.notStrictEqual(
      matchA.overall.gunasObtained,
      matchB.overall.gunasObtained,
      'Different couples must NOT have identical Guna scores'
    );
    assert.strictEqual(matchA.overall.gunasTotal, 36);
    assert.strictEqual(matchB.overall.gunasTotal, 36);

    // 2. Ashtakoota individual kootas must not be hardcoded constants
    assert.strictEqual(matchA.ashtakootaGunas.length, 8);
    assert.strictEqual(matchB.ashtakootaGunas.length, 8);

    // Check that at least some Kootas differ
    const kootasDiffer = matchA.ashtakootaGunas.some(
      (kA, idx) => kA.obtained !== matchB.ashtakootaGunas[idx].obtained
    );
    assert.strictEqual(kootasDiffer, true, 'Ashtakoota Koota values must vary dynamically');

    // 3. Highlights must be dynamic and not static strings
    assert.strictEqual(matchA.highlights.length, 4);
    assert.strictEqual(matchB.highlights.length, 4);

    const highlightsScoresDiffer = matchA.highlights.some(
      (hA, idx) => hA.score !== matchB.highlights[idx].score
    );
    assert.strictEqual(highlightsScoresDiffer, true, 'Highlights scores must reflect individual chart synergy');

    // 4. Detailed aspects (7 dimensions) must be dynamically scored
    assert.strictEqual(matchA.detailedAspects.length, 7);
    assert.strictEqual(matchB.detailedAspects.length, 7);

    const aspectsDiffer = matchA.detailedAspects.some(
      (aA, idx) => aA.score !== matchB.detailedAspects[idx].score
    );
    assert.strictEqual(aspectsDiffer, true, 'Detailed aspects must vary dynamically between couples');
  });

  test('Calculates all 8 Kootas with correct maximum points', async () => {
    const couple = [
      { name: 'Rohan', dob: '1988-12-05', tob: '06:00', latitude: 28.6139, longitude: 77.2090, gender: 'male' },
      { name: 'Sneha', dob: '1990-04-18', tob: '21:45', latitude: 12.9716, longitude: 77.5946, gender: 'female' },
    ];

    const match = await astrologyService.calculateMatchmaking(couple[0], couple[1]);
    const maxPointsMap = {
      Varna: 1,
      Vashya: 2,
      Tara: 3,
      Yoni: 4,
      'Graha Maitri': 5,
      Gana: 6,
      Bhakoot: 7,
      Nadi: 8,
    };

    let calculatedSum = 0;
    match.ashtakootaGunas.forEach((k) => {
      assert.strictEqual(k.maxPoints, maxPointsMap[k.koota]);
      assert.ok(k.obtained >= 0 && k.obtained <= k.maxPoints, `${k.koota} obtained score (${k.obtained}) must be within [0, ${k.maxPoints}]`);
      calculatedSum += k.obtained;
    });

    assert.strictEqual(Number(calculatedSum.toFixed(1)), match.overall.gunasObtained);
  });
});

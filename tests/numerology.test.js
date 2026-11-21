// Assumption: Validates the 8 endpoints and calculation formulas of the Numerology Module (Chaldean & Sankhya Shastra).
const { describe, test } = require('node:test');
const assert = require('node:assert');
const numerologyService = require('../src/services/numerology.service');
const astrologyService = require('../src/services/astrology.service');

const samplePayload = {
  fullName: 'Arjun Sharma',
  dob: '1999-07-29',
  targetYear: 2026,
  system: 'chaldean',
  isTransliterationConfirmed: true,
};

describe('Numerology Module API Calculations (Section 10)', () => {
  test('10.1 calculateFullProfile computes authentic Mulank, Bhagyank, Namank, and Personal Cycles', () => {
    const res = numerologyService.calculateFullProfile(samplePayload);

    // Profile
    assert.strictEqual(res.profile.fullName, 'Arjun Sharma');
    assert.strictEqual(res.profile.dob, '1999-07-29');
    assert.strictEqual(res.profile.dobFormatted, '29 / 07 / 1999');

    // Birth Number (Mulank)
    assert.strictEqual(res.birthNumber.compound, 29);
    assert.strictEqual(res.birthNumber.root, 2);
    assert.strictEqual(res.birthNumber.planetaryRuler, 'Moon');

    // Destiny Number (Bhagyank)
    assert.strictEqual(res.destinyNumber.compound, 46);
    assert.strictEqual(res.destinyNumber.root, 1);
    assert.strictEqual(res.destinyNumber.planetaryRuler, 'Sun');

    // Name Number (Namank)
    assert.strictEqual(res.nameNumber.compound, 31);
    assert.strictEqual(res.nameNumber.root, 4);
    assert.strictEqual(res.nameNumber.planetaryRuler, 'Rahu');

    // Personal Cycles
    assert.strictEqual(res.personalCycles.personalYear.year, 2026);
    assert.ok(typeof res.personalCycles.personalYear.number === 'number');
    assert.ok(res.personalCycles.personalYear.theme);
    assert.ok(typeof res.personalCycles.personalMonth.number === 'number');
    assert.ok(typeof res.personalCycles.personalDay.number === 'number');
  });

  test('10.2 getActiveProfileView returns Golden Trio and current cycles', () => {
    const res = numerologyService.getActiveProfileView({
      name: 'Arjun Sharma',
      dob: '1999-07-29',
    });

    assert.strictEqual(res.fullName, 'Arjun Sharma');
    assert.strictEqual(res.goldenTrio.destinyNumber, 1);
    assert.strictEqual(res.goldenTrio.birthNumber, 29);
    assert.strictEqual(res.goldenTrio.nameNumber, 31);
    assert.ok(typeof res.cycles.personalYear === 'number');
    assert.ok(typeof res.cycles.personalMonth === 'number');
    assert.ok(typeof res.cycles.personalDay === 'number');
    assert.strictEqual(res.quickActions.length, 2);
  });

  test('10.3 getDestinyDeepAnalysis delivers accurate archetype, planetary ruler, and gems for all 9 root numbers', () => {
    for (let n = 1; n <= 9; n++) {
      const res = numerologyService.getDestinyDeepAnalysis(n);
      assert.strictEqual(res.number, n);
      assert.ok(res.archetype);
      assert.ok(res.summary);
      assert.ok(res.attributes.coreMeaning);
      assert.ok(res.attributes.planetaryRuler);
      assert.ok(res.attributes.gemstone);
      assert.ok(Array.isArray(res.strengths));
      assert.ok(Array.isArray(res.challenges));
      assert.ok(res.kundaliSynergy);
    }
  });

  test('10.4 getCoreNumbersSummary provides all 6 core numbers with compound reductions and displays', () => {
    const res = numerologyService.getCoreNumbersSummary({
      name: 'Arjun Sharma',
      dob: '1999-07-29',
    });

    assert.ok(Array.isArray(res.coreNumbers));
    assert.strictEqual(res.coreNumbers.length, 6);

    const ids = res.coreNumbers.map((c) => c.id);
    assert.deepStrictEqual(ids, ['birth', 'destiny', 'name', 'personalYear', 'personalMonth', 'personalDay']);

    const birth = res.coreNumbers.find((c) => c.id === 'birth');
    assert.strictEqual(birth.compound, 29);
    assert.strictEqual(birth.root, 2);
    assert.strictEqual(birth.display, '29 → 2');

    const name = res.coreNumbers.find((c) => c.id === 'name');
    assert.strictEqual(name.compound, 31);
    assert.strictEqual(name.root, 4);
    assert.strictEqual(name.display, '31 → 4');
  });

  test('10.5 getCalculationBreakdown shows exact letter-by-letter Chaldean values and step-by-step Destiny sum', () => {
    const res = numerologyService.getCalculationBreakdown('Arjun Sharma', '1999-07-29', 'chaldean');

    // Name Breakdown
    assert.strictEqual(res.nameBreakdown.fullName, 'Arjun Sharma');
    assert.strictEqual(res.nameBreakdown.words.length, 2);

    const arjun = res.nameBreakdown.words[0];
    assert.strictEqual(arjun.word, 'ARJUN');
    assert.strictEqual(arjun.wordSum, 15);
    assert.deepStrictEqual(arjun.letters, [
      { char: 'A', value: 1 },
      { char: 'R', value: 2 },
      { char: 'J', value: 1 },
      { char: 'U', value: 6 },
      { char: 'N', value: 5 },
    ]);

    const sharma = res.nameBreakdown.words[1];
    assert.strictEqual(sharma.word, 'SHARMA');
    assert.strictEqual(sharma.wordSum, 16);
    assert.deepStrictEqual(sharma.letters, [
      { char: 'S', value: 3 },
      { char: 'H', value: 5 },
      { char: 'A', value: 1 },
      { char: 'R', value: 2 },
      { char: 'M', value: 4 },
      { char: 'A', value: 1 },
    ]);

    assert.strictEqual(res.nameBreakdown.compoundNumber, 31);
    assert.strictEqual(res.nameBreakdown.rootNumber, 4);

    // Destiny Breakdown
    assert.strictEqual(res.destinyBreakdown.dob, '1999-07-29');
    assert.strictEqual(res.destinyBreakdown.steps.length, 3);
    assert.strictEqual(res.destinyBreakdown.compoundNumber, 46);
    assert.strictEqual(res.destinyBreakdown.rootNumber, 1);
  });

  test('10.6 getPersonalCyclesForecast returns active cycles and 6-year multi-year forecast', () => {
    const res = numerologyService.getPersonalCyclesForecast('1999-07-29', 2026);

    assert.strictEqual(res.selectedYear, 2026);
    assert.strictEqual(res.personalYear.year, 2026);
    assert.ok(typeof res.personalYear.number === 'number');
    assert.ok(Array.isArray(res.personalYear.focusAreas));

    assert.strictEqual(res.multiYearForecast.length, 6);
    const years = res.multiYearForecast.map((m) => m.year);
    assert.deepStrictEqual(years, [2024, 2025, 2026, 2027, 2028, 2029]);

    res.multiYearForecast.forEach((item) => {
      assert.ok(item.number >= 1 && item.number <= 9);
      assert.ok(item.theme);
    });
  });

  test('10.7 getKundaliAlignment synthesizes Destiny Number with natal Kundali', async () => {
    const profile = {
      name: 'Arjun Sharma',
      dob: '1999-07-29',
      tob: '10:30',
      latitude: 19.076,
      longitude: 72.8777,
    };

    const res = await numerologyService.getKundaliAlignment(profile, astrologyService);
    assert.strictEqual(res.destinyNumber, 1);
    assert.ok(res.numerologyPlanet.includes('Sun'));
    assert.ok(res.kundaliSign);
    assert.ok(typeof res.kundaliHouse === 'number');
    assert.ok(res.moonStrength);
    assert.ok(res.headline);
    assert.strictEqual(res.alignmentCards.length, 3);
  });

  test('10.8 calculateCompatibility computes 3 Pillars of Harmony and weighted score dynamically', () => {
    const couple = {
      yourName: 'Arjun Sharma',
      partnerName: 'Kavya Mehta',
      yourDob: '1999-07-29',
      partnerDob: '2000-11-14',
      relationshipType: 'romantic',
    };

    const res = numerologyService.calculateCompatibility(couple);
    assert.strictEqual(res.yourName, 'Arjun Sharma');
    assert.strictEqual(res.partnerName, 'Kavya Mehta');
    assert.ok(typeof res.compatibilityScore === 'number');
    assert.ok(res.compatibilityScore >= 0 && res.compatibilityScore <= 100);
    assert.ok(res.verdict);
    assert.ok(res.harmonyRating);

    assert.ok(typeof res.pillars.emotionalHarmony === 'number');
    assert.ok(typeof res.pillars.intellectualCommunication === 'number');
    assert.ok(typeof res.pillars.longTermLifeVision === 'number');

    assert.ok(res.planetarySynergy);
    assert.ok(Array.isArray(res.strengths));
    assert.ok(Array.isArray(res.growthAreas));
  });
});

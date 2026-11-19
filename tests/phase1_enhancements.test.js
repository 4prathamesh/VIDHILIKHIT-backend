// Assumption: Validates all Phase 1 backward-compatible additive enhancements on the 6 existing Kundali endpoints.
const { describe, test } = require('node:test');
const assert = require('node:assert');
const astrologyService = require('../src/services/astrology.service');

const sampleProfile = {
  id: 'prof_test_01',
  publicId: 'prof_test_01',
  name: 'Aarav Mehta',
  gender: 'Male',
  dob: '1999-07-25',
  tob: '22:10:00',
  pob: 'Tasgaon, Sangli, Maharashtra, India',
  latitude: 17.037,
  longitude: 74.6017,
  timeZone: 'Asia/Kolkata',
};

describe('Phase 1 Kundali API Additive Enhancements', () => {
  test('1. GET /kundali/overview preserves existing contract and adds birthDetails, panchang, avakhada, calculation', async () => {
    const overview = await astrologyService.getKundaliOverview(sampleProfile, 'north_indian', 'http://localhost:5000');

    // 1. Existing properties MUST remain intact
    assert.ok(overview.profile, 'Must have profile');
    assert.ok(overview.summary, 'Must have summary');
    assert.ok(overview.chart, 'Must have chart');
    assert.strictEqual(overview.summary.rashi.english, 'Sagittarius');
    assert.strictEqual(overview.summary.lagna.english, 'Pisces');
    assert.strictEqual(overview.chart.ascendantSign, 12);

    // 2. Additive birthDetails
    assert.ok(overview.birthDetails, 'Must have birthDetails');
    assert.strictEqual(overview.birthDetails.gender, 'Male');
    assert.strictEqual(overview.birthDetails.birthDateISO, '1999-07-25');
    assert.strictEqual(overview.birthDetails.birthTime24h, '22:10:00');
    assert.strictEqual(overview.birthDetails.timezone, 'Asia/Kolkata');
    assert.strictEqual(overview.birthDetails.place.city, 'Tasgaon');
    assert.strictEqual(overview.birthDetails.place.district, 'Sangli');
    assert.strictEqual(overview.birthDetails.place.state, 'Maharashtra');
    assert.strictEqual(overview.birthDetails.place.country, 'India');

    // 3. Additive panchang
    assert.ok(overview.panchang, 'Must have panchang');
    assert.strictEqual(overview.panchang.tithi.number, 13);
    assert.strictEqual(overview.panchang.tithi.paksha, 'SHUKLA');
    assert.strictEqual(overview.panchang.karana.name, 'Kaulava');
    assert.strictEqual(overview.panchang.yoga.name, 'Indra');
    assert.strictEqual(overview.panchang.nakshatra.name, 'Mula');
    assert.strictEqual(overview.panchang.nakshatra.lord, 'Ketu');
    assert.strictEqual(overview.panchang.nakshatra.pada, 3);
    assert.ok(overview.panchang.sunrise, 'Must have sunrise string');
    assert.ok(overview.panchang.sunset, 'Must have sunset string');
    assert.strictEqual(overview.panchang.ayanamsa.name, 'Lahiri');

    // 4. Additive avakhada
    assert.ok(overview.avakhada, 'Must have avakhada');
    assert.strictEqual(overview.avakhada.varna, 'Kshatriya');
    assert.strictEqual(overview.avakhada.vashya, 'Nara');
    assert.strictEqual(overview.avakhada.yoni, 'Shwan');
    assert.strictEqual(overview.avakhada.gana, 'Rakshasa');
    assert.strictEqual(overview.avakhada.nadi, 'Adhya');
    assert.strictEqual(overview.avakhada.rashi, 'Sagittarius');
    assert.strictEqual(overview.avakhada.rashiLord, 'Jupiter');
    assert.strictEqual(overview.avakhada.charan, 3);
    assert.strictEqual(overview.avakhada.tatva, 'Fire');
    assert.strictEqual(overview.avakhada.nameAlphabet, 'Bhaa');
    assert.strictEqual(overview.avakhada.paya, 'Copper');
    assert.strictEqual(overview.avakhada.yunja, 'Antya');

    // 5. Additive calculation metadata
    assert.ok(overview.calculation, 'Must have calculation');
    assert.strictEqual(overview.calculation.system, 'Vedic');
    assert.strictEqual(overview.calculation.zodiac, 'Sidereal');
    assert.strictEqual(overview.calculation.ayanamsa, 'Lahiri');
    assert.strictEqual(overview.calculation.houseSystem, 'Whole Sign');
  });

  test('2. GET /kundali/grahas includes signLord, nakshatraLord, speeds, and dignity booleans', async () => {
    const { chart } = await astrologyService.calculateRawChart('1999-07-25', '22:10:00', 17.037, 74.6017);
    const grahas = astrologyService.extractGrahas(chart, { nodeCalculationMode: 'MEAN' });

    assert.strictEqual(grahas.length, 9);
    for (const g of grahas) {
      // Existing fields
      assert.ok(g.id);
      assert.ok(g.name);
      assert.ok(g.sign);
      assert.ok(g.house);
      assert.ok(g.degree);

      // Phase 1 Additive fields
      assert.ok(g.signLord, `${g.id} must have signLord`);
      assert.ok(g.nakshatraLord, `${g.id} must have nakshatraLord`);
      assert.ok(typeof g.nakshatraPada === 'number', `${g.id} must have nakshatraPada`);
      assert.ok(typeof g.longitudeDegrees === 'number', `${g.id} must have longitudeDegrees`);
      assert.ok(typeof g.latitudeDegrees === 'number', `${g.id} must have latitudeDegrees`);
      assert.ok(typeof g.dailyMotionDegrees === 'number', `${g.id} must have dailyMotionDegrees`);
      assert.ok(typeof g.isExalted === 'boolean', `${g.id} must have isExalted`);
      assert.ok(typeof g.isDebilitated === 'boolean', `${g.id} must have isDebilitated`);
      assert.ok(typeof g.isOwnSign === 'boolean', `${g.id} must have isOwnSign`);
      assert.ok(typeof g.isMoolatrikona === 'boolean', `${g.id} must have isMoolatrikona`);
      assert.ok(g.combustion && typeof g.combustion.isCombust === 'boolean', `${g.id} must have combustion object`);
    }

    const sun = grahas.find((g) => g.id === 'sun');
    assert.strictEqual(sun.signLord, 'Moon');
    assert.strictEqual(sun.nakshatraLord, 'Saturn');
    assert.strictEqual(sun.nakshatraPada, 2);

    const rahu = grahas.find((g) => g.id === 'rahu');
    const ketu = grahas.find((g) => g.id === 'ketu');
    assert.strictEqual(rahu.signLord, 'Moon');
    assert.strictEqual(ketu.signLord, 'Saturn');
  });

  test('3. GET /kundali/bhavas includes cusp, houseLord, aspects, strength, and interpretation', async () => {
    const { chart } = await astrologyService.calculateRawChart('1999-07-25', '22:10:00', 17.037, 74.6017);
    const grahas = astrologyService.extractGrahas(chart, { nodeCalculationMode: 'MEAN' });
    const bhavas = astrologyService.extractBhavas(chart, grahas);

    assert.strictEqual(bhavas.length, 12);
    for (const b of bhavas) {
      assert.ok(b.number);
      assert.ok(b.title);
      assert.ok(b.sign);
      assert.ok(b.signLord);

      // Phase 1 Additive fields
      assert.ok(b.cusp && typeof b.cusp.longitudeDegrees === 'number');
      assert.ok(b.cusp.degreeInSign);
      assert.ok(b.houseLord && b.houseLord.planet && b.houseLord.houseNumber);
      assert.ok(Array.isArray(b.aspects));
      assert.ok(b.strength && typeof b.strength.total === 'number');
      assert.ok(b.interpretation && b.interpretation.summary);
      assert.ok(Array.isArray(b.interpretation.positiveFactors));
      assert.ok(Array.isArray(b.interpretation.challengeFactors));
    }

    // Lagna lord for Pisces (House 1) is Jupiter in Aries (House 2)
    const h1 = bhavas[0];
    assert.strictEqual(h1.houseLord.planet, 'Jupiter');
    assert.strictEqual(h1.houseLord.houseNumber, 2);
    assert.strictEqual(h1.houseLord.sign, 'Aries');
  });

  test('4. GET /kundali/vargas returns all 18 Shodashavarga charts with chartData and calculationStatus', () => {
    const res = astrologyService.getVargasList('prof_01', 'http://localhost:5000');
    assert.ok(Array.isArray(res.vargas));
    assert.strictEqual(res.vargas.length, 18);

    const codes = res.vargas.map((v) => v.code);
    const requiredCodes = ['D1', 'D2', 'D3', 'D4', 'D6', 'D7', 'D8', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];
    for (const req of requiredCodes) {
      assert.ok(codes.includes(req), `Must contain divisional chart ${req}`);
    }

    for (const v of res.vargas) {
      assert.ok(v.title);
      assert.ok(v.description);
      assert.ok(v.chartSvg);
      assert.strictEqual(v.calculationStatus, 'CALCULATED');
      assert.ok(v.chartData && v.chartData.chartStyle === 'north_indian');
    }
  });

  test('5. GET /kundali/yogas includes ruleCode, conditions, housesInvolved, and interpretation', async () => {
    const res = await astrologyService.getYogas(sampleProfile);
    assert.ok(res.yogas && res.yogas.length > 0);

    for (const y of res.yogas) {
      assert.ok(y.id);
      assert.ok(y.title);
      assert.ok(y.badge);
      assert.ok(y.description);

      // Phase 1 Additive fields
      assert.ok(y.ruleCode, `Yoga ${y.id} must have ruleCode`);
      assert.ok(Array.isArray(y.conditions), `Yoga ${y.id} must have conditions`);
      assert.ok(Array.isArray(y.housesInvolved), `Yoga ${y.id} must have housesInvolved`);
      assert.ok(y.interpretation && y.interpretation.summary, `Yoga ${y.id} must have interpretation`);
      assert.strictEqual(y.calculationStatus, 'DETECTED');
    }
  });

  test('6. GET /kundali/dasha returns mahadashas array and timeline with birth balance', async () => {
    const dasha = await astrologyService.getDashaTimeline(sampleProfile);

    // Existing fields
    assert.ok(dasha.currentMahadasha);
    assert.ok(dasha.currentAntardasha);
    assert.ok(Array.isArray(dasha.upcomingAntardashas));

    // Phase 1 Additive fields
    assert.ok(Array.isArray(dasha.mahadashas), 'Must have mahadashas array');
    assert.ok(dasha.mahadashas.length >= 9, 'Must cover full 9 Mahadasha cycles');

    const firstMaha = dasha.mahadashas[0];
    assert.strictEqual(firstMaha.planet, 'Ketu');
    assert.strictEqual(firstMaha.startDate, '1999-07-25');
    assert.ok(firstMaha.endDate.startsWith('2002-12'));

    const secondMaha = dasha.mahadashas[1];
    assert.strictEqual(secondMaha.planet, 'Venus');
    assert.ok(secondMaha.startDate.startsWith('2002-12'));
    assert.ok(secondMaha.endDate.startsWith('2022-12'));

    assert.ok(dasha.timeline, 'Must have timeline object');
    assert.strictEqual(dasha.timeline.system, 'VIMSHOTTARI');
    assert.strictEqual(dasha.timeline.birthNakshatra, 'Mula');
    assert.strictEqual(dasha.timeline.birthNakshatraLord, 'Ketu');
    assert.strictEqual(dasha.timeline.balanceAtBirth.planet, 'Ketu');
    assert.strictEqual(dasha.timeline.balanceAtBirth.years, 3.36);
    assert.strictEqual(dasha.timeline.balanceAtBirth.months, 4);
    assert.ok(dasha.timeline.balanceAtBirth.days >= 9 && dasha.timeline.balanceAtBirth.days <= 10);
  });
});

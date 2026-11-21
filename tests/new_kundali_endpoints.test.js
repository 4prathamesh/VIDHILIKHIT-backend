// Assumption: Validates the 9 new Kundali calculation endpoints and asynchronous PDF report workflows.
const { describe, test } = require('node:test');
const assert = require('node:assert');
const astrologyService = require('../src/services/astrology.service');
const advancedKundaliService = require('../src/services/advancedKundali.service');

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

describe('Advanced Kundali & PDF Report Enhancements', () => {
  let chart;
  let grahas;

  test('Preparation: Calculate natal chart and extract grahas', async () => {
    const res = await astrologyService.calculateRawChart(
      sampleProfile.dob,
      sampleProfile.tob,
      sampleProfile.latitude,
      sampleProfile.longitude,
      { nodeCalculationMode: 'MEAN' }
    );
    chart = res.chart;
    grahas = astrologyService.extractGrahas(chart, { nodeCalculationMode: 'MEAN' });

    assert.ok(chart, 'Chart must be generated');
    assert.strictEqual(grahas.length, 9, 'Must have 9 grahas');
  });

  test('5.1 calculateStrengths: Shadbala & Bhavbala', () => {
    const strengths = advancedKundaliService.calculateStrengths(chart, grahas);

    assert.ok(strengths.shadbala, 'Must contain shadbala');
    assert.strictEqual(strengths.shadbala.unit, 'virupa');
    assert.strictEqual(strengths.shadbala.planets.length, 7, 'Must have 7 classical planets');

    const sun = strengths.shadbala.planets.find((p) => p.planet === 'Sun');
    assert.ok(sun, 'Sun must be present');
    assert.ok(typeof sun.sthaanaBala === 'number');
    assert.ok(typeof sun.kaalaBala === 'number');
    assert.ok(typeof sun.digaBala === 'number');
    assert.ok(typeof sun.cheshtaBala === 'number');
    assert.strictEqual(sun.naisargikaBala, 60);
    assert.ok(typeof sun.drikBala === 'number');
    assert.ok(typeof sun.totalShadbala === 'number');
    assert.ok(typeof sun.rupas === 'number');
    assert.strictEqual(sun.requiredRupas, 5);
    assert.ok(typeof sun.ratio === 'number');
    assert.ok(typeof sun.rank === 'number');
    assert.ok(typeof sun.ishtaPhala === 'number');

    assert.ok(strengths.bhavbala, 'Must contain bhavbala');
    assert.strictEqual(strengths.bhavbala.unit, 'virupa');
    assert.strictEqual(strengths.bhavbala.houses.length, 12, 'Must have 12 houses');

    const h1 = strengths.bhavbala.houses.find((h) => h.house === 1);
    assert.ok(h1, 'House 1 must be present');
    assert.ok(typeof h1.totalBhavaBala === 'number');
    assert.ok(typeof h1.rupas === 'number');
    assert.ok(typeof h1.strengthRatio === 'number');
    assert.ok(typeof h1.rank === 'number');
  });

  test('5.2 calculateTransits: Gochar Transits from Lagna and Moon', async () => {
    const hostUrl = 'http://localhost:5000';
    const transits = await advancedKundaliService.calculateTransits(
      chart,
      grahas,
      '2026-11-16',
      hostUrl,
      sampleProfile.publicId,
      astrologyService
    );

    assert.strictEqual(transits.asOf, '2026-11-16');
    assert.strictEqual(transits.timezone, 'Asia/Kolkata');
    assert.ok(transits.lagnaTransitChart, 'Must have lagnaTransitChart');
    assert.strictEqual(transits.lagnaTransitChart.chartStyle, 'north_indian');
    assert.ok(transits.lagnaTransitChart.ascendantSign >= 1 && transits.lagnaTransitChart.ascendantSign <= 12);
    assert.ok(Array.isArray(transits.lagnaTransitChart.houses));

    assert.ok(transits.moonTransitChart, 'Must have moonTransitChart');
    assert.strictEqual(transits.moonTransitChart.chartStyle, 'north_indian');
    assert.ok(transits.moonTransitChart.ascendantSign >= 1 && transits.moonTransitChart.ascendantSign <= 12);
    assert.ok(Array.isArray(transits.moonTransitChart.houses));

    assert.ok(Array.isArray(transits.transitingPlanets));
    assert.ok(transits.transitingPlanets.length >= 7);
    const jupiter = transits.transitingPlanets.find((p) => p.id === 'jupiter');
    assert.ok(jupiter, 'Jupiter transit must be present');
    assert.ok(jupiter.sign);
    assert.ok(typeof jupiter.houseFromLagna === 'number');
    assert.ok(typeof jupiter.houseFromMoon === 'number');
    assert.ok(typeof jupiter.longitudeDegrees === 'number');
    assert.ok(typeof jupiter.retrograde === 'boolean');
  });

  test('5.3 calculateKP: KP Bhav Chalit, Ruling Planets, KP Grahas & KP Cusps', async () => {
    const hostUrl = 'http://localhost:5000';
    const kp = await advancedKundaliService.calculateKP(chart, grahas, hostUrl, sampleProfile.publicId);

    assert.ok(kp.bhavChalitChart, 'Must have bhavChalitChart');
    assert.strictEqual(kp.bhavChalitChart.chartStyle, 'north_indian');
    assert.strictEqual(kp.bhavChalitChart.houses.length, 12);

    assert.ok(kp.rulingPlanets, 'Must have rulingPlanets');
    assert.ok(kp.rulingPlanets.ascSignLord);
    assert.ok(kp.rulingPlanets.ascStarLord);
    assert.ok(kp.rulingPlanets.ascSubLord);
    assert.ok(kp.rulingPlanets.moonSignLord);
    assert.ok(kp.rulingPlanets.moonStarLord);
    assert.ok(kp.rulingPlanets.moonSubLord);
    assert.ok(kp.rulingPlanets.dayLord);

    assert.ok(Array.isArray(kp.kpPlanets));
    assert.strictEqual(kp.kpPlanets.length, 9);
    const sunKp = kp.kpPlanets.find((p) => p.planet === 'Sun');
    assert.ok(sunKp, 'Sun KP data must exist');
    assert.ok(sunKp.cusp);
    assert.ok(sunKp.sign);
    assert.ok(sunKp.signLord);
    assert.ok(sunKp.star);
    assert.ok(sunKp.starLord);
    assert.ok(sunKp.subLord);

    assert.ok(Array.isArray(kp.kpCusps));
    assert.strictEqual(kp.kpCusps.length, 12);
    const cusp1 = kp.kpCusps[0];
    assert.strictEqual(cusp1.cusp, 1);
    assert.ok(typeof cusp1.longitudeDegrees === 'number');
    assert.ok(cusp1.sign);
    assert.ok(cusp1.signLord);
    assert.ok(cusp1.star);
    assert.ok(cusp1.starLord);
    assert.ok(cusp1.subLord);
  });

  test('5.4 calculateAshtakavarga: Sarvashtakavarga & Bhinna Ashtakavarga', async () => {
    const av = await advancedKundaliService.calculateAshtakavarga(chart);

    assert.ok(av.sarvashtakavarga, 'Must have sarvashtakavarga');
    assert.strictEqual(av.sarvashtakavarga.signBindus.length, 12);
    assert.strictEqual(av.sarvashtakavarga.totalBindus, 337, 'SAV total bindus must equal 337 exactly');

    assert.ok(Array.isArray(av.bhinnaAshtakavarga));
    assert.strictEqual(av.bhinnaAshtakavarga.length, 7, 'BAV must cover 7 classical planets');
    av.bhinnaAshtakavarga.forEach((pBav) => {
      assert.ok(pBav.planet);
      assert.strictEqual(pBav.signBindus.length, 12);
      assert.ok(typeof pBav.totalBindus === 'number');
    });
  });

  test('5.5 calculateDoshas: Manglik, Kalsarpa & Sade Sati', () => {
    const doshas = advancedKundaliService.calculateDoshas(chart, grahas, '2026-11-16');

    assert.strictEqual(doshas.asOf, '2026-11-16');

    // Manglik
    assert.ok(doshas.manglik);
    assert.ok(['PRESENT', 'NOT_PRESENT'].includes(doshas.manglik.status));
    assert.strictEqual(typeof doshas.manglik.isPresent, 'boolean');
    assert.deepStrictEqual(doshas.manglik.checkedFrom, ['LAGNA', 'MOON', 'VENUS']);
    assert.ok(Array.isArray(doshas.manglik.ruleDetails));
    assert.strictEqual(doshas.manglik.ruleDetails.length, 3);
    assert.ok(doshas.manglik.explanation);

    // Kalsarpa
    assert.ok(doshas.kalsarpa);
    assert.ok(['PRESENT', 'NOT_PRESENT'].includes(doshas.kalsarpa.status));
    assert.strictEqual(typeof doshas.kalsarpa.isPresent, 'boolean');
    assert.ok(doshas.kalsarpa.explanation);

    // Sade Sati
    assert.ok(doshas.sadeSati);
    assert.ok(['ACTIVE', 'NOT_ACTIVE'].includes(doshas.sadeSati.status));
    assert.strictEqual(typeof doshas.sadeSati.isActive, 'boolean');
    assert.strictEqual(doshas.sadeSati.saturnTransitSign, 'Pisces');
    assert.ok(doshas.sadeSati.moonSign);
    assert.ok(doshas.sadeSati.explanation);
  });

  test('5.6 calculateRecommendations: Rudraksha & Gemstones', () => {
    const recs = advancedKundaliService.calculateRecommendations(chart, grahas);

    // Rudraksha
    assert.ok(recs.rudraksha);
    assert.ok(typeof recs.rudraksha.recommendedMukhi === 'number');
    assert.ok(recs.rudraksha.name);
    assert.ok(recs.rudraksha.rulingPlanet);
    assert.ok(recs.rudraksha.associatedDeity);
    assert.ok(recs.rudraksha.reason);
    assert.ok(Array.isArray(recs.rudraksha.benefits));
    assert.ok(Array.isArray(recs.rudraksha.howToWear));
    assert.ok(Array.isArray(recs.rudraksha.precautions));
    assert.ok(recs.rudraksha.mantra);
    assert.strictEqual(recs.rudraksha.disclaimer, 'Traditional/spiritual information only.');

    // Gemstones
    assert.ok(recs.gemstones);
    assert.ok(recs.gemstones.lifeStone);
    assert.ok(recs.gemstones.lifeStone.name);
    assert.ok(recs.gemstones.lifeStone.regionalName);
    assert.ok(recs.gemstones.lifeStone.planet);
    assert.ok(recs.gemstones.lifeStone.howToWear.metal);
    assert.ok(recs.gemstones.lifeStone.howToWear.finger);
    assert.ok(recs.gemstones.lifeStone.mantra);

    assert.ok(recs.gemstones.luckyStone);
    assert.ok(recs.gemstones.fortuneStone);
  });

  test('6.1 - 6.3 PDF Report Generation Lifecycle', () => {
    // 6.1 Queue Report
    const queued = advancedKundaliService.queueReportGeneration(sampleProfile.publicId, {
      format: 'pdf',
      includeSections: ['basic_details', 'panchang', 'birth_charts'],
    });

    assert.ok(queued.reportId);
    assert.strictEqual(queued.status, 'QUEUED');
    assert.strictEqual(queued.format, 'pdf');
    assert.strictEqual(queued.profileId, sampleProfile.publicId);
    assert.ok(queued.statusUrl);

    // 6.2 Report Status
    const status = advancedKundaliService.getReportStatus(queued.reportId);
    assert.strictEqual(status.reportId, queued.reportId);
    assert.strictEqual(status.status, 'COMPLETED');
    assert.strictEqual(status.progress, 100);
    assert.strictEqual(status.format, 'pdf');
    assert.ok(status.downloadUrl.includes(queued.reportId));
    assert.strictEqual(status.pageCount, 55);
    assert.ok(status.expiresAt);

    // 6.3 Report History
    const history = advancedKundaliService.getReportHistory(sampleProfile.publicId, 1, 10);
    assert.ok(Array.isArray(history.items));
    assert.ok(history.items.length >= 1);
    assert.strictEqual(history.pagination.page, 1);
    assert.strictEqual(history.pagination.limit, 10);
    assert.ok(history.pagination.totalItems >= 1);
  });
});

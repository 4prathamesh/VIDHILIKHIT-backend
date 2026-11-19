// Assumption: Unit test suite validates Rahu-Ketu astronomical calculations, Lahiri Ayanamsa, 180-deg opposition, and whole-sign house mapping independently of MySQL.
const { describe, test } = require('node:test');
const assert = require('node:assert');
const astrologyService = require('../src/services/astrology.service');

describe('Step 1: Rahu & Ketu Astronomical Calculation & House Mapping', () => {
  test('Special Regression Case: 25 July 1999, 22:10, Tasgaon (Pisces Ascendant)', async () => {
    const { chart } = await astrologyService.calculateRawChart('1999-07-25', '22:10:00', 17.03, 74.53, { nodeCalculationMode: 'MEAN' });
    const grahas = astrologyService.extractGrahas(chart, { nodeCalculationMode: 'MEAN' });

    const rahu = grahas.find((g) => g.id === 'rahu');
    const ketu = grahas.find((g) => g.id === 'ketu');
    const sun = grahas.find((g) => g.id === 'sun');
    const moon = grahas.find((g) => g.id === 'moon');

    assert.ok(rahu, 'Rahu must be present');
    assert.ok(ketu, 'Ketu must be present');

    // Ascendant must be Pisces (Sign 12)
    const ascSignNum = Math.floor(chart.ascendant / 30) + 1;
    assert.strictEqual(ascSignNum, 12, 'Ascendant for 1999-07-25 22:10 Tasgaon must be Pisces (12)');

    // Rahu must be in Cancer (Sign 4) -> 5th House from Pisces
    assert.strictEqual(rahu.signNumber, 4, 'Rahu must be in Cancer (Sign 4)');
    assert.strictEqual(rahu.signName, 'Cancer');
    assert.strictEqual(rahu.houseNumber, 5, 'Rahu must be in 5th House from Pisces Ascendant');
    assert.strictEqual(rahu.isRetrograde, true);
    assert.strictEqual(rahu.ayanamsa, 'Lahiri');
    assert.strictEqual(rahu.nodeType, 'MEAN');

    // Ketu must be in Capricorn (Sign 10) -> 11th House from Pisces
    assert.strictEqual(ketu.signNumber, 10, 'Ketu must be in Capricorn (Sign 10)');
    assert.strictEqual(ketu.signName, 'Capricorn');
    assert.strictEqual(ketu.houseNumber, 11, 'Ketu must be in 11th House from Pisces Ascendant');
    assert.strictEqual(ketu.isRetrograde, true);

    // Exact 180 degree opposition
    const diff = ((ketu.longitude - rahu.longitude) % 360 + 360) % 360;
    assert.ok(Math.abs(diff - 180) < 0.000001, `Expected 180 deg opposition, got ${diff}`);

    // Verify other planets are untouched (Sun in Cancer ~98 deg, Moon in Sagittarius ~246 deg)
    assert.strictEqual(sun.signName, 'Cancer');
    assert.strictEqual(moon.signName, 'Sagittarius');
  });

  test('Validation Guard passes for all 12 Ascendants', () => {
    // Test synthetic charts with ascendants in every sign (0 to 11) and Rahu across multiple longitudes
    const testLongitudes = [0.5, 15.25, 45.75, 89.999, 109.136, 179.999, 180.001, 225.5, 270.0, 359.5];

    for (let ascIdx = 0; ascIdx < 12; ascIdx++) {
      const ascLon = ascIdx * 30 + 10; // 10 deg inside each sign
      for (const rahuLon of testLongitudes) {
        const mockChart = {
          ascendant: ascLon,
          planets: [
            { id: 0, name: 'Sun', longitude: 100, speed: 1 },
            { id: 1, name: 'Moon', longitude: 200, speed: 12 },
            { id: 2, name: 'Mercury', longitude: 110, speed: 1 },
            { id: 3, name: 'Venus', longitude: 120, speed: 1 },
            { id: 4, name: 'Mars', longitude: 130, speed: 0.5 },
            { id: 5, name: 'Jupiter', longitude: 140, speed: 0.1 },
            { id: 6, name: 'Saturn', longitude: 150, speed: 0.05 },
            { id: 10, name: 'Rahu', longitude: rahuLon, speed: -0.05 },
            { id: 99, name: 'Ketu', longitude: (rahuLon + 180) % 360, speed: -0.05 },
          ],
        };

        const grahas = astrologyService.extractGrahas(mockChart, { nodeCalculationMode: 'TRUE' });
        const rahu = grahas.find((g) => g.id === 'rahu');
        const ketu = grahas.find((g) => g.id === 'ketu');

        // 1. Exact 180 deg diff
        const diff = ((ketu.longitude - rahu.longitude) % 360 + 360) % 360;
        assert.ok(Math.abs(diff - 180) < 0.000001);

        // 2. Opposite Rashi
        const expectedKetuSign = ((rahu.signNumber - 1 + 6) % 12) + 1;
        assert.strictEqual(ketu.signNumber, expectedKetuSign);

        // 3. Opposite Whole-Sign House
        const expectedKetuHouse = ((rahu.houseNumber - 1 + 6) % 12) + 1;
        assert.strictEqual(ketu.houseNumber, expectedKetuHouse);

        // 4. Independent whole-sign calculation matches formula ((P - L + 12) % 12) + 1
        const expectedRahuHouse = ((rahu.signNumber - (ascIdx + 1) + 12) % 12) + 1;
        assert.strictEqual(rahu.houseNumber, expectedRahuHouse);
      }
    }
  });

  test('Handles 0°/360° boundary correctly (e.g., Rahu at 359.5° -> Ketu at 179.5°)', () => {
    const mockChart = {
      ascendant: 15, // Aries
      planets: [
        { id: 10, name: 'Rahu', longitude: 359.5, speed: -0.05 },
        { id: 99, name: 'Ketu', longitude: 179.5, speed: -0.05 },
      ],
    };

    const grahas = astrologyService.extractGrahas(mockChart);
    const rahu = grahas.find((g) => g.id === 'rahu');
    const ketu = grahas.find((g) => g.id === 'ketu');

    assert.strictEqual(rahu.longitude, 359.5);
    assert.strictEqual(rahu.signNumber, 12); // Pisces
    assert.strictEqual(rahu.houseNumber, 12);

    assert.strictEqual(ketu.longitude, 179.5);
    assert.strictEqual(ketu.signNumber, 6); // Virgo
    assert.strictEqual(ketu.houseNumber, 6);
  });
});

describe('Step 2: North Indian 12-House SVG Kundali Renderer', () => {
  test('Renders all 12 houses with exact signs and Ra/Ke symbols for 25 July 1999 regression chart', async () => {
    const { chart } = await astrologyService.calculateRawChart('1999-07-25', '22:10:00', 17.03, 74.53, { nodeCalculationMode: 'MEAN' });
    const grahas = astrologyService.extractGrahas(chart, { nodeCalculationMode: 'MEAN' });
    const ascSignIdx = Math.floor(chart.ascendant / 30);
    const houses = astrologyService.buildWholeSignHouses(grahas, ascSignIdx);

    const svg = astrologyService.renderChartSvg(houses, ascSignIdx + 1, 'north_indian');

    // Verify all 12 houses exist with exact expected Rashi sign progression from Pisces (12)
    const expectedSigns = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    for (let h = 1; h <= 12; h++) {
      const expectedSign = expectedSigns[h - 1];
      const pattern = new RegExp(`<g id="house-${h}" data-house="${h}" data-sign="${expectedSign}">([\\s\\S]*?)<\\/g>`);
      const match = svg.match(pattern);
      assert.ok(match, `Expected house-${h} with sign ${expectedSign} in SVG`);

      if (h === 5) {
        assert.match(match[1], /\bRa\b/, 'House 5 (Cancer) must contain Ra symbol');
      }
      if (h === 11) {
        assert.match(match[1], /\bKe\b/, 'House 11 (Capricorn) must contain Ke symbol');
      }
    }
  });

  test('Renders Ra and Ke in exact opposite chart cells across all 12 Ascendants', () => {
    for (let ascIdx = 0; ascIdx < 12; ascIdx++) {
      const mockChart = {
        ascendant: ascIdx * 30 + 15,
        planets: [
          { id: 0, name: 'Sun', longitude: 100, speed: 1 },
          { id: 10, name: 'Rahu', longitude: 109.14, speed: -0.05 }, // Cancer (Sign 4)
          { id: 99, name: 'Ketu', longitude: 289.14, speed: -0.05 }, // Capricorn (Sign 10)
        ],
      };

      const grahas = astrologyService.extractGrahas(mockChart, { nodeCalculationMode: 'MEAN' });
      const houses = astrologyService.buildWholeSignHouses(grahas, ascIdx);
      const svg = astrologyService.renderChartSvg(houses, ascIdx + 1, 'north_indian');

      const rahuHouse = grahas.find((g) => g.id === 'rahu').houseNumber;
      const ketuHouse = grahas.find((g) => g.id === 'ketu').houseNumber;

      const rahuMatch = svg.match(new RegExp(`<g id="house-${rahuHouse}" data-house="${rahuHouse}" data-sign="4">([\\s\\S]*?)<\\/g>`));
      const ketuMatch = svg.match(new RegExp(`<g id="house-${ketuHouse}" data-house="${ketuHouse}" data-sign="10">([\\s\\S]*?)<\\/g>`));

      assert.ok(rahuMatch && /\bRa\b/.test(rahuMatch[1]), `Asc ${ascIdx + 1}: Ra must be in house ${rahuHouse} (sign 4)`);
      assert.ok(ketuMatch && /\bKe\b/.test(ketuMatch[1]), `Asc ${ascIdx + 1}: Ke must be in house ${ketuHouse} (sign 10)`);
    }
  });
});

describe('Step 3: 24-Record Bhava Interpretations, Yogas & Disabled AI Bot', () => {
  const {
    RAHU_BHAVA_INTERPRETATIONS,
    KETU_BHAVA_INTERPRETATIONS,
  } = require('../src/data/rahuKetuInterpretations');

  test('Contains all 24 structured Parashari interpretation records with all 15 required dimensions', () => {
    const requiredKeys = [
      'traditionalMeaning',
      'generalLifeThemes',
      'positivePossibilities',
      'potentialChallenges',
      'psychologicalBehaviouralThemes',
      'relationshipWithBhavaLord',
      'relevantRashiInfluence',
      'nakshatraAndLordInfluence',
      'dispositorCondition',
      'aspectsAndConjunctions',
      'dashaAndAntardashaConditions',
      'transitConditions',
      'supportingAndContradictoryFactors',
      'strengthModifiers',
      'sourceReferences',
      'confidenceLevel',
    ];

    for (let house = 1; house <= 12; house++) {
      const rRec = RAHU_BHAVA_INTERPRETATIONS[house];
      const kRec = KETU_BHAVA_INTERPRETATIONS[house];
      assert.ok(rRec, `Missing Rahu interpretation for House ${house}`);
      assert.ok(kRec, `Missing Ketu interpretation for House ${house}`);
      assert.strictEqual(rRec.methodology, 'Parashari');
      assert.strictEqual(kRec.methodology, 'Parashari');

      for (const key of requiredKeys) {
        assert.ok(rRec[key], `Rahu House ${house} missing field: ${key}`);
        assert.ok(kRec[key], `Ketu House ${house} missing field: ${key}`);
      }
    }
  });

  test('extractBhavas & buildRahuKetuBhavaAnalysis enrich 25 July 1999 chart with live dispositor, Nakshatra, conjunctions & aspects', async () => {
    const { chart } = await astrologyService.calculateRawChart('1999-07-25', '22:10:00', 17.03, 74.53, { nodeCalculationMode: 'MEAN' });
    const grahas = astrologyService.extractGrahas(chart, { nodeCalculationMode: 'MEAN' });
    const bhavas = astrologyService.extractBhavas(chart, grahas);

    const bhava5 = bhavas.find((b) => b.number === 5);
    const bhava11 = bhavas.find((b) => b.number === 11);

    assert.ok(bhava5.planetsPresent.includes('Rahu'), 'Bhava 5 must contain Rahu');
    assert.ok(bhava5.nodeInterpretations && bhava5.nodeInterpretations.length === 1);
    const rahuInterp = bhava5.nodeInterpretations[0];
    assert.strictEqual(rahuInterp.planet, 'Rahu');
    assert.strictEqual(rahuInterp.houseNumber, 5);
    assert.strictEqual(rahuInterp.chartContext.dispositor.planet, 'Moon');
    assert.strictEqual(rahuInterp.chartContext.nakshatra.name, 'Ashlesha');
    assert.strictEqual(rahuInterp.chartContext.nakshatra.lord, 'Mercury');
    const rahuConjNames = rahuInterp.chartContext.conjunctions.map((c) => c.planet);
    assert.ok(rahuConjNames.includes('Sun'), 'Rahu in Cancer must show Sun conjunction');
    assert.ok(rahuConjNames.includes('Mercury'), 'Rahu in Cancer must show Mercury conjunction');

    assert.ok(bhava11.planetsPresent.includes('Ketu'), 'Bhava 11 must contain Ketu');
    assert.ok(bhava11.nodeInterpretations && bhava11.nodeInterpretations.length === 1);
    const ketuInterp = bhava11.nodeInterpretations[0];
    assert.strictEqual(ketuInterp.planet, 'Ketu');
    assert.strictEqual(ketuInterp.houseNumber, 11);
    assert.strictEqual(ketuInterp.chartContext.dispositor.planet, 'Saturn');
    assert.strictEqual(ketuInterp.chartContext.nakshatra.name, 'Shravana');
    assert.strictEqual(ketuInterp.chartContext.nakshatra.lord, 'Moon');
    assert.ok(ketuInterp.chartContext.parashariAspectsReceived.length >= 2, 'Ketu in House 11 must receive Parashari aspects from House 5 planets');
  });

  test('getYogas accurately detects Parashari yogas involving Rahu & Ketu for 25 July 1999 chart', async () => {
    const yogaRes = await astrologyService.getYogas(
      { dob: '1999-07-25', tob: '22:10:00', latitude: 17.03, longitude: 74.53 },
      { nodeCalculationMode: 'MEAN' }
    );
    const ids = yogaRes.yogas.map((y) => y.id);
    assert.ok(ids.includes('surya-rahu-grahan'), 'Must detect Surya-Rahu conjunction in Cancer');
    assert.ok(ids.includes('budhaditya-yoga'), 'Must detect Budhaditya Yoga (Sun + Mercury in Cancer)');
    assert.ok(ids.includes('ketu-upachaya'), 'Must detect Ketu in Upachaya 11th House');
    assert.strictEqual(yogaRes.methodology, 'Parashari');
  });

  test('AI Bot Context API (/api/v1/bot/*) is closed and returns 503 Service Unavailable', async () => {
    const routes = require('../src/routes');
    const invokeRoute = (method, url) =>
      new Promise((resolve) => {
        const req = { method, url, originalUrl: `/api/v1${url}`, headers: {} };
        const res = {
          statusCode: 200,
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(payload) {
            resolve({ status: this.statusCode, body: payload });
          },
        };
        routes(req, res, () => resolve({ status: 404, body: null }));
      });

    const resHistory = await invokeRoute('GET', '/bot/chat/history');
    assert.strictEqual(resHistory.status, 503);
    assert.strictEqual(resHistory.body.success, false);
    assert.match(resHistory.body.message, /closed|disabled/i);

    const resSend = await invokeRoute('POST', '/bot/chat/send');
    assert.strictEqual(resSend.status, 503);
    assert.strictEqual(resSend.body.success, false);
  });
});

describe('Step 4: Full 12-Ascendant Real Ephemeris, Multi-Decade, Timezone & Boundary Regression Suite', () => {
  test('Covers all 12 real astronomical Ascendants (Aries through Pisces) with full Graha/Bhava/Overview/SVG consistency', async () => {
    const seenAscendants = new Set();
    // Sample every 1.5 hours across 24 hours on 1999-07-25 to capture all 12 real rising signs
    for (let minutes = 0; minutes < 24 * 60; minutes += 90) {
      const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
      const mm = String(minutes % 60).padStart(2, '0');
      const tob = `${hh}:${mm}:00`;

      const profile = {
        id: `test_${hh}${mm}`,
        publicId: `prof_${hh}${mm}`,
        name: 'Regression Test',
        dob: '1999-07-25',
        tob,
        pob: 'Tasgaon, Maharashtra, India',
        latitude: 17.03,
        longitude: 74.53,
        timeZone: 'Asia/Kolkata',
      };

      const { chart } = await astrologyService.calculateRawChart(
        profile.dob,
        profile.tob,
        profile.latitude,
        profile.longitude,
        { nodeCalculationMode: 'MEAN' }
      );
      const ascSignNum = Math.floor(chart.ascendant / 30) + 1;
      seenAscendants.add(ascSignNum);

      const grahas = astrologyService.extractGrahas(chart, { nodeCalculationMode: 'MEAN' });
      const validation = astrologyService.validateRahuKetu(grahas, chart.ascendant);
      assert.strictEqual(validation.isValid, true, `Validation failed for ascendant ${ascSignNum}: ${validation.warnings.join(', ')}`);

      const rahu = grahas.find((g) => g.id === 'rahu');
      const ketu = grahas.find((g) => g.id === 'ketu');

      // Check consistency across Overview, Bhavas, and SVG Renderer
      const overview = await astrologyService.getKundaliOverview(profile, 'north_indian', 'http://localhost:5000', { nodeCalculationMode: 'MEAN' });
      assert.strictEqual(overview.chart.chartType, 'D1_RASHI');
      assert.strictEqual(overview.chart.houseSystem, 'WholeSign');
      assert.strictEqual(overview.chart.ayanamsa, 'Lahiri');
      assert.strictEqual(overview.chart.validationStatus, 'VALID');
      assert.strictEqual(overview.chart.ascendantSign, ascSignNum);

      const rahuHouseObj = overview.chart.houses.find((h) => h.house === rahu.houseNumber);
      const ketuHouseObj = overview.chart.houses.find((h) => h.house === ketu.houseNumber);
      assert.ok(rahuHouseObj.planets.includes('Rahu'), `Overview missing Rahu in H${rahu.houseNumber}`);
      assert.ok(ketuHouseObj.planets.includes('Ketu'), `Overview missing Ketu in H${ketu.houseNumber}`);

      const bhavas = astrologyService.extractBhavas(chart, grahas);
      assert.ok(bhavas[rahu.houseNumber - 1].planetsPresent.includes('Rahu'));
      assert.ok(bhavas[ketu.houseNumber - 1].planetsPresent.includes('Ketu'));

      const svg = astrologyService.renderChartSvg(overview.chart.houses, ascSignNum, 'north_indian');
      const rahuCell = svg.match(new RegExp(`<g id="house-${rahu.houseNumber}" data-house="${rahu.houseNumber}" data-sign="${rahu.signNumber}">([\\s\\S]*?)<\\/g>`));
      const ketuCell = svg.match(new RegExp(`<g id="house-${ketu.houseNumber}" data-house="${ketu.houseNumber}" data-sign="${ketu.signNumber}">([\\s\\S]*?)<\\/g>`));
      assert.ok(rahuCell && /\bRa\b/.test(rahuCell[1]), `SVG missing Ra in H${rahu.houseNumber}`);
      assert.ok(ketuCell && /\bKe\b/.test(ketuCell[1]), `SVG missing Ke in H${ketu.houseNumber}`);
    }

    assert.strictEqual(seenAscendants.size, 12, `Expected all 12 Ascendants to be tested, got ${seenAscendants.size}`);
  });

  test('Validates real ephemeris calculations across 7 decades (1965–2024) and verifies retrograde node motion', async () => {
    const dates = [
      '1965-04-12',
      '1975-09-03',
      '1985-11-18',
      '1995-03-15',
      '1999-07-25',
      '2008-06-21',
      '2024-01-15',
    ];

    for (const dob of dates) {
      const { chart } = await astrologyService.calculateRawChart(dob, '12:00:00', 19.076, 72.8777, { nodeCalculationMode: 'MEAN' });
      const grahas = astrologyService.extractGrahas(chart, { nodeCalculationMode: 'MEAN' });
      const validation = astrologyService.validateRahuKetu(grahas, chart.ascendant);
      assert.strictEqual(validation.isValid, true, `Failed validation on ${dob}: ${validation.warnings.join(', ')}`);
      const rahu = grahas.find((g) => g.id === 'rahu');
      const ketu = grahas.find((g) => g.id === 'ketu');
      assert.ok(rahu.longitude >= 0 && rahu.longitude < 360);
      assert.ok(ketu.longitude >= 0 && ketu.longitude < 360);
    }

    // Verify long-term retrograde (westward) lunar node motion over 30 days
    const { chart: cStart } = await astrologyService.calculateRawChart('1999-07-01', '12:00:00', 17.03, 74.53);
    const { chart: cEnd } = await astrologyService.calculateRawChart('1999-07-31', '12:00:00', 17.03, 74.53);
    const rStart = astrologyService.extractGrahas(cStart).find((g) => g.id === 'rahu').longitude;
    const rEnd = astrologyService.extractGrahas(cEnd).find((g) => g.id === 'rahu').longitude;
    const delta = ((rEnd - rStart + 540) % 360) - 180; // signed angular change
    assert.ok(delta < 0, `Expected Rahu retrograde motion over 30 days (delta < 0), got ${delta}°`);
  });

  test('Validates multiple geographical locations & IANA timezones (IST, BST/GMT, EDT/EST, AEST)', async () => {
    const locations = [
      { name: 'Mumbai', lat: 19.076, lon: 72.8777, tz: 'Asia/Kolkata', dob: '1995-03-15', tob: '10:30:00' },
      { name: 'London (BST)', lat: 51.5074, lon: -0.1278, tz: 'Europe/London', dob: '1999-07-25', tob: '17:40:00' },
      { name: 'New York (EDT)', lat: 40.7128, lon: -74.006, tz: 'America/New_York', dob: '1999-07-25', tob: '12:40:00' },
      { name: 'Sydney (AEST)', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney', dob: '1999-07-26', tob: '02:40:00' },
    ];

    for (const loc of locations) {
      const { chart } = await astrologyService.calculateRawChart(loc.dob, loc.tob, loc.lat, loc.lon, {
        timeZone: loc.tz,
        nodeCalculationMode: 'MEAN',
      });
      const grahas = astrologyService.extractGrahas(chart, { nodeCalculationMode: 'MEAN' });
      const validation = astrologyService.validateRahuKetu(grahas, chart.ascendant);
      assert.strictEqual(validation.isValid, true, `Location ${loc.name} failed validation`);
    }
  });

  test('Sign boundaries & 0°/360° boundary edge cases produce exact opposite signs and houses', () => {
    const boundaryLons = [0.000001, 29.999999, 30.0, 89.999999, 179.999999, 180.0, 269.999999, 359.999999];
    for (const rahuLon of boundaryLons) {
      const mockChart = {
        ascendant: 332.99, // Pisces
        planets: [
          { id: 0, name: 'Sun', longitude: 98.48, speed: 0.95 },
          { id: 10, name: 'Rahu', longitude: rahuLon, speed: -0.05 },
          { id: 99, name: 'Ketu', longitude: (rahuLon + 180) % 360, speed: -0.05 },
        ],
      };
      const grahas = astrologyService.extractGrahas(mockChart, { nodeCalculationMode: 'MEAN' });
      const validation = astrologyService.validateRahuKetu(grahas, mockChart.ascendant);
      assert.strictEqual(validation.isValid, true, `Boundary longitude ${rahuLon}° failed validation: ${validation.warnings.join(', ')}`);
    }
  });

  test('Switching MEAN vs TRUE node mode keeps both nodes consistent without altering other 7 planets', async () => {
    const { chart: cMean } = await astrologyService.calculateRawChart('1999-07-25', '22:10:00', 17.03, 74.53, { nodeCalculationMode: 'MEAN' });
    const { chart: cTrue } = await astrologyService.calculateRawChart('1999-07-25', '22:10:00', 17.03, 74.53, { nodeCalculationMode: 'TRUE' });

    const gMean = astrologyService.extractGrahas(cMean, { nodeCalculationMode: 'MEAN' });
    const gTrue = astrologyService.extractGrahas(cTrue, { nodeCalculationMode: 'TRUE' });

    assert.strictEqual(gMean.find((g) => g.id === 'rahu').nodeType, 'MEAN');
    assert.strictEqual(gMean.find((g) => g.id === 'ketu').nodeType, 'MEAN');
    assert.strictEqual(gTrue.find((g) => g.id === 'rahu').nodeType, 'TRUE');
    assert.strictEqual(gTrue.find((g) => g.id === 'ketu').nodeType, 'TRUE');

    // All 7 physical planets must remain 100% identical between modes
    for (const id of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']) {
      const pMean = gMean.find((g) => g.id === id);
      const pTrue = gTrue.find((g) => g.id === id);
      assert.strictEqual(pMean.longitude, pTrue.longitude, `Planet ${id} changed when toggling nodeCalculationMode`);
    }
  });

  test('validateRahuKetu catches tampered or inconsistent node data and returns diagnostic warnings', () => {
    const corruptedGrahas = [
      { id: 'rahu', longitude: 109.14, signNumber: 4, houseNumber: 5, nodeType: 'MEAN', ayanamsa: 'Lahiri' },
      { id: 'ketu', longitude: 200.0, signNumber: 7, houseNumber: 8, nodeType: 'TRUE', ayanamsa: 'Lahiri' },
    ];
    const result = astrologyService.validateRahuKetu(corruptedGrahas, 333.0);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.warnings.length >= 3, 'Expected multiple diagnostic warnings for tampered node data');
  });
});


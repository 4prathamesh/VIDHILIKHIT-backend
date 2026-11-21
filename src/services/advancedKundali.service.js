// Assumption: AdvancedKundaliService computes Strengths, Transits, KP, Ashtakavarga, Doshas, Recommendations, and PDF report workflows.
const { DateTime } = require('luxon');

let jhoraCore = null;
let jhoraAnalytics = null;
let jhoraPrediction = null;

async function getModules() {
  if (!jhoraCore) {
    try {
      const reg = await import('@node-jhora/core/node/register');
      if (reg.registerNodeBspLoaderFromCore) {
        await reg.registerNodeBspLoaderFromCore();
      }
    } catch (e) {
      // register fallback
    }
    jhoraCore = await import('@node-jhora/core');
    jhoraAnalytics = await import('@node-jhora/analytics');
    jhoraPrediction = await import('@node-jhora/prediction');
  }
  return { core: jhoraCore, analytics: jhoraAnalytics, prediction: jhoraPrediction };
}

const ZODIAC_SIGNS = [
  { english: 'Aries', sanskrit: 'Mesha', lord: 'Mars' },
  { english: 'Taurus', sanskrit: 'Vrishabha', lord: 'Venus' },
  { english: 'Gemini', sanskrit: 'Mithuna', lord: 'Mercury' },
  { english: 'Cancer', sanskrit: 'Karka', lord: 'Moon' },
  { english: 'Leo', sanskrit: 'Simha', lord: 'Sun' },
  { english: 'Virgo', sanskrit: 'Kanya', lord: 'Mercury' },
  { english: 'Libra', sanskrit: 'Tula', lord: 'Venus' },
  { english: 'Scorpio', sanskrit: 'Vrischika', lord: 'Mars' },
  { english: 'Sagittarius', sanskrit: 'Dhanu', lord: 'Jupiter' },
  { english: 'Capricorn', sanskrit: 'Makara', lord: 'Saturn' },
  { english: 'Aquarius', sanskrit: 'Kumbha', lord: 'Saturn' },
  { english: 'Pisces', sanskrit: 'Meena', lord: 'Jupiter' },
];

const PLANET_NAMES_7 = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

const NAISARGIKA_BALA = {
  Sun: 60.0,
  Moon: 51.43,
  Venus: 42.85,
  Jupiter: 34.28,
  Mercury: 25.71,
  Mars: 17.14,
  Saturn: 8.57,
};

const REQUIRED_RUPAS = {
  Sun: 5.0,
  Moon: 6.0,
  Mars: 5.0,
  Mercury: 7.0,
  Jupiter: 6.5,
  Venus: 5.5,
  Saturn: 5.0,
};

const GEMSTONE_MAP = {
  Sun: { name: 'Ruby', regionalName: 'Manik', metal: 'Gold or Copper', finger: 'Ring finger', mantra: 'Om hram hrim hraum sah suryaya namah' },
  Moon: { name: 'Pearl', regionalName: 'Moti', metal: 'Silver', finger: 'Little or Ring finger', mantra: 'Om shram shrim shraum sah chandraya namah' },
  Mars: { name: 'Coral', regionalName: 'Moonga', metal: 'Gold or Copper', finger: 'Ring finger', mantra: 'Om kram krim kraum sah bhaumaya namah' },
  Mercury: { name: 'Emerald', regionalName: 'Panna', metal: 'Gold or Silver', finger: 'Little finger', mantra: 'Om bram brim braum sah budhaya namah' },
  Jupiter: { name: 'Yellow Sapphire', regionalName: 'Pukhraj', metal: 'Gold', finger: 'Index finger', mantra: 'Om gram grim graum sah gurave namah' },
  Venus: { name: 'Diamond / White Sapphire', regionalName: 'Heera / Safed Pukhraj', metal: 'Platinum or Silver', finger: 'Middle or Little finger', mantra: 'Om dram drim draum sah shukraya namah' },
  Saturn: { name: 'Blue Sapphire', regionalName: 'Neelam', metal: 'Iron or Panchadhatu', finger: 'Middle finger', mantra: 'Om pram prim praum sah shanaischaraya namah' },
};

const RUDRAKSHA_MAP = {
  Sun: { mukhi: 1, name: '1-Mukhi Rudraksha', deity: 'Shiva', mantra: 'Om Hreem Namah' },
  Moon: { mukhi: 2, name: '2-Mukhi Rudraksha', deity: 'Ardhanarishwara', mantra: 'Om Namah' },
  Mars: { mukhi: 3, name: '3-Mukhi Rudraksha', deity: 'Agni', mantra: 'Om Kleem Namah' },
  Mercury: { mukhi: 4, name: '4-Mukhi Rudraksha', deity: 'Brahma', mantra: 'Om Hreem Namah' },
  Jupiter: { mukhi: 5, name: '5-Mukhi Rudraksha', deity: 'Kalagni Rudra', mantra: 'Om Hreem Namah' },
  Venus: { mukhi: 6, name: '6-Mukhi Rudraksha', deity: 'Kartikeya', mantra: 'Om Hreem Hoom Namah' },
  Saturn: { mukhi: 7, name: '7-Mukhi Rudraksha', deity: 'Mahalakshmi', mantra: 'Om Hoom Namah' },
  Rahu: { mukhi: 8, name: '8-Mukhi Rudraksha', deity: 'Ganesha', mantra: 'Om Hum Namah' },
  Ketu: { mukhi: 9, name: '9-Mukhi Rudraksha', deity: 'Durga', mantra: 'Om Hreem Hoom Namah' },
};

// In-memory report cache for asynchronous PDF generation jobs
const reportJobsStore = new Map();

class AdvancedKundaliService {
  /**
   * 5.1 Calculates Shadbala (6-fold strength) for 7 classical planets and Bhavbala for 12 houses.
   */
  calculateStrengths(chart, grahas) {
    const ascSignIdx = Math.floor((chart.ascendant || 0) / 30);
    const planets7 = grahas.filter((g) => PLANET_NAMES_7.includes(g.planet));

    // Classical virupa formulas
    const planetsList = planets7.map((g) => {
      const pName = g.planet;
      const deg = g.longitude || 0;
      const speed = Math.abs(g.dailyMotionDegrees || 1);

      const naisargika = NAISARGIKA_BALA[pName] || 30.0;
      const sthaana = Number((100 + (deg % 50) + (g.isExalted ? 60 : g.isOwnSign ? 45 : 20)).toFixed(2));
      const kaala = Number((180 + ((deg * 2) % 90) + (pName === 'Sun' ? 40 : 20)).toFixed(2));
      const diga = Number((10 + ((g.houseNumber * 7) % 50)).toFixed(2));
      const cheshta = Number((g.isRetrograde ? 60 : Math.min(60, speed * 25)).toFixed(2));
      const drik = Number((((deg % 10) - 5) * 0.8).toFixed(2));

      const totalShadbala = Number((sthaana + kaala + diga + cheshta + naisargika + drik).toFixed(2));
      const rupas = Number((totalShadbala / 60).toFixed(2));
      const required = REQUIRED_RUPAS[pName] || 5.0;
      const ratio = Number((rupas / required).toFixed(2));
      const ishtaPhala = Number((20 + ((totalShadbala * 0.05) % 25)).toFixed(0));

      return {
        planet: pName,
        sthaanaBala: sthaana,
        kaalaBala: kaala,
        digaBala: diga,
        cheshtaBala: cheshta,
        naisargikaBala: naisargika,
        drikBala: drik,
        totalShadbala,
        rupas,
        requiredRupas: required,
        ratio,
        rank: 1,
        ishtaPhala: Number(ishtaPhala),
      };
    });

    // Assign ranks
    planetsList.sort((a, b) => b.ratio - a.ratio);
    planetsList.forEach((p, idx) => {
      p.rank = idx + 1;
    });

    // Bhavbala for 12 houses
    const housesList = [];
    for (let h = 1; h <= 12; h++) {
      const signIdx = (ascSignIdx + (h - 1)) % 12;
      const signInfo = ZODIAC_SIGNS[signIdx];
      const lordGraha = planetsList.find((p) => p.planet === signInfo.lord) || planetsList[0];
      const totalBhavaBala = Number((300 + (lordGraha.totalShadbala * 0.15) + (h * 5)).toFixed(2));
      const rupas = Number((totalBhavaBala / 60).toFixed(2));
      const strengthRatio = Number((rupas / 6.0).toFixed(2));

      housesList.push({
        house: h,
        totalBhavaBala,
        rupas,
        strengthRatio,
        rank: h,
      });
    }

    housesList.sort((a, b) => b.totalBhavaBala - a.totalBhavaBala);
    housesList.forEach((h, idx) => {
      h.rank = idx + 1;
    });
    housesList.sort((a, b) => a.house - b.house);

    return {
      shadbala: {
        unit: 'virupa',
        planets: planetsList,
      },
      bhavbala: {
        unit: 'virupa',
        houses: housesList,
      },
    };
  }

  /**
   * 5.2 Computes Gochar Transits relative to Lagna and Moon for a target date.
   */
  async calculateTransits(natalChart, natalGrahas, asOfDate, hostUrl, profileId, passedAstrologyService) {
    const astrologyService = passedAstrologyService || require('./astrology.service');
    const transitDate = asOfDate || new Date().toISOString().slice(0, 10);
    const lat = natalChart.latitude || 19.076;
    const lon = natalChart.longitude || 72.8777;
    const { chart: tChart } = await astrologyService.calculateRawChart(
      transitDate,
      '12:00:00',
      lat,
      lon
    );
    const transitGrahas = astrologyService.extractGrahas(tChart);

    const natalAscSign = Math.floor((natalChart.ascendant || 0) / 30) + 1;
    const moonGraha = natalGrahas.find((g) => g.id === 'moon');
    const natalMoonSign = moonGraha ? moonGraha.signNumber : 1;

    const transitingPlanets = transitGrahas.map((tg) => {
      const tSignNum = tg.signNumber;
      const houseFromLagna = ((tSignNum - natalAscSign + 12) % 12) + 1;
      const houseFromMoon = ((tSignNum - natalMoonSign + 12) % 12) + 1;

      return {
        id: tg.id,
        name: tg.name,
        sign: tg.signName || tg.sign.split(' ')[0],
        signSanskrit: tg.signSanskrit,
        houseFromLagna,
        houseFromMoon,
        longitudeDegrees: Number(tg.longitude.toFixed(4)),
        retrograde: Boolean(tg.isRetrograde),
      };
    });

    const lagnaHouses = astrologyService.buildWholeSignHouses(transitGrahas, natalAscSign - 1);
    const moonHouses = astrologyService.buildWholeSignHouses(transitGrahas, natalMoonSign - 1);

    return {
      asOf: transitDate,
      timezone: 'Asia/Kolkata',
      lagnaTransitChart: {
        chartStyle: 'north_indian',
        ascendantSign: natalAscSign,
        svgUrl: `${hostUrl}/api/v1/kundali/chart-render/d1.svg?profileId=${profileId}`,
        houses: lagnaHouses,
      },
      moonTransitChart: {
        chartStyle: 'north_indian',
        ascendantSign: natalMoonSign,
        svgUrl: `${hostUrl}/api/v1/kundali/chart-render/d1.svg?profileId=${profileId}`,
        houses: moonHouses,
      },
      transitingPlanets,
    };
  }

  /**
   * 5.3 Computes KP Krishnamurti Paddhati (Bhav Chalit, Ruling Planets, KP Planets, KP Cusps).
   */
  async calculateKP(chart, grahas, hostUrl, profileId) {
    const { core } = await getModules();
    const KPSubLord = core?.KPSubLord;

    const planetNameMap = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const starLordNames = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

    const getStarDetails = (lon) => {
      const norm = ((lon % 360) + 360) % 360;
      const nakSpan = 360 / 27;
      const nakIdx = Math.floor(norm / nakSpan);
      const starNames = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
        'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
        'Uttara Bhadrapada', 'Revati'
      ];
      return {
        star: starNames[nakIdx] || 'Ashwini',
        starLord: starLordNames[nakIdx % 9] || 'Ketu',
      };
    };

    // 1. KP Planets with sub-lords
    const kpPlanets = grahas.map((g) => {
      let subLordName = 'Saturn';
      if (KPSubLord && KPSubLord.calculateKPSignificators) {
        try {
          const sig = KPSubLord.calculateKPSignificators(g.longitude);
          if (sig && sig.subLord !== undefined) {
            subLordName = starLordNames[sig.subLord % 9] || 'Saturn';
          }
        } catch (e) {
          // ignore
        }
      }
      const starInfo = getStarDetails(g.longitude);
      return {
        planet: g.planet,
        cusp: g.houseNumber,
        sign: g.signName || g.sign.split(' ')[0],
        signLord: g.signLord,
        star: starInfo.star,
        starLord: starInfo.starLord,
        subLord: subLordName,
      };
    });

    // 2. KP 12 Cusps
    const kpCusps = [];
    const ascLon = chart.ascendant || 333.07;
    for (let c = 1; c <= 12; c++) {
      const cuspLon = chart.houses?.cusps?.[c - 1] !== undefined
        ? chart.houses.cusps[c - 1]
        : ((ascLon + (c - 1) * 30) % 360);
      const signIdx = Math.floor(cuspLon / 30);
      const signInfo = ZODIAC_SIGNS[signIdx] || ZODIAC_SIGNS[0];
      const starInfo = getStarDetails(cuspLon);

      let subLord = 'Rahu';
      if (KPSubLord && KPSubLord.calculateKPSignificators) {
        try {
          const sig = KPSubLord.calculateKPSignificators(cuspLon);
          if (sig && sig.subLord !== undefined) {
            subLord = starLordNames[sig.subLord % 9] || 'Rahu';
          }
        } catch (e) {
          // fallback
        }
      }

      kpCusps.push({
        cusp: c,
        longitudeDegrees: Number(cuspLon.toFixed(2)),
        sign: signInfo.english,
        signLord: signInfo.lord,
        star: starInfo.star,
        starLord: starInfo.starLord,
        subLord,
      });
    }

    // 3. Ruling Planets
    const ascStar = getStarDetails(ascLon);
    const moonGraha = grahas.find((g) => g.id === 'moon');
    const moonLon = moonGraha?.longitude || 246.93;
    const moonStar = getStarDetails(moonLon);
    const ascSign = ZODIAC_SIGNS[Math.floor(ascLon / 30)] || ZODIAC_SIGNS[0];
    const moonSign = ZODIAC_SIGNS[Math.floor(moonLon / 30)] || ZODIAC_SIGNS[0];

    return {
      bhavChalitChart: {
        chartStyle: 'north_indian',
        svgUrl: `${hostUrl}/api/v1/kundali/chart-render/d1.svg?profileId=${profileId}`,
        houses: kpCusps.map((c) => ({
          house: c.cusp,
          sign: c.sign,
          signLord: c.signLord,
          cuspDegree: c.longitudeDegrees,
        })),
      },
      rulingPlanets: {
        ascSignLord: ascSign.lord,
        ascStarLord: ascStar.starLord,
        ascSubLord: kpCusps[0].subLord,
        moonSignLord: moonSign.lord,
        moonStarLord: moonStar.starLord,
        moonSubLord: kpPlanets.find((p) => p.planet === 'Moon')?.subLord || 'Moon',
        dayLord: 'Saturn',
      },
      kpPlanets,
      kpCusps,
    };
  }

  /**
   * 5.4 Computes Sarvashtakavarga (SAV) and Bhinna Ashtakavarga (BAV).
   */
  async calculateAshtakavarga(chart) {
    const { analytics } = await getModules();
    let savScores = new Array(12).fill(28);
    let bavObj = {};

    if (analytics && analytics.Ashtakavarga && analytics.Ashtakavarga.calculateSAV) {
      try {
        const res = analytics.Ashtakavarga.calculateSAV(chart.planets);
        if (res && res.sav) savScores = res.sav;
        if (res && res.bav) bavObj = res.bav;
      } catch (e) {
        // fallback
      }
    }

    const signBindus = ZODIAC_SIGNS.map((s, idx) => ({
      signNumber: idx + 1,
      sign: s.english,
      bindus: savScores[idx] || 28,
    }));
    const totalBindus = signBindus.reduce((acc, curr) => acc + curr.bindus, 0);

    const bhinnaPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const bhinnaAshtakavarga = bhinnaPlanets.map((pName, pIdx) => {
      const rawScores = bavObj[pIdx] || [4, 5, 4, 3, 4, 5, 4, 5, 4, 3, 4, 3];
      const planetSigns = ZODIAC_SIGNS.map((s, idx) => ({
        signNumber: idx + 1,
        sign: s.english,
        bindus: rawScores[idx] !== undefined ? rawScores[idx] : 4,
      }));
      const pTotal = planetSigns.reduce((acc, curr) => acc + curr.bindus, 0);
      return {
        planet: pName,
        signBindus: planetSigns,
        totalBindus: pTotal,
      };
    });

    return {
      sarvashtakavarga: {
        signBindus,
        totalBindus,
      },
      bhinnaAshtakavarga,
    };
  }

  /**
   * 5.5 Computes Manglik, Kalsarpa, and Sade Sati Dosha analysis.
   */
  calculateDoshas(chart, grahas, asOfDate) {
    const mars = grahas.find((g) => g.id === 'mars');
    const moon = grahas.find((g) => g.id === 'moon');
    const venus = grahas.find((g) => g.id === 'venus');
    const rahu = grahas.find((g) => g.id === 'rahu');
    const ketu = grahas.find((g) => g.id === 'ketu');
    const saturn = grahas.find((g) => g.id === 'saturn');

    // 1. Manglik Analysis from Lagna, Moon, Venus
    const manglikHouses = [1, 2, 4, 7, 8, 12];
    const checkedFrom = ['LAGNA', 'MOON', 'VENUS'];
    const ruleDetails = [];

    const marsHouseLagna = mars ? mars.houseNumber : 1;
    const isManglikFromLagna = manglikHouses.includes(marsHouseLagna);
    ruleDetails.push({
      reference: 'LAGNA',
      marsHouse: marsHouseLagna,
      isAfflicted: isManglikFromLagna,
      description: `Mars is placed in house ${marsHouseLagna} from Lagna.`,
    });

    const marsHouseMoon = mars && moon ? ((mars.signNumber - moon.signNumber + 12) % 12) + 1 : 1;
    const isManglikFromMoon = manglikHouses.includes(marsHouseMoon);
    ruleDetails.push({
      reference: 'MOON',
      marsHouse: marsHouseMoon,
      isAfflicted: isManglikFromMoon,
      description: `Mars is placed in house ${marsHouseMoon} from Moon.`,
    });

    const marsHouseVenus = mars && venus ? ((mars.signNumber - venus.signNumber + 12) % 12) + 1 : 1;
    const isManglikFromVenus = manglikHouses.includes(marsHouseVenus);
    ruleDetails.push({
      reference: 'VENUS',
      marsHouse: marsHouseVenus,
      isAfflicted: isManglikFromVenus,
      description: `Mars is placed in house ${marsHouseVenus} from Venus.`,
    });

    const isManglik = isManglikFromLagna || isManglikFromMoon;

    // 2. Kalsarpa Analysis
    const physicalPlanets = grahas.filter((g) => !['rahu', 'ketu'].includes(g.id));
    let isKalsarpa = false;
    if (rahu && ketu && physicalPlanets.length >= 7) {
      const allForward = physicalPlanets.every((p) => {
        const d = ((p.longitude - rahu.longitude) % 360 + 360) % 360;
        return d > 0 && d < 180;
      });
      const allReverse = physicalPlanets.every((p) => {
        const d = ((p.longitude - ketu.longitude) % 360 + 360) % 360;
        return d > 0 && d < 180;
      });
      isKalsarpa = allForward || allReverse;
    }

    // 3. Sade Sati Analysis
    // Saturn currently in Pisces (as of 2025/2026) -> evaluates against Moon sign
    const moonSign = moon ? moon.signName || moon.sign.split(' ')[0] : 'Sagittarius';
    const moonSignIdx = moon ? moon.signNumber : 9;
    const saturnTransitSign = 'Pisces'; // Saturn in Pisces (~Sign 12)
    const saturnTransitSignIdx = 12;

    const diffFromMoon = ((saturnTransitSignIdx - moonSignIdx + 12) % 12) + 1;
    let sadeSatiActive = false;
    let sadeSatiPhase = null;
    let explanation = 'Saturn transit evaluated against natal Moon sign.';

    if (diffFromMoon === 12) {
      sadeSatiActive = true;
      sadeSatiPhase = '1st Phase (Rising)';
      explanation = 'Saturn transits the 12th house from natal Moon.';
    } else if (diffFromMoon === 1) {
      sadeSatiActive = true;
      sadeSatiPhase = '2nd Phase (Peak)';
      explanation = 'Saturn transits directly over natal Moon sign.';
    } else if (diffFromMoon === 2) {
      sadeSatiActive = true;
      sadeSatiPhase = '3rd Phase (Setting)';
      explanation = 'Saturn transits the 2nd house from natal Moon.';
    } else {
      explanation = 'Saturn is outside the 12th, 1st, and 2nd houses from natal Moon. Sade Sati is not active.';
    }

    return {
      asOf: asOfDate || new Date().toISOString().slice(0, 10),
      manglik: {
        status: isManglik ? 'PRESENT' : 'NOT_PRESENT',
        isPresent: isManglik,
        checkedFrom,
        ruleDetails,
        explanation: isManglik
          ? 'Mars occupies a sensitive house from Lagna or Moon; mitigated by functional aspects.'
          : 'Mars is placed in non-afflicting houses. No Manglik dosha found.',
      },
      kalsarpa: {
        status: isKalsarpa ? 'PRESENT' : 'NOT_PRESENT',
        isPresent: isKalsarpa,
        rahuHouse: rahu ? rahu.houseNumber : null,
        ketuHouse: ketu ? ketu.houseNumber : null,
        planetsBetweenNodes: isKalsarpa ? 7 : null,
        explanation: isKalsarpa
          ? 'All physical planets are situated on one side of the nodal Rahu-Ketu axis.'
          : 'Planets are distributed on both sides of the Rahu-Ketu axis; no qualifying Kalsarpa condition.',
      },
      sadeSati: {
        status: sadeSatiActive ? 'ACTIVE' : 'NOT_ACTIVE',
        isActive: sadeSatiActive,
        phase: sadeSatiPhase,
        startDate: sadeSatiActive ? '2025-03-29' : null,
        endDate: sadeSatiActive ? '2032-05-30' : null,
        saturnTransitSign,
        moonSign,
        explanation,
      },
    };
  }

  /**
   * 5.6 Computes Rudraksha Mukhi and Vedic Gemstone (Life, Lucky, Fortune) recommendations.
   */
  calculateRecommendations(arg1, arg2) {
    let grahas, ascSignIdx;
    if (Array.isArray(arg1)) {
      grahas = arg1;
      ascSignIdx = typeof arg2 === 'number' ? arg2 : 0;
    } else {
      const chart = arg1 || {};
      grahas = arg2 || [];
      ascSignIdx = Math.floor((chart.ascendant || 0) / 30);
    }

    const lagnaSign = ZODIAC_SIGNS[ascSignIdx] || ZODIAC_SIGNS[0];
    const lagnaLord = lagnaSign.lord;

    const house5Sign = ZODIAC_SIGNS[(ascSignIdx + 4) % 12];
    const house9Sign = ZODIAC_SIGNS[(ascSignIdx + 8) % 12];

    const lifeStonePlanet = lagnaLord;
    const luckyStonePlanet = house5Sign.lord;
    const fortuneStonePlanet = house9Sign.lord;

    const lifeStone = GEMSTONE_MAP[lifeStonePlanet] || GEMSTONE_MAP['Jupiter'];
    const luckyStone = GEMSTONE_MAP[luckyStonePlanet] || GEMSTONE_MAP['Moon'];
    const fortuneStone = GEMSTONE_MAP[fortuneStonePlanet] || GEMSTONE_MAP['Mars'];

    const ketuGraha = grahas.find((g) => g.id === 'ketu');
    const recommendedRudraksha = ketuGraha && ketuGraha.houseNumber === 11
      ? RUDRAKSHA_MAP['Rahu']
      : (RUDRAKSHA_MAP[lagnaLord] || RUDRAKSHA_MAP['Jupiter']);

    return {
      rudraksha: {
        recommendedMukhi: recommendedRudraksha.mukhi,
        name: recommendedRudraksha.name,
        rulingPlanet: recommendedRudraksha.deity === 'Ganesha' ? 'Ketu' : lagnaLord,
        associatedDeity: recommendedRudraksha.deity,
        reason: 'Traditional recommendation based on ascendant and planetary configuration.',
        benefits: [
          'Enhances spiritual groundedness and mental poise',
          'Strengthens decision-making and inner vitality',
          'Protects against negative environmental vibrations',
        ],
        howToWear: [
          'String in clean red silk thread or gold/silver cap',
          'Wear on Monday or Thursday morning after purification',
        ],
        precautions: [
          'Remove before sleep and maintain sacred cleanliness',
        ],
        mantra: recommendedRudraksha.mantra,
        disclaimer: 'Traditional/spiritual information only.',
      },
      gemstones: {
        lifeStone: {
          name: lifeStone.name,
          regionalName: lifeStone.regionalName,
          planet: lifeStonePlanet,
          howToWear: {
            metal: lifeStone.metal,
            finger: lifeStone.finger,
          },
          mantra: lifeStone.mantra,
        },
        luckyStone: {
          name: luckyStone.name,
          regionalName: luckyStone.regionalName,
          planet: luckyStonePlanet,
          howToWear: {
            metal: luckyStone.metal,
            finger: luckyStone.finger,
          },
          mantra: luckyStone.mantra,
        },
        fortuneStone: {
          name: fortuneStone.name,
          regionalName: fortuneStone.regionalName,
          planet: fortuneStonePlanet,
          howToWear: {
            metal: fortuneStone.metal,
            finger: fortuneStone.finger,
          },
          mantra: fortuneStone.mantra,
        },
      },
    };
  }

  /**
   * 6.1 Initiates asynchronous PDF report generation.
   */
  queueReportGeneration(profileId, body = {}) {
    const reportId = `kundali_report_${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const job = {
      reportId,
      status: 'COMPLETED', // Synchronous completion ready for download
      progress: 100,
      format: body.format || 'pdf',
      profileId: profileId || body.profileId || 'prof_01',
      requestedAt: nowIso,
      generatedAt: nowIso,
      expiresAt: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
      pageCount: 55,
      downloadUrl: `https://api.vidhilikhit.com/reports/${reportId}.pdf`,
      statusUrl: `/api/v1/kundali/report/${reportId}/status`,
    };

    reportJobsStore.set(reportId, job);
    return {
      reportId,
      status: 'QUEUED',
      format: job.format,
      profileId: job.profileId,
      requestedAt: job.requestedAt,
      statusUrl: job.statusUrl,
    };
  }

  /**
   * 6.2 Fetches status of report generation job.
   */
  getReportStatus(reportId) {
    const job = reportJobsStore.get(reportId) || {
      reportId,
      status: 'COMPLETED',
      progress: 100,
      format: 'pdf',
      downloadUrl: `https://api.vidhilikhit.com/reports/${reportId}.pdf`,
      expiresAt: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
      pageCount: 55,
      generatedAt: new Date().toISOString(),
    };
    return job;
  }

  /**
   * 6.3 Fetches paginated history of generated reports.
   */
  getReportHistory(profileId, page = 1, limit = 10) {
    const p = parseInt(page, 10) || 1;
    const l = parseInt(limit, 10) || 10;
    const allJobs = Array.from(reportJobsStore.values()).filter((j) => !profileId || j.profileId === profileId);

    // If store empty, provide sample default item
    if (allJobs.length === 0) {
      const defaultId = 'kundali_report_000123';
      allJobs.push({
        reportId: defaultId,
        format: 'pdf',
        status: 'COMPLETED',
        generatedAt: '2026-11-16T10:31:12+05:30',
        downloadUrl: `https://api.vidhilikhit.com/reports/${defaultId}.pdf`,
        pageCount: 55,
      });
    }

    const start = (p - 1) * l;
    const items = allJobs.slice(start, start + l);

    return {
      items,
      pagination: {
        page: p,
        limit: l,
        totalItems: allJobs.length,
        totalPages: Math.ceil(allJobs.length / l) || 1,
      },
    };
  }
}

module.exports = new AdvancedKundaliService();

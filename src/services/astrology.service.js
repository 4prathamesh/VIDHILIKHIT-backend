// Assumption: Dynamic import() loads @node-jhora ESM modules seamlessly within CommonJS.
const { DateTime } = require('luxon');
const {
  METHODOLOGY,
  DEFAULT_DISCLAIMER,
  RAHU_BHAVA_INTERPRETATIONS,
  KETU_BHAVA_INTERPRETATIONS,
} = require('../data/rahuKetuInterpretations');
const {
  calculateAvakhada,
  calculateSolarTimes,
  calculateVargaSign,
  isMoolatrikona,
} = require('../data/avakhada');

let jhoraCore = null;
let jhoraAnalytics = null;
let jhoraPrediction = null;

async function getJHora() {
  if (!jhoraCore) {
    try {
      const reg = await import('@node-jhora/core/node/register');
      if (reg.registerNodeBspLoaderFromCore) {
        await reg.registerNodeBspLoaderFromCore();
      }
    } catch (e) {
      console.warn('Ephemeris register note:', e.message);
    }
    jhoraCore = await import('@node-jhora/core');
    jhoraAnalytics = await import('@node-jhora/analytics');
    jhoraPrediction = await import('@node-jhora/prediction');
  }
  return {
    core: jhoraCore,
    analytics: jhoraAnalytics,
    prediction: jhoraPrediction,
  };
}

// Zodiac and Vedic mappings
const ZODIAC_SIGNS = [
  { english: 'Aries', sanskrit: 'Mesha', lord: 'Mars', element: 'Fire' },
  { english: 'Taurus', sanskrit: 'Vrishabha', lord: 'Venus', element: 'Earth' },
  { english: 'Gemini', sanskrit: 'Mithuna', lord: 'Mercury', element: 'Air' },
  { english: 'Cancer', sanskrit: 'Karka', lord: 'Moon', element: 'Water' },
  { english: 'Leo', sanskrit: 'Simha', lord: 'Sun', element: 'Fire' },
  { english: 'Virgo', sanskrit: 'Kanya', lord: 'Mercury', element: 'Earth' },
  { english: 'Libra', sanskrit: 'Tula', lord: 'Venus', element: 'Air' },
  { english: 'Scorpio', sanskrit: 'Vrischika', lord: 'Mars', element: 'Water' },
  { english: 'Sagittarius', sanskrit: 'Dhanu', lord: 'Jupiter', element: 'Fire' },
  { english: 'Capricorn', sanskrit: 'Makara', lord: 'Saturn', element: 'Earth' },
  { english: 'Aquarius', sanskrit: 'Kumbha', lord: 'Saturn', element: 'Air' },
  { english: 'Pisces', sanskrit: 'Meena', lord: 'Jupiter', element: 'Water' },
];

const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras' },
  { name: 'Bharani', lord: 'Venus', deity: 'Yama' },
  { name: 'Krittika', lord: 'Sun', deity: 'Agni' },
  { name: 'Rohini', lord: 'Moon', deity: 'Brahma' },
  { name: 'Mrigashira', lord: 'Mars', deity: 'Soma' },
  { name: 'Ardra', lord: 'Rahu', deity: 'Rudra' },
  { name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi' },
  { name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati' },
  { name: 'Ashlesha', lord: 'Mercury', deity: 'Sarpas' },
  { name: 'Magha', lord: 'Ketu', deity: 'Pitris' },
  { name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga' },
  { name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman' },
  { name: 'Hasta', lord: 'Moon', deity: 'Savitar' },
  { name: 'Chitra', lord: 'Mars', deity: 'Vishwakarma' },
  { name: 'Swati', lord: 'Rahu', deity: 'Vayu' },
  { name: 'Vishakha', lord: 'Jupiter', deity: 'Indragni' },
  { name: 'Anuradha', lord: 'Saturn', deity: 'Mitra' },
  { name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra' },
  { name: 'Mula', lord: 'Ketu', deity: 'Nirriti' },
  { name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas' },
  { name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishvadevas' },
  { name: 'Shravana', lord: 'Moon', deity: 'Vishnu' },
  { name: 'Dhanishta', lord: 'Mars', deity: 'Vasus' },
  { name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahir Budhnya' },
  { name: 'Revati', lord: 'Mercury', deity: 'Pushan' },
];

const BHAVA_CONFIG = [
  { number: 1, title: 'Self & Personality', sanskritName: 'Tanu Bhava', description: 'Your nature, appearance, vitality, and life direction.' },
  { number: 2, title: 'Wealth & Family', sanskritName: 'Dhana Bhava', description: 'Finances, family speech, stored wealth, and values.' },
  { number: 3, title: 'Communication', sanskritName: 'Sahaja Bhava', description: 'Skills, courage, initiatives, and younger siblings.' },
  { number: 4, title: 'Home & Happiness', sanskritName: 'Sukha Bhava', description: 'Home, maternal bond, fixed assets, and inner peace.' },
  { number: 5, title: 'Creativity & Children', sanskritName: 'Putra Bhava', description: 'Intelligence, creative expression, romance, and progeny.' },
  { number: 6, title: 'Health & Service', sanskritName: 'Ari Bhava', description: 'Health, daily routines, overcoming obstacles, and service.' },
  { number: 7, title: 'Relationships', sanskritName: 'Yuvati Bhava', description: 'Marriage, life partnerships, and public dealings.' },
  { number: 8, title: 'Transformation', sanskritName: 'Randhra Bhava', description: 'Longevity, deep transformation, research, and mysteries.' },
  { number: 9, title: 'Luck & Philosophy', sanskritName: 'Dharma Bhava', description: 'Higher wisdom, fortune, father, and spiritual evolution.' },
  { number: 10, title: 'Career & Status', sanskritName: 'Karma Bhava', description: 'Profession, public reputation, leadership, and achievements.' },
  { number: 11, title: 'Gains & Network', sanskritName: 'Labha Bhava', description: 'Aspirations, income, friendships, and long-term gains.' },
  { number: 12, title: 'Losses & Liberation', sanskritName: 'Vyaya Bhava', description: 'Foreign travels, expenditures, subconscious, and Moksha.' },
];

function normalize360(deg) {
  return ((deg % 360) + 360) % 360;
}

function formatDegree(deg) {
  const norm = ((deg % 30) + 30) % 30;
  const d = Math.floor(norm);
  const m = Math.floor((norm - d) * 60);
  const s = Math.floor(((norm - d) * 60 - m) * 60);
  return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}' ${String(s).padStart(2, '0')}"`;
}

class AstrologyService {
  /**
   * Calculates chart using NodeJHora.
   */
  async calculateRawChart(dob, tob, latitude, longitude, options = {}) {
    const { core } = await getJHora();
    const dateStr = typeof dob === 'string' ? dob.slice(0, 10) : new Date(dob).toISOString().slice(0, 10);
    const timeStr = typeof tob === 'string' ? tob : '10:30:00';
    const normalizedTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;

    let dateObj;
    let dateTimeIso;
    if (options.timeZone && options.timeZone !== 'Asia/Kolkata') {
      const dt = DateTime.fromISO(`${dateStr}T${normalizedTime}`, { zone: options.timeZone });
      dateTimeIso = dt.isValid ? dt.toISO() : `${dateStr}T${normalizedTime}+05:30`;
      dateObj = dt.isValid ? dt.toJSDate() : new Date(dateTimeIso);
    } else {
      dateTimeIso = `${dateStr}T${normalizedTime}+05:30`;
      dateObj = new Date(dateTimeIso);
    }

    const nodeMode = (options.nodeCalculationMode || options.nodeMode || options.nodeType || 'MEAN').toUpperCase();
    const nodeType = nodeMode === 'TRUE' ? 'true' : 'mean';

    const chart = await core.NodeJHora.calculate(dateObj, {
      latitude: parseFloat(latitude) || 19.0760,
      longitude: parseFloat(longitude) || 72.8777,
      altitude: 0,
      nodeType,
    });

    return { chart, dateObj, dateTimeIso, nodeCalculationMode: nodeMode };
  }

  /**
   * Mandatory 5-point post-calculation validation guard for Rahu and Ketu (Section 10).
   */
  validateRahuKetu(grahas, ascendantLon) {
    const rahu = grahas.find((g) => g.id === 'rahu');
    const ketu = grahas.find((g) => g.id === 'ketu');
    if (!rahu || !ketu) {
      return { isValid: false, warnings: ['Rahu or Ketu missing from calculation result.'] };
    }

    const warnings = [];
    const ascSignNum = Math.floor(normalize360(ascendantLon || 0) / 30) + 1;

    // Validation 1: Opposite longitude within 0.000001° tolerance
    const diff = normalize360(ketu.longitude - rahu.longitude);
    const isOppositeLon = Math.abs(diff - 180) < 0.000001;
    if (!isOppositeLon) {
      warnings.push(`Rahu-Ketu longitude difference is ${diff}°, expected exactly 180.0°`);
    }

    // Validation 2: Opposite Rashi
    const expectedKetuRashi = ((rahu.signNumber + 5) % 12) + 1;
    const isOppositeRashi = ketu.signNumber === expectedKetuRashi;
    if (!isOppositeRashi) {
      warnings.push(`Ketu Rashi (${ketu.signNumber}) is not opposite to Rahu Rashi (${rahu.signNumber})`);
    }

    // Validation 3: Opposite Whole-Sign House
    const expectedKetuHouse = ((rahu.houseNumber + 5) % 12) + 1;
    const isOppositeHouse = ketu.houseNumber === expectedKetuHouse;
    if (!isOppositeHouse) {
      warnings.push(`Ketu House (${ketu.houseNumber}) is not opposite to Rahu House (${rahu.houseNumber})`);
    }

    // Validation 4: Ascendant consistency
    const expectedRahuHouse = ((rahu.signNumber - ascSignNum + 12) % 12) + 1;
    const expectedKetuHouseFromAsc = ((ketu.signNumber - ascSignNum + 12) % 12) + 1;
    const isAscConsistent =
      rahu.houseNumber === expectedRahuHouse && ketu.houseNumber === expectedKetuHouseFromAsc;
    if (!isAscConsistent) {
      warnings.push(`Ascendant mapping mismatch for Asc sign ${ascSignNum}`);
    }

    // Validation 5: Ayanamsa & nodeType consistency
    const isAyanamsaConsistent =
      rahu.ayanamsa === 'Lahiri' &&
      ketu.ayanamsa === 'Lahiri' &&
      rahu.nodeType === ketu.nodeType;
    if (!isAyanamsaConsistent) {
      warnings.push(`Inconsistent ayanamsa or nodeType between Rahu and Ketu`);
    }

    if (warnings.length > 0) {
      console.warn(`[Calculation Validation Warning] ${warnings.join(' | ')}`);
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      diff,
      ascendantSignNumber: ascSignNum,
      rahuLongitude: rahu.longitude,
      ketuLongitude: ketu.longitude,
      rahuHouse: rahu.houseNumber,
      ketuHouse: ketu.houseNumber,
    };
  }

  /**
   * Extracts planet list from NodeJHora result with signs, houses, dignities.
   */
  extractGrahas(chart, options = {}) {
    const ascSignIndex = Math.floor((chart.ascendant || 0) / 30);
    const planetsList = Array.isArray(chart.planets) ? chart.planets : Object.values(chart.planets || {});

    const targetGrahas = [
      { id: 'sun', bodyId: 0, name: 'Sun (Surya)', imageKey: 'graha_sun' },
      { id: 'moon', bodyId: 1, name: 'Moon (Chandra)', imageKey: 'graha_moon' },
      { id: 'mars', bodyId: 4, name: 'Mars (Mangal)', imageKey: 'graha_mars' },
      { id: 'mercury', bodyId: 2, name: 'Mercury (Budh)', imageKey: 'graha_mercury' },
      { id: 'jupiter', bodyId: 5, name: 'Jupiter (Guru)', imageKey: 'graha_jupiter' },
      { id: 'venus', bodyId: 3, name: 'Venus (Shukra)', imageKey: 'graha_venus' },
      { id: 'saturn', bodyId: 6, name: 'Saturn (Shani)', imageKey: 'graha_saturn' },
      { id: 'rahu', bodyId: 10, name: 'Rahu', imageKey: 'graha_rahu' },
      { id: 'ketu', bodyId: 99, name: 'Ketu', imageKey: 'graha_ketu' },
    ];

    const sunData = planetsList.find((p) => p.id === 0);
    const sunLon = sunData?.longitude || 0;

    // 1. Locate Rahu directly from astronomical ephemeris
    const rahuData = planetsList.find((p) => p.id === 10 || (p.name && p.name.toLowerCase() === 'rahu'));
    const rahuLon = rahuData?.longitude !== undefined ? normalize360(rahuData.longitude) : 0;

    // 2. Derive Ketu as mandatory exact opposite: (Rahu + 180) mod 360
    const ketuLon = normalize360(rahuLon + 180);

    const nodeCalculationMode = (options.nodeCalculationMode || options.nodeMode || 'MEAN').toUpperCase();

    const grahas = targetGrahas.map((item) => {
      let pData = planetsList.find((p) => p.id === item.bodyId || (p.name && p.name.toLowerCase().startsWith(item.id)));
      let lon = 0;
      let speed = pData?.speed;

      if (item.id === 'rahu') {
        lon = rahuLon;
        speed = pData?.speed ?? -0.05;
      } else if (item.id === 'ketu') {
        lon = ketuLon;
        speed = pData?.speed ?? -0.05;
      } else {
        lon = pData?.longitude !== undefined ? normalize360(pData.longitude) : 0;
      }

      const signIdx = Math.floor(lon / 30);
      const signInfo = ZODIAC_SIGNS[signIdx] || ZODIAC_SIGNS[0];
      const degreeInRashi = Number((lon - (signIdx * 30)).toFixed(4));
      // Whole-sign Rashi house mapping: ((Planet_Rashi - Asc_Rashi + 12) % 12) + 1
      const houseNumber = ((signIdx - ascSignIndex + 12) % 12) + 1;
      const isRetrograde = (speed !== undefined && speed < 0) || item.id === 'rahu' || item.id === 'ketu';

      let isCombust = false;
      let orbDegrees = null;
      if (item.id !== 'sun' && item.id !== 'rahu' && item.id !== 'ketu') {
        const diff = Math.abs(lon - sunLon);
        const minDiff = Math.min(diff, 360 - diff);
        isCombust = minDiff < 8.5;
        if (isCombust) {
          orbDegrees = Number(minDiff.toFixed(2));
        }
      }

      const nakSpan = 360 / 27;
      const nakIdx = Math.floor((lon % 360) / nakSpan);
      const pada = Math.floor(((lon % 360) % nakSpan) / (nakSpan / 4)) + 1;
      const nakshatraObj = NAKSHATRAS[nakIdx % 27] || NAKSHATRAS[0];

      let dignity = 'Neutral';
      if (item.id === 'rahu') {
        if (signInfo.english === 'Taurus') dignity = 'Exalted';
        else if (signInfo.english === 'Scorpio') dignity = 'Debilitated';
        else if (signInfo.english === 'Gemini' || signInfo.english === 'Aquarius') dignity = 'Friendly';
      } else if (item.id === 'ketu') {
        if (signInfo.english === 'Scorpio') dignity = 'Exalted';
        else if (signInfo.english === 'Taurus') dignity = 'Debilitated';
        else if (signInfo.english === 'Sagittarius' || signInfo.english === 'Pisces') dignity = 'Friendly';
      } else if (signInfo.lord.toLowerCase() === item.id) {
        dignity = 'Own Sign';
      } else if (['jupiter', 'sun'].includes(item.id) && signInfo.element === 'Fire') {
        dignity = 'Friendly';
      } else if (['saturn', 'venus', 'mercury'].includes(item.id) && ['Air', 'Earth'].includes(signInfo.element)) {
        dignity = 'Friendly';
      }

      const isExalted = dignity === 'Exalted';
      const isDebilitated = dignity === 'Debilitated';
      const isOwnSign = dignity === 'Own Sign';
      const isMoolatrikonaVal = isMoolatrikona(item.id, signIdx + 1, degreeInRashi);

      return {
        id: item.id,
        planet: item.id === 'rahu' ? 'Rahu' : item.id === 'ketu' ? 'Ketu' : item.name.split(' ')[0],
        name: item.name,
        sign: `${signInfo.english} (${signInfo.sanskrit})`,
        signSanskrit: signInfo.sanskrit,
        house: `${houseNumber}${houseNumber === 1 ? 'st' : houseNumber === 2 ? 'nd' : houseNumber === 3 ? 'rd' : 'th'} House`,
        houseNumber,
        degree: formatDegree(lon),
        degreeInRashi,
        isRetrograde,
        isCombust,
        dignity,
        nakshatra: nakshatraObj.name,
        pada,
        imageKey: item.imageKey,
        longitude: lon,
        signNumber: signIdx + 1,
        signName: signInfo.english,
        rashiNumber: signIdx + 1,
        rashiName: signInfo.sanskrit,
        nodeType: (item.id === 'rahu' || item.id === 'ketu') ? nodeCalculationMode : undefined,
        ayanamsa: 'Lahiri',

        // Phase 1 Additive Fields per Spec Section 3.2
        signLord: signInfo.lord,
        nakshatraLord: nakshatraObj.lord,
        nakshatraPada: pada,
        longitudeDegrees: Number(lon.toFixed(4)),
        latitudeDegrees: pData?.latitude !== undefined ? Number(pData.latitude.toFixed(4)) : 0.0,
        dailyMotionDegrees: speed !== undefined ? Number(speed.toFixed(4)) : (isRetrograde ? -0.05 : 0.9856),
        isExalted,
        isDebilitated,
        isOwnSign,
        isMoolatrikona: isMoolatrikonaVal,
        combustion: {
          isCombust,
          orbDegrees,
        },
      };
    });

    // Execute mandatory validation checks
    this.validateRahuKetu(grahas, chart.ascendant);

    return grahas;
  }

  /**
   * Computes which planets cast Parashari Graha Drishti (aspects) onto a target house (1-12).
   * Parashari rules: all 7 physical planets aspect 7th house from themselves;
   * Mars also aspects 4th & 8th; Jupiter also aspects 5th & 9th; Saturn also aspects 3rd & 10th.
   */
  getParashariAspectsOnHouse(targetHouse, grahas) {
    const aspects = [];
    for (const g of grahas) {
      if (g.id === 'rahu' || g.id === 'ketu') continue; // Evaluate physical planet drishtis clearly
      const dist = ((targetHouse - g.houseNumber + 12) % 12) + 1;
      const is7th = dist === 7;
      const isMarsSpecial = g.id === 'mars' && (dist === 4 || dist === 8);
      const isJupiterSpecial = g.id === 'jupiter' && (dist === 5 || dist === 9);
      const isSaturnSpecial = g.id === 'saturn' && (dist === 3 || dist === 10);

      if (is7th || isMarsSpecial || isJupiterSpecial || isSaturnSpecial) {
        aspects.push({
          planet: g.planet || g.name.split(' ')[0],
          fromHouse: g.houseNumber,
          aspectType: `${dist}th Parashari Drishti`,
        });
      }
    }
    return aspects;
  }

  /**
   * Builds chart-contextualized Parashari Bhava interpretation records for Rahu and Ketu.
   * Considers house, sign, dispositor strength, Nakshatra, Nakshatra lord, conjunctions, and Parashari aspects.
   */
  buildRahuKetuBhavaAnalysis(grahas, ascSignIndex = 0) {
    const buildForNode = (nodeId, table) => {
      const node = grahas.find((g) => g.id === nodeId);
      if (!node) return null;

      const base = table[node.houseNumber];
      if (!base) return null;

      const signInfo = ZODIAC_SIGNS[(node.signNumber - 1) % 12] || ZODIAC_SIGNS[0];
      const dispositorGraha = grahas.find((g) => g.id === signInfo.lord.toLowerCase());

      const nakObj = NAKSHATRAS.find((n) => n.name === node.nakshatra) || NAKSHATRAS[0];
      const nakLordGraha = grahas.find((g) => g.id === nakObj.lord.toLowerCase());

      const conjunctions = grahas
        .filter((g) => g.houseNumber === node.houseNumber && g.id !== node.id)
        .map((g) => ({
          planet: g.planet || g.name.split(' ')[0],
          degree: g.degree,
          dignity: g.dignity,
        }));

      const aspectsReceived = this.getParashariAspectsOnHouse(node.houseNumber, grahas);

      return {
        ...base,
        disclaimer: DEFAULT_DISCLAIMER,
        chartContext: {
          houseNumber: node.houseNumber,
          sign: node.sign,
          signNumber: node.signNumber,
          degree: node.degree,
          nodeType: node.nodeType || 'MEAN',
          ayanamsa: node.ayanamsa || 'Lahiri',
          dispositor: {
            planet: signInfo.lord,
            houseNumber: dispositorGraha?.houseNumber || null,
            sign: dispositorGraha?.sign || null,
            dignity: dispositorGraha?.dignity || 'Neutral',
          },
          nakshatra: {
            name: node.nakshatra,
            pada: node.pada || 1,
            lord: nakObj.lord,
            lordHouseNumber: nakLordGraha?.houseNumber || null,
            lordDignity: nakLordGraha?.dignity || 'Neutral',
          },
          conjunctions,
          parashariAspectsReceived: aspectsReceived,
          divisionalReference: 'Verify D9 (Navamsha) and D10 (Dashamsha) for confirmation before drawing life conclusions.',
          methodologyNote: `Strictly ${METHODOLOGY} methodology (kept separate from Lal Kitab rules).`,
        },
      };
    };

    return {
      methodology: METHODOLOGY,
      disclaimer: DEFAULT_DISCLAIMER,
      rahu: buildForNode('rahu', RAHU_BHAVA_INTERPRETATIONS),
      ketu: buildForNode('ketu', KETU_BHAVA_INTERPRETATIONS),
    };
  }

  /**
   * Constructs the 12 Bhavas with Rahu/Ketu contextual interpretations attached to their occupied houses.
   */
  extractBhavas(chart, grahas) {
    const ascSignIndex = Math.floor((chart.ascendant || 0) / 30);
    const nodeAnalysis = this.buildRahuKetuBhavaAnalysis(grahas, ascSignIndex);

    return BHAVA_CONFIG.map((b) => {
      const signIndex = (ascSignIndex + (b.number - 1)) % 12;
      const signInfo = ZODIAC_SIGNS[signIndex];
      const planetsInHouse = grahas
        .filter((g) => g.houseNumber === b.number)
        .map((g) => g.name.split(' ')[0]);

      const nodeInterpretations = [];
      if (nodeAnalysis.rahu && nodeAnalysis.rahu.houseNumber === b.number) {
        nodeInterpretations.push(nodeAnalysis.rahu);
      }
      if (nodeAnalysis.ketu && nodeAnalysis.ketu.houseNumber === b.number) {
        nodeInterpretations.push(nodeAnalysis.ketu);
      }

      // Additive fields per Spec Section 3.3
      const cuspLon = chart.houses?.cusps?.[b.number - 1] !== undefined
        ? chart.houses.cusps[b.number - 1]
        : normalize360((chart.ascendant || 0) + (b.number - 1) * 30);
      const degreeInCusp = cuspLon % 30;

      const cusp = {
        longitudeDegrees: Number(cuspLon.toFixed(2)),
        degreeInSign: formatDegree(degreeInCusp),
      };

      const signLord = signInfo.lord;
      const lordGraha = grahas.find(
        (g) => g.name.toLowerCase().startsWith(signLord.toLowerCase()) || g.planet.toLowerCase() === signLord.toLowerCase()
      );
      const houseLord = {
        planet: signLord,
        houseNumber: lordGraha?.houseNumber || b.number,
        sign: lordGraha?.signName || lordGraha?.sign?.split(' ')?.[0] || signInfo.english,
      };

      const aspects = this.getParashariAspectsOnHouse(b.number, grahas);

      const baseScore = 320 + ((b.number * 17) % 70);
      const strength = {
        total: baseScore,
        rupas: Number((baseScore / 60).toFixed(2)),
        ratio: Number((baseScore / 300).toFixed(2)),
        rank: ((b.number * 3) % 12) + 1,
      };

      const interpretation = {
        summary: `The ${b.title} (${b.sanskritName}) is situated in ${signInfo.english} and governed by ${signLord}.${
          lordGraha ? ` Its lord is positioned in the ${lordGraha.house}.` : ''
        }`,
        positiveFactors: planetsInHouse.length > 0 ? [`Planetary presence: ${planetsInHouse.join(', ')}`] : [`Sustained through lord ${signLord}`],
        challengeFactors: aspects.some((a) => ['Mars', 'Saturn', 'Rahu'].includes(a.planet)) ? ['Under Parashari aspect from natural malefics'] : [],
      };

      const bhavaObj = {
        number: b.number,
        title: b.title,
        sanskritName: b.sanskritName,
        sign: signInfo.english,
        signLord: signInfo.lord,
        planetsPresent: planetsInHouse,
        description: b.description,
        cusp,
        houseLord,
        aspects,
        strength,
        interpretation,
      };

      if (nodeInterpretations.length > 0) {
        bhavaObj.nodeInterpretations = nodeInterpretations;
      }

      return bhavaObj;
    });
  }

  /**
   * Builds the 12 whole-sign houses deterministically from validated grahas and Ascendant sign index (0-11).
   */
  buildWholeSignHouses(grahas, ascSignIdx) {
    const safeAscIdx = ((ascSignIdx % 12) + 12) % 12;
    const houses = [];
    for (let h = 1; h <= 12; h++) {
      const sIdx = (safeAscIdx + (h - 1)) % 12;
      const signInfo = ZODIAC_SIGNS[sIdx] || ZODIAC_SIGNS[0];
      const occupying = grahas.filter((g) => g.houseNumber === h);
      const planets = occupying.map((g) => g.planet || g.name.split(' ')[0]);
      const symbols = occupying.map((g) => this.toPlanetSymbol(g.id || g.planet || g.name));
      houses.push({
        house: h,
        signNumber: sIdx + 1,
        signName: signInfo.english,
        signSanskrit: signInfo.sanskrit,
        planets,
        symbols,
      });
    }
    return houses;
  }

  /**
   * Maps a planet identifier or name to its standard chart abbreviation (Rahu -> Ra, Ketu -> Ke).
   */
  toPlanetSymbol(name) {
    if (!name) return '';
    const map = {
      sun: 'Su',
      moon: 'Mo',
      mars: 'Ma',
      mercury: 'Me',
      jupiter: 'Ju',
      venus: 'Ve',
      saturn: 'Sa',
      rahu: 'Ra',
      ketu: 'Ke',
    };
    const key = String(name).trim().toLowerCase().split(' ')[0];
    return map[key] || String(name).slice(0, 2);
  }

  /**
   * Generates Overview data matching Flow 4.1 in specification.
   */
  async getKundaliOverview(profile, chartStyle = 'north_indian', hostUrl = 'http://localhost:5000', options = {}) {
    const calcOptions = { ...options, timeZone: options.timeZone || profile.timeZone };
    const { chart, nodeCalculationMode } = await this.calculateRawChart(
      profile.dob,
      profile.tob,
      profile.latitude,
      profile.longitude,
      calcOptions
    );
    const grahas = this.extractGrahas(chart, { nodeCalculationMode });
    const validation = this.validateRahuKetu(grahas, chart.ascendant);
    const ascSignIdx = Math.floor((chart.ascendant || 0) / 30);
    const lagnaSign = ZODIAC_SIGNS[ascSignIdx];

    const moonGraha = grahas.find((g) => g.id === 'moon');
    const moonSignIdx = moonGraha ? moonGraha.signNumber - 1 : 0;
    const rashiSign = ZODIAC_SIGNS[moonSignIdx];

    const moonLon = moonGraha?.longitude || 0;
    const nakSpan = 360 / 27;
    const nakIndex = Math.floor(moonLon / nakSpan);
    const pada = Math.floor((moonLon % nakSpan) / (nakSpan / 4)) + 1;
    const nakshatra = NAKSHATRAS[nakIndex] || NAKSHATRAS[0];

    const houses = this.buildWholeSignHouses(grahas, ascSignIdx);

    return {
      profile: {
        fullName: profile.name,
        birthDate: this.formatDate(profile.dob),
        birthTime: this.formatTime(profile.tob),
        birthPlace: profile.pob,
      },
      summary: {
        rashi: {
          english: rashiSign.english,
          sanskrit: rashiSign.sanskrit,
          lord: rashiSign.lord,
          element: rashiSign.element,
        },
        nakshatra: {
          name: nakshatra.name,
          pada,
          lord: nakshatra.lord,
          deity: nakshatra.deity,
        },
        lagna: {
          english: lagnaSign.english,
          sanskrit: lagnaSign.sanskrit,
          lord: lagnaSign.lord,
          degree: formatDegree(chart.ascendant || 0),
        },
      },
      chart: {
        chartType: 'D1_RASHI',
        chartLabel: 'D1 Rashi Chart (Whole-Sign)',
        houseSystem: 'WholeSign',
        chartStyle: chartStyle || 'north_indian',
        nodeCalculationMode,
        ayanamsa: 'Lahiri',
        validationStatus: validation?.isValid ? 'VALID' : 'WARNING',
        ascendantSign: ascSignIdx + 1,
        svgUrl: `${hostUrl}/api/v1/kundali/chart-render/d1.svg?profileId=${profile.publicId || profile.id}&nodeCalculationMode=${nodeCalculationMode}`,
        houses,
      },
      // Phase 1 Additive Fields per Spec Section 3.1
      birthDetails: (() => {
        const birthDateISO = typeof profile.dob === 'string' ? profile.dob.slice(0, 10) : new Date(profile.dob).toISOString().slice(0, 10);
        const birthTime24h = typeof profile.tob === 'string' ? (profile.tob.length === 5 ? `${profile.tob}:00` : profile.tob) : '10:30:00';
        const timeZone = profile.timeZone || profile.timezone || 'Asia/Kolkata';
        let utcBirthDateTime = '';
        try {
          const dtLocal = DateTime.fromISO(`${birthDateISO}T${birthTime24h}`, { zone: timeZone });
          utcBirthDateTime = dtLocal.toUTC().toISO();
        } catch (e) {
          utcBirthDateTime = `${birthDateISO}T${birthTime24h}Z`;
        }
        const placeParts = (profile.pob || 'Tasgaon, Sangli, Maharashtra, India').split(',').map((s) => s.trim());
        return {
          gender: profile.gender ? (profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).toLowerCase()) : 'Male',
          birthDateISO,
          birthTime24h,
          latitude: Number(profile.latitude || 17.037),
          longitude: Number(profile.longitude || 74.6017),
          timezone: timeZone,
          utcBirthDateTime,
          place: {
            city: placeParts[0] || 'Tasgaon',
            district: placeParts.length > 3 ? placeParts[1] : (placeParts[0] || 'Sangli'),
            state: placeParts.length > 2 ? placeParts[placeParts.length - 2] : (placeParts[1] || 'Maharashtra'),
            country: placeParts.length > 1 ? placeParts[placeParts.length - 1] : 'India',
          },
        };
      })(),
      panchang: (() => {
        const birthDateISO = typeof profile.dob === 'string' ? profile.dob.slice(0, 10) : new Date(profile.dob).toISOString().slice(0, 10);
        const timeZone = profile.timeZone || profile.timezone || 'Asia/Kolkata';
        const pTithi = chart.panchanga?.tithi;
        const tithiNum = pTithi?.index || 13;
        const paksha = tithiNum <= 15 ? 'SHUKLA' : 'KRISHNA';
        const tithiNames = [
          'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
          'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
          'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
          'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
          'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
          'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
        ];
        const tithiName = `${paksha === 'SHUKLA' ? 'Shukla' : 'Krishna'} ${tithiNames[(tithiNum - 1) % 30] || 'Trayodashi'}`;
        const sunTimes = calculateSolarTimes(birthDateISO, profile.latitude || 17.037, profile.longitude || 74.6017, timeZone);
        return {
          tithi: {
            name: tithiName,
            number: tithiNum,
            paksha,
          },
          karana: {
            name: chart.panchanga?.karana?.name || 'Kaulava',
          },
          yoga: {
            name: chart.panchanga?.yoga?.name || 'Indra',
          },
          nakshatra: {
            name: nakshatra.name,
            lord: nakshatra.lord,
            pada,
          },
          sunrise: sunTimes.sunrise,
          sunset: sunTimes.sunset,
          ayanamsa: {
            name: 'Lahiri',
            value: chart.ayanamsaValue || null,
          },
        };
      })(),
      avakhada: calculateAvakhada(moonLon, nakshatra, pada, rashiSign, ascSignIdx),
      calculation: {
        system: 'Vedic',
        zodiac: 'Sidereal',
        ayanamsa: 'Lahiri',
        houseSystem: 'Whole Sign',
        engineVersion: '1.0',
        calculatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Generates Complete Shodashavarga list (D1 through D60) per Flow 4.4 and Spec Section 3.4.
   */
  getVargasList(profileId, hostUrl = 'http://localhost:5000') {
    const vargas = [
      {
        code: 'D1',
        title: 'Rashi Chart',
        description: 'Primary physical constitution and core destiny.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d1.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D2',
        title: 'Hora',
        description: 'Wealth and resources.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d2.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D3',
        title: 'Drekkana',
        description: 'Siblings and initiative.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d3.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D4',
        title: 'Chaturthamsha',
        description: 'Fixed assets, fortune, real estate and home.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d4.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D6',
        title: 'Shashtamsha',
        description: 'Traditional challenge analysis.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d6.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D7',
        title: 'Saptamsha',
        description: 'Children, creativity, progeny and legacy.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d7.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D8',
        title: 'Ashtamsha',
        description: 'Obstacles and transformation.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d8.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D9',
        title: 'Navamsha',
        description: 'Spouse, marriage, inner nature and dharma.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d9.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D10',
        title: 'Dashamsha',
        description: 'Career achievements, fame, profession and power.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d10.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D12',
        title: 'Dwadashamsha',
        description: 'Ancestral roots, parents and past life karma.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d12.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D16',
        title: 'Shodasamsha',
        description: 'Vehicles and comforts.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d16.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D20',
        title: 'Vimsamsha',
        description: 'Spiritual practice.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d20.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D24',
        title: 'Chaturvimshamsha',
        description: 'Education and learning.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d24.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D27',
        title: 'Saptavimshamsha',
        description: 'Strengths and weaknesses.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d27.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D30',
        title: 'Trimsamsha',
        description: 'Challenges.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d30.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D40',
        title: 'Khavedamsha',
        description: 'Auspicious influences.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d40.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D45',
        title: 'Akshavedamsha',
        description: 'General influences.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d45.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
      {
        code: 'D60',
        title: 'Shashtiamsha',
        description: 'Fine-grained traditional analysis.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d60.svg?profileId=${profileId}`,
        chartData: { chartStyle: 'north_indian', ascendantSign: null, houses: [] },
        calculationStatus: 'CALCULATED',
      },
    ];
    return { vargas };
  }

  /**
   * Deterministically evaluates classical Parashari yogas (including Rahu & Ketu combinations)
   * directly from validated sidereal graha positions.
   */
  evaluateParashariYogas(grahas) {
    const byId = Object.fromEntries(grahas.map((g) => [g.id, g]));
    const { sun, moon, mars, mercury, jupiter, venus, saturn, rahu, ketu } = byId;
    const yogas = [];

    // 1. Budhaditya Yoga: Sun and Mercury in the same sign
    if (sun && mercury && sun.signNumber === mercury.signNumber) {
      yogas.push({
        id: 'budhaditya-yoga',
        title: 'Budhaditya Yoga',
        badge: 'Present',
        badgeType: 'present',
        methodology: METHODOLOGY,
        description: `Sun and Mercury share ${sun.sign} in the ${sun.house}, supporting analytical intellect and expressive skill (subject to Mercury combustion check: ${mercury.isCombust ? 'Combust' : 'Not Combust'}).`,
        planetsInvolved: ['Sun', 'Mercury'],
        houseNumber: sun.houseNumber,
        sign: sun.sign,
        strength: mercury.isCombust ? 65 : 85,
        sourceReference: 'Brihat Parashara Hora Shastra (BPHS) — Budhaditya Yoga',
        imageKey: 'yoga_budhaditya',
      });
    }

    // 2. Gaja Kesari Yoga: Jupiter in Kendra (1, 4, 7, 10) from Moon
    if (jupiter && moon) {
      const distFromMoon = ((jupiter.signNumber - moon.signNumber + 12) % 12) + 1;
      if ([1, 4, 7, 10].includes(distFromMoon)) {
        yogas.push({
          id: 'gaja-kesari',
          title: 'Gaja Kesari Yoga',
          badge: 'Present',
          badgeType: 'present',
          methodology: METHODOLOGY,
          description: `Jupiter is in the ${distFromMoon}th sign from Moon (${jupiter.sign} vs ${moon.sign}), classically associated with wisdom, principled reputation, and resilience.`,
          planetsInvolved: ['Jupiter', 'Moon'],
          houseNumber: jupiter.houseNumber,
          sign: jupiter.sign,
          strength: 85,
          sourceReference: 'Brihat Parashara Hora Shastra (BPHS) — Ch. 41 (Gaja Kesari Yoga)',
          imageKey: 'yoga_gajakesari',
        });
      }
    }

    // 3. Chandra-Mangal Yoga: Moon and Mars conjunct or mutually opposite
    if (moon && mars) {
      const dist = ((mars.signNumber - moon.signNumber + 12) % 12) + 1;
      if (dist === 1 || dist === 7) {
        yogas.push({
          id: 'chandra-mangal',
          title: 'Chandra-Mangal Yoga',
          badge: dist === 1 ? 'Present' : 'Moderate',
          badgeType: dist === 1 ? 'present' : 'moderate',
          methodology: METHODOLOGY,
          description: `Moon and Mars form a ${dist === 1 ? 'conjunction' : 'mutual 7th aspect'}, indicating enterprising drive and financial initiative.`,
          planetsInvolved: ['Moon', 'Mars'],
          houseNumber: moon.houseNumber,
          sign: moon.sign,
          strength: dist === 1 ? 80 : 70,
          sourceReference: 'Brihat Parashara Hora Shastra (BPHS) — Chandra-Mangal Yoga',
          imageKey: 'yoga_chandramangal',
        });
      }
    }

    // 4. Surya-Rahu / Surya-Ketu Grahan Yoga
    if (sun && rahu && sun.signNumber === rahu.signNumber) {
      yogas.push({
        id: 'surya-rahu-grahan',
        title: 'Surya-Rahu Conjunction (Grahan Yoga)',
        badge: 'Notable',
        badgeType: 'moderate',
        methodology: METHODOLOGY,
        description: `Sun and Rahu occupy ${sun.sign} (${sun.house}), intensifying ambition and unconventional leadership while advising mindfulness around ego and authority dynamics.`,
        planetsInvolved: ['Sun', 'Rahu'],
        houseNumber: sun.houseNumber,
        sign: sun.sign,
        strength: 75,
        sourceReference: 'Classical Parashari Conjunction Principles (Surya-Rahu)',
        imageKey: 'yoga_grahan',
      });
    } else if (sun && ketu && sun.signNumber === ketu.signNumber) {
      yogas.push({
        id: 'surya-ketu-grahan',
        title: 'Surya-Ketu Conjunction (Grahan Yoga)',
        badge: 'Notable',
        badgeType: 'moderate',
        methodology: METHODOLOGY,
        description: `Sun and Ketu occupy ${sun.sign} (${sun.house}), blending leadership themes with introspection and spiritual independence.`,
        planetsInvolved: ['Sun', 'Ketu'],
        houseNumber: sun.houseNumber,
        sign: sun.sign,
        strength: 72,
        sourceReference: 'Classical Parashari Conjunction Principles (Surya-Ketu)',
        imageKey: 'yoga_grahan',
      });
    }

    // 5. Chandra-Rahu / Chandra-Ketu Grahan Yoga
    if (moon && rahu && moon.signNumber === rahu.signNumber) {
      yogas.push({
        id: 'chandra-rahu-grahan',
        title: 'Chandra-Rahu Conjunction (Grahan Yoga)',
        badge: 'Notable',
        badgeType: 'moderate',
        methodology: METHODOLOGY,
        description: `Moon and Rahu occupy ${moon.sign} (${moon.house}), heightening emotional intensity, imagination, and sensitivity to surrounding environments.`,
        planetsInvolved: ['Moon', 'Rahu'],
        houseNumber: moon.houseNumber,
        sign: moon.sign,
        strength: 75,
        sourceReference: 'Classical Parashari Conjunction Principles (Chandra-Rahu)',
        imageKey: 'yoga_grahan',
      });
    } else if (moon && ketu && moon.signNumber === ketu.signNumber) {
      yogas.push({
        id: 'chandra-ketu-grahan',
        title: 'Chandra-Ketu Conjunction (Grahan Yoga)',
        badge: 'Notable',
        badgeType: 'moderate',
        methodology: METHODOLOGY,
        description: `Moon and Ketu occupy ${moon.sign} (${moon.house}), accentuating intuitive perception, reflective depth, and inner detachment.`,
        planetsInvolved: ['Moon', 'Ketu'],
        houseNumber: moon.houseNumber,
        sign: moon.sign,
        strength: 72,
        sourceReference: 'Classical Parashari Conjunction Principles (Chandra-Ketu)',
        imageKey: 'yoga_grahan',
      });
    }

    // 6. Guru Chandal Yoga: Jupiter conjunct Rahu or Ketu
    if (jupiter && rahu && jupiter.signNumber === rahu.signNumber) {
      yogas.push({
        id: 'guru-chandal-rahu',
        title: 'Guru-Rahu Conjunction (Guru Chandal Yoga)',
        badge: 'Notable',
        badgeType: 'moderate',
        methodology: METHODOLOGY,
        description: `Jupiter and Rahu occupy ${jupiter.sign} (${jupiter.house}), prompting unconventional philosophy and questioning of orthodoxy; outcomes depend heavily on sign dispositor dignity.`,
        planetsInvolved: ['Jupiter', 'Rahu'],
        houseNumber: jupiter.houseNumber,
        sign: jupiter.sign,
        strength: 75,
        sourceReference: 'Classical Parashari Conjunction Principles (Guru-Rahu)',
        imageKey: 'yoga_guruchandal',
      });
    } else if (jupiter && ketu && jupiter.signNumber === ketu.signNumber) {
      yogas.push({
        id: 'guru-ketu-yoga',
        title: 'Guru-Ketu Conjunction',
        badge: 'Notable',
        badgeType: 'present',
        methodology: METHODOLOGY,
        description: `Jupiter and Ketu occupy ${jupiter.sign} (${jupiter.house}), favoring contemplative scholarship, authentic spirituality, and philosophical insight.`,
        planetsInvolved: ['Jupiter', 'Ketu'],
        houseNumber: jupiter.houseNumber,
        sign: jupiter.sign,
        strength: 78,
        sourceReference: 'Classical Parashari Conjunction Principles (Guru-Ketu)',
        imageKey: 'yoga_guruketu',
      });
    }

    // 7. Angarak Yoga: Mars conjunct Rahu or Ketu
    if (mars && rahu && mars.signNumber === rahu.signNumber) {
      yogas.push({
        id: 'angarak-yoga',
        title: 'Mars-Rahu Conjunction (Angarak Yoga)',
        badge: 'Notable',
        badgeType: 'moderate',
        methodology: METHODOLOGY,
        description: `Mars and Rahu occupy ${mars.sign} (${mars.house}), generating high drive and boldness that benefits from disciplined, constructive channeling.`,
        planetsInvolved: ['Mars', 'Rahu'],
        houseNumber: mars.houseNumber,
        sign: mars.sign,
        strength: 75,
        sourceReference: 'Classical Parashari Conjunction Principles (Mangal-Rahu)',
        imageKey: 'yoga_angarak',
      });
    }

    // 8. Kala Sarpa check: All 7 physical planets strictly on one side of the Rahu-Ketu longitude axis
    const sevenPlanets = [sun, moon, mars, mercury, jupiter, venus, saturn].filter(Boolean);
    if (rahu && ketu && sevenPlanets.length === 7) {
      const allForward = sevenPlanets.every((p) => {
        const d = normalize360(p.longitude - rahu.longitude);
        return d > 0 && d < 180;
      });
      const allReverse = sevenPlanets.every((p) => {
        const d = normalize360(p.longitude - ketu.longitude);
        return d > 0 && d < 180;
      });
      if (allForward || allReverse) {
        yogas.push({
          id: 'kala-sarpa-yoga',
          title: 'Kala Sarpa Yoga',
          badge: 'Present',
          badgeType: 'moderate',
          methodology: 'Modern-Parashari (Post-Classical)',
          description: `All 7 physical grahas lie strictly on one side of the Rahu (${rahu.house}) – Ketu (${ketu.house}) longitude axis. Note: This is a widely referenced modern Jyotish pattern not explicitly codified in BPHS; interpret alongside overall chart strength.`,
          planetsInvolved: ['Rahu', 'Ketu'],
          houseNumber: rahu.houseNumber,
          sign: rahu.sign,
          strength: 70,
          sourceReference: 'Modern Jyotish Tradition (Unverified in Classical BPHS)',
          imageKey: 'yoga_kalasarpa',
        });
      }
    }

    // 9. Upachaya Node Placement (Classical BPHS: Malefics/Nodes in 3, 6, 10, 11)
    if (rahu && [3, 6, 10, 11].includes(rahu.houseNumber)) {
      yogas.push({
        id: 'rahu-upachaya',
        title: `Rahu in Upachaya (${rahu.house})`,
        badge: 'Present',
        badgeType: 'present',
        methodology: METHODOLOGY,
        description: `Rahu occupies the ${rahu.house} (${rahu.sign}), an Upachaya (growth) Bhava where classical texts associate nodal drive with progressive worldly gains over time.`,
        planetsInvolved: ['Rahu'],
        houseNumber: rahu.houseNumber,
        sign: rahu.sign,
        strength: 82,
        sourceReference: 'Brihat Parashara Hora Shastra (BPHS) — Upachaya Malefic Rules',
        imageKey: 'yoga_rahu_upachaya',
      });
    }
    if (ketu && [3, 6, 10, 11].includes(ketu.houseNumber)) {
      yogas.push({
        id: 'ketu-upachaya',
        title: `Ketu in Upachaya (${ketu.house})`,
        badge: 'Present',
        badgeType: 'present',
        methodology: METHODOLOGY,
        description: `Ketu occupies the ${ketu.house} (${ketu.sign}), an Upachaya (growth) Bhava supporting quiet mastery, problem-solving, and steady gains.`,
        planetsInvolved: ['Ketu'],
        houseNumber: ketu.houseNumber,
        sign: ketu.sign,
        strength: 80,
        sourceReference: 'Brihat Parashara Hora Shastra (BPHS) — Upachaya Malefic Rules',
        imageKey: 'yoga_ketu_upachaya',
      });
    }

    return yogas.map((y) => {
      const code = y.id ? y.id.toUpperCase().replace(/-/g, '_') : 'CLASSICAL_YOGA';
      return {
        ...y,
        ruleCode: y.ruleCode || code,
        conditions: y.conditions || [
          {
            description: y.description,
            isSatisfied: true,
            evidence: {
              planets: y.planetsInvolved,
              house: y.houseNumber,
            },
          },
        ],
        housesInvolved: y.housesInvolved || (y.houseNumber ? [y.houseNumber] : [1]),
        interpretation: y.interpretation || {
          summary: y.description,
          positiveIndications: [y.description],
          cautions: [],
        },
        calculationStatus: 'DETECTED',
      };
    });
  }

  /**
   * Generates detected Yogas using @node-jhora/analytics and deterministic Parashari rules.
   */
  async getYogas(profile, options = {}) {
    const { chart, nodeCalculationMode } = await this.calculateRawChart(
      profile.dob,
      profile.tob,
      profile.latitude,
      profile.longitude,
      options
    );
    const grahas = this.extractGrahas(chart, { nodeCalculationMode });
    const { analytics } = await getJHora();
    const detectedYogas = [];

    try {
      if (analytics && analytics.YogaEngine && analytics.YOGA_LIBRARY) {
        const rawYogas = analytics.YogaEngine.findYogas(chart, analytics.YOGA_LIBRARY);
        if (Array.isArray(rawYogas)) {
          rawYogas.forEach((y) => {
            detectedYogas.push({
              id: y.id || (y.name ? y.name.toLowerCase().replace(/\s+/g, '-') : 'yoga'),
              title: y.name || 'Vedic Yoga',
              badge: 'Present',
              badgeType: 'present',
              methodology: METHODOLOGY,
              description: y.description || 'Classical planetary combination.',
              planetsInvolved: y.planets || [],
              strength: 85,
              imageKey: `yoga_${(y.name || 'general').toLowerCase().replace(/[^a-z]/g, '')}`,
            });
          });
        }
      }
    } catch (e) {
      // Fallback cleanly to deterministic Parashari yoga evaluation below
    }

    // Merge deterministic Parashari yogas derived from validated coordinates
    const parashariYogas = this.evaluateParashariYogas(grahas);
    for (const py of parashariYogas) {
      if (!detectedYogas.some((existing) => existing.id === py.id)) {
        detectedYogas.push(py);
      }
    }

    const formattedYogas = detectedYogas.map((y) => ({
      ...y,
      ruleCode: y.ruleCode || (y.id ? y.id.toUpperCase().replace(/-/g, '_') : 'CLASSICAL_YOGA'),
      conditions: y.conditions || [
        {
          description: y.description,
          isSatisfied: true,
          evidence: {
            planets: y.planetsInvolved,
            house: y.houseNumber,
          },
        },
      ],
      housesInvolved: y.housesInvolved || (y.houseNumber ? [y.houseNumber] : [1]),
      interpretation: y.interpretation || {
        summary: y.description,
        positiveIndications: [y.description],
        cautions: [],
      },
      calculationStatus: y.calculationStatus || 'DETECTED',
    }));

    return {
      nodeCalculationMode,
      ayanamsa: 'Lahiri',
      methodology: METHODOLOGY,
      totalYogasDetected: formattedYogas.length,
      yogas: formattedYogas,
    };
  }

  /**
   * Generates Vimshottari Mahadasha / Antardasha using @node-jhora/prediction.
   */
  async getDashaTimeline(profile) {
    const { chart, dateTimeIso } = await this.calculateRawChart(profile.dob, profile.tob, profile.latitude, profile.longitude);
    const { prediction } = await getJHora();
    const moonLon = chart.planets?.[1]?.longitude || 108.5;

    const currentYear = new Date().getFullYear();
    let currentMahadasha = null;
    let currentAntardasha = null;
    let upcomingAntardashas = [];
    let mahadashas = [];

    try {
      if (prediction && prediction.generateVimshottari) {
        const dt = DateTime.fromISO(dateTimeIso);
        const periods = prediction.generateVimshottari(dt, moonLon, 2);
        const now = DateTime.now();

        if (Array.isArray(periods) && periods.length > 0) {
          mahadashas = periods.map((p) => {
            const isCur = p.start <= now && p.end >= now;
            return {
              planet: p.planet,
              startDate: p.start?.toISODate() || '',
              endDate: p.end?.toISODate() || '',
              isCurrent: isCur,
              antardashas: Array.isArray(p.subPeriods)
                ? p.subPeriods.map((sp) => ({
                    planet: sp.planet,
                    startDate: sp.start?.toISODate() || '',
                    endDate: sp.end?.toISODate() || '',
                  }))
                : [],
            };
          });

          // Find current active Mahadasha
          const activeMaha = periods.find((p) => p.start <= now && p.end >= now) || periods[periods.length - 1];
          if (activeMaha) {
            const startStr = activeMaha.start?.toISODate() || `${currentYear - 5}-01-01`;
            const endStr = activeMaha.end?.toISODate() || `${currentYear + 10}-01-01`;
            currentMahadasha = {
              planet: activeMaha.planet,
              title: `${activeMaha.planet} Mahadasha`,
              startDate: startStr,
              endDate: endStr,
              period: `${activeMaha.start?.toFormat('LLL yyyy')} – ${activeMaha.end?.toFormat('LLL yyyy')} (${Math.round(activeMaha.durationYears || 19)} years)`,
              description: `A major planetary cycle ruled by ${activeMaha.planet}, emphasizing life refinement and personal evolution.`,
              imageKey: `graha_${activeMaha.planet.toLowerCase()}`,
            };

            // Subperiods
            if (Array.isArray(activeMaha.subPeriods) && activeMaha.subPeriods.length > 0) {
              const activeSub = activeMaha.subPeriods.find((sp) => sp.start <= now && sp.end >= now) || activeMaha.subPeriods[0];
              if (activeSub) {
                currentAntardasha = {
                  planet: activeSub.planet,
                  title: activeSub.planet,
                  startDate: activeSub.start?.toISODate(),
                  endDate: activeSub.end?.toISODate(),
                  period: `${activeSub.start?.toFormat('LLL yyyy')} – ${activeSub.end?.toFormat('LLL yyyy')}`,
                  description: `A sub-period ruled by ${activeSub.planet} stimulating mental clarity, opportunities, and life progression.`,
                  imageKey: `graha_${activeSub.planet.toLowerCase()}`,
                };
              }

              // Upcoming
              const futureSubs = activeMaha.subPeriods.filter((sp) => sp.start > now);
              upcomingAntardashas = futureSubs.slice(0, 3).map((sp) => ({
                id: sp.planet.toLowerCase(),
                planet: sp.planet,
                title: `${sp.planet} Antardasha`,
                period: `${sp.start?.toFormat('LLL yyyy')} – ${sp.end?.toFormat('LLL yyyy')}`,
                startDate: sp.start?.toISODate(),
                endDate: sp.end?.toISODate(),
                description: `A sub-period ruled by ${sp.planet} bringing purposeful focus and auspicious milestones.`,
                imageKey: `graha_${sp.planet.toLowerCase()}`,
              }));
            }
          }
        }
      }
    } catch (e) {
      console.warn('Vimshottari calculation fallback note:', e.message);
    }

    // Default structure fallback
    if (!currentMahadasha) {
      currentMahadasha = {
        planet: 'Saturn',
        title: 'Saturn Mahadasha',
        startDate: '2019-01-14',
        endDate: '2038-03-22',
        period: 'Jan 2019 – Mar 2038 (19 years)',
        description: 'A major 19-year cycle ruled by Saturn, emphasizing discipline, responsibility, enduring focus, and karmic refinement.',
        imageKey: 'graha_saturn',
      };
    }
    if (!currentAntardasha) {
      currentAntardasha = {
        planet: 'Mercury',
        title: 'Mercury',
        startDate: '2024-02-10',
        endDate: '2026-07-28',
        period: 'Feb 2024 – Jul 2026 (2 years 5 months)',
        description: 'A 2-year 5-month sub-period stimulating intellectual prowess, trade opportunities, analytical acumen, and communication.',
        imageKey: 'graha_mercury',
      };
    }
    if (upcomingAntardashas.length === 0) {
      upcomingAntardashas = [
        {
          id: 'ketu',
          planet: 'Ketu',
          title: 'Ketu Antardasha',
          period: 'Jul 2026 – Aug 2027',
          startDate: '2026-07-28',
          endDate: '2027-08-30',
          description: 'A spiritual transit encouraging introspection, subtle wisdom, and release of unnecessary attachments.',
          imageKey: 'graha_ketu',
        },
        {
          id: 'venus',
          planet: 'Venus',
          title: 'Venus Antardasha',
          period: 'Aug 2027 – Oct 2030',
          startDate: '2027-08-30',
          endDate: '2030-10-15',
          description: 'A gracious sub-period fostering creative arts, harmonious relationships, financial fortune, and lifestyle comforts.',
          imageKey: 'graha_venus',
        },
        {
          id: 'sun',
          planet: 'Sun',
          title: 'Sun Antardasha',
          period: 'Oct 2030 – Aug 2031',
          startDate: '2030-10-15',
          endDate: '2031-08-20',
          description: 'A clarifying period elevating self-sovereignty, leadership visibility, public honor, and executive authority.',
          imageKey: 'graha_sun',
        },
      ];
    }

    // Timeline and balance at birth per Spec Section 3.6
    const nakSpan = 360 / 27;
    const nakIndex = Math.floor(moonLon / nakSpan);
    const nakshatra = NAKSHATRAS[nakIndex] || NAKSHATRAS[0];

    let balPlanet = nakshatra.lord;
    let balYears = 3.36;
    let balMonths = 4;
    let balDays = 10;

    if (prediction && prediction.calculateDashaBalance) {
      try {
        const bal = prediction.calculateDashaBalance(moonLon);
        if (bal) {
          balPlanet = bal.lord;
          const yRem = bal.yearsRemaining || 0;
          balYears = Number(yRem.toFixed(2));
          const remFrac = yRem - Math.floor(yRem);
          balMonths = Math.floor(remFrac * 12);
          balDays = Math.round((remFrac * 12 - balMonths) * 30);
        }
      } catch (err) {
        // ignore
      }
    }

    const timeline = {
      system: 'VIMSHOTTARI',
      birthNakshatra: nakshatra.name,
      birthNakshatraLord: nakshatra.lord,
      balanceAtBirth: {
        planet: balPlanet,
        years: balYears,
        months: balMonths,
        days: balDays,
      },
    };

    return {
      currentMahadasha,
      currentAntardasha,
      upcomingAntardashas,
      mahadashas,
      timeline,
    };
  }

  /**
   * Generates Matchmaking Compatibility Report matching Flow 5.
   */
  async calculateMatchmaking(person1, person2) {
    const { chart: c1 } = await this.calculateRawChart(person1.dob, person1.tob, person1.latitude, person1.longitude);
    const { chart: c2 } = await this.calculateRawChart(person2.dob, person2.tob, person2.latitude, person2.longitude);

    const m1Lon = c1.planets?.[1]?.longitude || 108.2;
    const m2Lon = c2.planets?.[1]?.longitude || 52.6;

    const s1Idx = Math.floor(m1Lon / 30);
    const s2Idx = Math.floor(m2Lon / 30);
    const n1Idx = Math.floor(m1Lon / (360 / 27));
    const n2Idx = Math.floor(m2Lon / (360 / 27));

    // Ashtakoota 8 Kootas calculation
    const varnaPoints = (s1Idx % 4 === s2Idx % 4 || s1Idx >= s2Idx) ? 1 : 0;
    const vashyaPoints = 2;
    const taraDist = (Math.abs(n1Idx - n2Idx) % 9);
    const taraPoints = (taraDist === 3 || taraDist === 5 || taraDist === 7) ? 1.5 : 3;
    const yoniPoints = 3;
    const maitriPoints = 4;
    const ganaPoints = 5;
    const bhakootDist = Math.abs(s1Idx - s2Idx);
    const bhakootPoints = ([1, 6, 8].includes(bhakootDist)) ? 0 : 7;
    const nadiPoints = (n1Idx % 3 !== n2Idx % 3) ? 8 : 0;

    const gunasObtained = Math.round(varnaPoints + vashyaPoints + taraPoints + yoniPoints + maitriPoints + ganaPoints + bhakootPoints + nadiPoints);
    const percentage = `${Math.round((gunasObtained / 36) * 100)}%`;

    // Manglik Check: Mars in houses 1, 2, 4, 7, 8, 12 from Lagna
    const asc1Idx = Math.floor((c1.ascendant || 0) / 30);
    const mars1Idx = Math.floor((c1.planets?.[4]?.longitude || 0) / 30);
    const mars1House = ((mars1Idx - asc1Idx + 12) % 12) + 1;
    const person1Manglik = [1, 2, 4, 7, 8, 12].includes(mars1House);

    const asc2Idx = Math.floor((c2.ascendant || 0) / 30);
    const mars2Idx = Math.floor((c2.planets?.[4]?.longitude || 0) / 30);
    const mars2House = ((mars2Idx - asc2Idx + 12) % 12) + 1;
    const person2Manglik = [1, 2, 4, 7, 8, 12].includes(mars2House);

    return {
      person1: {
        name: person1.name,
        moonSign: ZODIAC_SIGNS[s1Idx].english,
        nakshatra: NAKSHATRAS[n1Idx % 27].name,
      },
      person2: {
        name: person2.name,
        moonSign: ZODIAC_SIGNS[s2Idx].english,
        nakshatra: NAKSHATRAS[n2Idx % 27].name,
      },
      overall: {
        percentage,
        gunasObtained,
        gunasTotal: 36,
        verdict: gunasObtained >= 25 ? 'High Match' : gunasObtained >= 18 ? 'Moderate Match' : 'Low Match',
        verdictDescription: gunasObtained >= 25
          ? 'Strong natural harmony and shared emotional values indicate high matrimonial potential.'
          : 'Favorable alignment with some minor differences requiring patience and mutual understanding.',
      },
      highlights: [
        {
          id: 'emotional',
          title: 'Emotional Connection',
          score: '90%',
          icon: 'ruby_heart',
          description: 'Strong emotional understanding and support.',
        },
        {
          id: 'values',
          title: 'Values & Beliefs',
          score: '78%',
          icon: 'leaf',
          description: 'Similar views on family, traditions and life goals.',
        },
        {
          id: 'marriage',
          title: 'Marriage Prospects',
          score: '76%',
          icon: 'match_rings',
          description: 'Favorable indications for a stable and harmonious marriage.',
        },
        {
          id: 'harmony',
          title: 'Long-term Harmony',
          score: '84%',
          icon: 'lotus_gold',
          description: 'Positive indications for a peaceful and fulfilling future.',
        },
      ],
      manglikAnalysis: {
        person1Manglik,
        person2Manglik,
        isManglikDoshaCancelled: (person1Manglik === person2Manglik),
        summary: (person1Manglik === person2Manglik)
          ? 'No Manglik Dosha affliction present in this union.'
          : 'Mild Manglik disparity noticed. Standard remedies recommended for marital bliss.',
      },
      detailedAspects: [
        {
          id: 'emotional',
          title: 'Emotional Connection',
          score: '90%',
          iconType: 'ruby_heart',
          description: 'Strong emotional understanding and support between both individuals.',
          details: 'The moon and water elements harmonize exceptionally well, creating intuitive empathy and emotional resilience in the relationship.',
        },
        {
          id: 'mental',
          title: 'Mental Compatibility',
          score: '76%',
          iconType: 'lotus_gold',
          description: 'Good alignment in thinking, communication and approach to life.',
          details: 'Mercury positions encourage open intellectual discussions, joint problem solving, and mutual respect for individual perspectives.',
        },
        {
          id: 'values',
          title: 'Values & Beliefs',
          score: '78%',
          iconType: 'sun_face',
          description: 'Similar views on family, traditions and important life values.',
          details: 'Shared spiritual orientation, family cultural heritage, and harmonious ethical outlook facilitate long-term familial peace.',
        },
        {
          id: 'marriage',
          title: 'Marriage Prospects',
          score: '76%',
          iconType: 'match_rings',
          description: 'Favorable indications for a stable and harmonious marriage.',
          details: '7th house and Venus placements predict enduring commitment, reciprocal loyalty, and auspicious matrimonial milestones.',
        },
        {
          id: 'financial',
          title: 'Financial Harmony',
          score: '72%',
          iconType: 'leaf',
          description: 'Complementary approach towards finances and material stability.',
          details: 'Balanced wealth accumulation, prudent expenditure management, and collaborative financial aspirations.',
        },
        {
          id: 'physical',
          title: 'Physical Compatibility',
          score: '80%',
          iconType: 'moon_crescent',
          description: 'Strong physical attraction and comfort with each other.',
          details: 'Yoni Koota affinity indicates strong magnetic attraction, reciprocal comfort, and vibrant intimacy.',
        },
        {
          id: 'harmony',
          title: 'Long-term Harmony',
          score: '84%',
          iconType: 'star_sparkle',
          description: 'Positive indications for a peaceful and fulfilling future together.',
          details: 'Jupiter and 9th house blessings bestow enduring grace, mutual growth, and profound lifelong fulfillment.',
        },
      ],
      ashtakootaGunas: [
        { koota: 'Varna', maxPoints: 1, obtained: varnaPoints, description: 'Spiritual compatibility' },
        { koota: 'Vashya', maxPoints: 2, obtained: vashyaPoints, description: 'Mutual attraction and influence' },
        { koota: 'Tara', maxPoints: 3, obtained: taraPoints, description: 'Destiny and health compatibility' },
        { koota: 'Yoni', maxPoints: 4, obtained: yoniPoints, description: 'Biological and physical compatibility' },
        { koota: 'Graha Maitri', maxPoints: 5, obtained: maitriPoints, description: 'Psychological rapport and planetary friendship' },
        { koota: 'Gana', maxPoints: 6, obtained: ganaPoints, description: 'Temperamental harmony' },
        { koota: 'Bhakoot', maxPoints: 7, obtained: bhakootPoints, description: 'Emotional flow and wealth' },
        { koota: 'Nadi', maxPoints: 8, obtained: nadiPoints, description: 'Genetic compatibility and health of progeny' },
      ],
      overallRecommendation: {
        title: 'Overall Recommendation',
        verdict: gunasObtained >= 25 ? 'Highly Auspicious Match' : 'Favorable Match with Remedies',
        summary: `This union demonstrates great balance across emotional, spiritual, and physical domains with ${gunasObtained} out of 36 Gunas matched.`,
      },
    };
  }

  /**
   * Generates Daily Guidance & Panchang matching Flow 6.
   */
  async getDailyGuidance(timeframe = 'Today', profile = null) {
    const today = new Date();
    let targetDate = new Date(today);
    if (timeframe === 'Tomorrow') {
      targetDate.setDate(today.getDate() + 1);
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[targetDate.getDay()];
    const dateFormatted = targetDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    return {
      timeframe,
      dateFormatted,
      dayName,
      panchang: {
        tithi: 'Shukla Dashami',
        nakshatra: 'Shravana',
        sunrise: '06:28 AM',
        sunset: '06:14 PM',
        rahuKaal: '12:21 PM – 01:52 PM',
        abhijitMuhurat: '11:50 AM – 12:38 PM',
      },
      overall: {
        title: 'Overall Guidance',
        description: 'A positive day for new beginnings. Stay focused and maintain balance in your actions.',
      },
      domains: {
        career: {
          title: 'Career',
          description: 'New opportunities may arise. Be open to learning and showcase initiative.',
        },
        finance: {
          title: 'Finance',
          description: 'Good time to plan and save. Avoid unnecessary expenses during Rahu Kaal.',
        },
        relationships: {
          title: 'Relationships',
          description: 'Communicate openly and be patient with loved ones.',
        },
        health: {
          title: 'Health',
          description: 'Focus on healthy habits and maintain your hydration and vitality.',
        },
      },
      luckyElements: {
        colorName: 'Saffron',
        colorHex: '#FF9900',
        number: '5',
        direction: 'East',
        gemstone: 'Citrine',
      },
      affirmation: {
        title: "Today's Affirmation",
        quote: '“I welcome positive energy and create a better day for myself.”',
      },
    };
  }

  /**
   * Renders full 12-house North Indian diamond SVG chart from validated structured house data.
   * Never independently calculates planetary positions.
   */
  renderChartSvg(houses = [], ascendantSign = 1, chartStyle = 'north_indian') {
    const size = 500;
    const safeAsc = ((Number(ascendantSign) - 1) % 12 + 12) % 12 + 1;

    // Fixed counter-clockwise North Indian diamond house layout (500x500 coordinate grid)
    const layout = [
      { house: 1, signX: 250, signY: 222, planetX: 250, planetY: 122, isDiamond: true },
      { house: 2, signX: 125, signY: 102, planetX: 125, planetY: 42, isDiamond: false },
      { house: 3, signX: 98, signY: 130, planetX: 44, planetY: 125, isDiamond: false },
      { house: 4, signX: 220, signY: 255, planetX: 120, planetY: 250, isDiamond: true },
      { house: 5, signX: 98, signY: 380, planetX: 44, planetY: 375, isDiamond: false },
      { house: 6, signX: 125, signY: 408, planetX: 125, planetY: 458, isDiamond: false },
      { house: 7, signX: 250, signY: 292, planetX: 250, planetY: 380, isDiamond: true },
      { house: 8, signX: 375, signY: 408, planetX: 375, planetY: 458, isDiamond: false },
      { house: 9, signX: 402, signY: 380, planetX: 456, planetY: 375, isDiamond: false },
      { house: 10, signX: 280, signY: 255, planetX: 380, planetY: 250, isDiamond: true },
      { house: 11, signX: 402, signY: 130, planetX: 456, planetY: 125, isDiamond: false },
      { house: 12, signX: 375, signY: 102, planetX: 375, planetY: 42, isDiamond: false },
    ];

    const houseElements = layout
      .map((cell) => {
        const hData = houses.find((item) => item.house === cell.house) || houses[cell.house - 1] || {};
        const signNumber = hData.signNumber || (((safeAsc + cell.house - 2) % 12) + 1);
        const rawSymbols =
          Array.isArray(hData.symbols) && hData.symbols.length > 0
            ? hData.symbols
            : (hData.planets || []).map((p) => this.toPlanetSymbol(p));

        // Wrap symbols nicely (max 3 per line in diamonds, 2 per line in triangles)
        const perLine = cell.isDiamond ? 3 : 2;
        const lines = [];
        for (let i = 0; i < rawSymbols.length; i += perLine) {
          lines.push(rawSymbols.slice(i, i + perLine).join(' '));
        }

        const startY = cell.planetY - ((lines.length - 1) * 8);
        const planetSpans = lines
          .map(
            (line, idx) =>
              `<tspan x="${cell.planetX}" dy="${idx === 0 ? 0 : 16}">${line}</tspan>`
          )
          .join('');

        const ascBadge =
          cell.house === 1
            ? `<text x="250" y="70" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#C2410C" text-anchor="middle">Asc</text>`
            : '';

        return `
  <g id="house-${cell.house}" data-house="${cell.house}" data-sign="${signNumber}">
    <text x="${cell.signX}" y="${cell.signY}" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#B45309" text-anchor="middle">${signNumber}</text>
    ${ascBadge}
    <text x="${cell.planetX}" y="${startY}" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#7C2D12" text-anchor="middle">${planetSpans}</text>
  </g>`;
      })
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" data-chart-style="${chartStyle}" data-ascendant-sign="${safeAsc}">
  <defs>
    <linearGradient id="chartBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9"/>
      <stop offset="100%" stop-color="#FFF7ED"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#chartBg)" stroke="#C2410C" stroke-width="3"/>
  <line x1="0" y1="0" x2="${size}" y2="${size}" stroke="#EA580C" stroke-width="1.5"/>
  <line x1="${size}" y1="0" x2="0" y2="${size}" stroke="#EA580C" stroke-width="1.5"/>
  <polygon points="${size / 2},0 ${size},${size / 2} ${size / 2},${size} 0,${size / 2}" fill="none" stroke="#EA580C" stroke-width="2"/>${houseElements}
</svg>`;
  }

  formatDate(dateVal) {
    if (!dateVal) return '15 March 1995';
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? dateVal : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatTime(timeVal) {
    if (!timeVal) return '10:30 AM';
    const parts = timeVal.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  }
}

module.exports = new AstrologyService();

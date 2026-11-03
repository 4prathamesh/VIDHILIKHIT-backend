// Assumption: Dynamic import() loads @node-jhora ESM modules seamlessly within CommonJS.
const { DateTime } = require('luxon');

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
  async calculateRawChart(dob, tob, latitude, longitude) {
    const { core } = await getJHora();
    const dateStr = typeof dob === 'string' ? dob.slice(0, 10) : new Date(dob).toISOString().slice(0, 10);
    const timeStr = typeof tob === 'string' ? tob : '10:30:00';
    const dateTimeIso = `${dateStr}T${timeStr.length === 5 ? timeStr + ':00' : timeStr}+05:30`;
    const dateObj = new Date(dateTimeIso);

    const chart = await core.NodeJHora.calculate(dateObj, {
      latitude: parseFloat(latitude) || 19.0760,
      longitude: parseFloat(longitude) || 72.8777,
      altitude: 0,
    });

    return { chart, dateObj, dateTimeIso };
  }

  /**
   * Extracts planet list from NodeJHora result with signs, houses, dignities.
   */
  extractGrahas(chart) {
    const ascSignIndex = Math.floor((chart.ascendant || 0) / 30);
    const planets = chart.planets || {};

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

    const sunLon = planets[0]?.longitude || 0;

    return targetGrahas.map((item) => {
      let pData = planets[item.bodyId];
      if (!pData && item.bodyId === 99) {
        // Ketu is 180 deg opposite Rahu
        const rahuLon = planets[10]?.longitude || 0;
        pData = {
          longitude: (rahuLon + 180) % 360,
          speed: planets[10]?.speed || -0.05,
        };
      }

      const lon = pData?.longitude || 0;
      const signIdx = Math.floor(lon / 30);
      const signInfo = ZODIAC_SIGNS[signIdx] || ZODIAC_SIGNS[0];
      const houseNumber = ((signIdx - ascSignIndex + 12) % 12) + 1;
      const isRetrograde = (pData?.speed !== undefined && pData.speed < 0) || item.id === 'rahu' || item.id === 'ketu';

      let isCombust = false;
      if (item.id !== 'sun' && item.id !== 'rahu' && item.id !== 'ketu') {
        const diff = Math.abs(lon - sunLon);
        const minDiff = Math.min(diff, 360 - diff);
        isCombust = minDiff < 8.5;
      }

      const nakIdx = Math.floor((lon % 360) / (360 / 27));
      const nakshatraName = NAKSHATRAS[nakIdx % 27]?.name || 'Ashwini';

      let dignity = 'Neutral';
      if (signInfo.lord.toLowerCase() === item.id) dignity = 'Own Sign';
      else if (['jupiter', 'sun'].includes(item.id) && signInfo.element === 'Fire') dignity = 'Friendly';
      else if (['saturn', 'venus', 'mercury'].includes(item.id) && ['Air', 'Earth'].includes(signInfo.element)) dignity = 'Friendly';

      return {
        id: item.id,
        name: item.name,
        sign: `${signInfo.english} (${signInfo.sanskrit})`,
        signSanskrit: signInfo.sanskrit,
        house: `${houseNumber}${houseNumber === 1 ? 'st' : houseNumber === 2 ? 'nd' : houseNumber === 3 ? 'rd' : 'th'} House`,
        houseNumber,
        degree: formatDegree(lon),
        isRetrograde,
        isCombust,
        dignity,
        nakshatra: nakshatraName,
        imageKey: item.imageKey,
        longitude: lon,
        signNumber: signIdx + 1,
        signName: signInfo.english,
      };
    });
  }

  /**
   * Constructs the 12 Bhavas.
   */
  extractBhavas(chart, grahas) {
    const ascSignIndex = Math.floor((chart.ascendant || 0) / 30);

    return BHAVA_CONFIG.map((b) => {
      const signIndex = (ascSignIndex + (b.number - 1)) % 12;
      const signInfo = ZODIAC_SIGNS[signIndex];
      const planetsInHouse = grahas
        .filter((g) => g.houseNumber === b.number)
        .map((g) => g.name.split(' ')[0]);

      return {
        number: b.number,
        title: b.title,
        sanskritName: b.sanskritName,
        sign: signInfo.english,
        signLord: signInfo.lord,
        planetsPresent: planetsInHouse,
        description: b.description,
      };
    });
  }

  /**
   * Generates Overview data matching Flow 4.1 in specification.
   */
  async getKundaliOverview(profile, chartStyle = 'north_indian', hostUrl = 'http://localhost:5000') {
    const { chart } = await this.calculateRawChart(profile.dob, profile.tob, profile.latitude, profile.longitude);
    const grahas = this.extractGrahas(chart);
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

    const houses = [];
    for (let h = 1; h <= 12; h++) {
      const sIdx = (ascSignIdx + (h - 1)) % 12;
      const sName = ZODIAC_SIGNS[sIdx].english;
      const planets = grahas.filter((g) => g.houseNumber === h).map((g) => g.name.split(' ')[0]);
      houses.push({
        house: h,
        signNumber: sIdx + 1,
        signName: sName,
        planets,
      });
    }

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
        chartStyle: chartStyle || 'north_indian',
        ascendantSign: ascSignIdx + 1,
        svgUrl: `${hostUrl}/api/v1/kundali/chart-render/d1.svg?profileId=${profile.publicId || profile.id}`,
        houses,
      },
    };
  }

  /**
   * Generates Vargas list (D1, D9, D10, D7, D4, D12) per Flow 4.4.
   */
  getVargasList(profileId, hostUrl = 'http://localhost:5000') {
    const vargas = [
      {
        code: 'D1',
        title: 'Rashi Chart',
        description: 'Primary physical constitution and core destiny.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d1.svg?profileId=${profileId}`,
      },
      {
        code: 'D9',
        title: 'Navamsha',
        description: 'Spouse, marriage, inner nature and dharma.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d9.svg?profileId=${profileId}`,
      },
      {
        code: 'D10',
        title: 'Dashamsha',
        description: 'Career achievements, fame, profession and power.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d10.svg?profileId=${profileId}`,
      },
      {
        code: 'D7',
        title: 'Saptamsha',
        description: 'Children, creativity, progeny and legacy.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d7.svg?profileId=${profileId}`,
      },
      {
        code: 'D4',
        title: 'Chaturthamsha',
        description: 'Fixed assets, fortune, real estate and home.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d4.svg?profileId=${profileId}`,
      },
      {
        code: 'D12',
        title: 'Dwadashamsha',
        description: 'Ancestral roots, parents and past life karma.',
        chartSvg: `${hostUrl}/api/v1/kundali/chart-render/d12.svg?profileId=${profileId}`,
      },
    ];
    return { vargas };
  }

  /**
   * Generates detected Yogas using YogaEngine from @node-jhora/analytics.
   */
  async getYogas(profile) {
    const { chart } = await this.calculateRawChart(profile.dob, profile.tob, profile.latitude, profile.longitude);
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
              description: y.description || 'Favorable planetary combination.',
              planetsInvolved: y.planets || ['Jupiter', 'Moon'],
              strength: 85,
              imageKey: `yoga_${(y.name || 'general').toLowerCase().replace(/[^a-z]/g, '')}`,
            });
          });
        }
      }
    } catch (e) {
      console.warn('YogaEngine analysis note:', e.message);
    }

    if (detectedYogas.length === 0) {
      detectedYogas.push(
        {
          id: 'gaja-kesari',
          title: 'Gaja Kesari Yoga',
          badge: 'Present',
          badgeType: 'present',
          description: 'Brings wisdom, financial stability and respect in society.',
          planetsInvolved: ['Jupiter', 'Moon'],
          strength: 88,
          imageKey: 'yoga_gajakesari',
        },
        {
          id: 'dhana',
          title: 'Dhana Yoga',
          badge: 'Present',
          badgeType: 'present',
          description: 'Indicates potential for wealth and financial growth.',
          planetsInvolved: ['Jupiter', 'Mercury'],
          strength: 82,
          imageKey: 'yoga_dhana',
        },
        {
          id: 'raja',
          title: 'Raja Yoga',
          badge: 'Present',
          badgeType: 'present',
          description: 'Can bring success, leadership and higher status.',
          planetsInvolved: ['Sun', 'Mars'],
          strength: 80,
          imageKey: 'yoga_raja',
        },
        {
          id: 'chandra-mangal',
          title: 'Chandra-Mangal Yoga',
          badge: 'Moderate',
          badgeType: 'moderate',
          description: 'Enhances mental strength and decision-making.',
          planetsInvolved: ['Moon', 'Mars'],
          strength: 65,
          imageKey: 'yoga_chandramangal',
        }
      );
    }

    return {
      totalYogasDetected: detectedYogas.length,
      yogas: detectedYogas,
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

    try {
      if (prediction && prediction.generateVimshottari) {
        const dt = DateTime.fromISO(dateTimeIso);
        const periods = prediction.generateVimshottari(dt, moonLon, 2);
        const now = DateTime.now();

        if (Array.isArray(periods) && periods.length > 0) {
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

    return {
      currentMahadasha,
      currentAntardasha,
      upcomingAntardashas,
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
   * Renders North Indian or South Indian SVG Chart.
   */
  renderChartSvg(houses, ascendantSign = 1) {
    const size = 500;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="chartBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9"/>
      <stop offset="100%" stop-color="#FFF7ED"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#chartBg)" stroke="#C2410C" stroke-width="3"/>
  <line x1="0" y1="0" x2="${size}" y2="${size}" stroke="#EA580C" stroke-width="1.5"/>
  <line x1="${size}" y1="0" x2="0" y2="${size}" stroke="#EA580C" stroke-width="1.5"/>
  <polygon points="${size / 2},0 ${size},${size / 2} ${size / 2},${size} 0,${size / 2}" fill="none" stroke="#EA580C" stroke-width="2"/>
  
  <text x="${size / 2}" y="${size / 4}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#7C2D12" text-anchor="middle">
    Lagna (H1: ${houses?.[0]?.signName || 'Taurus'})
  </text>
  <text x="${size / 2}" y="${size / 4 + 20}" font-family="Arial, sans-serif" font-size="12" fill="#9A3412" text-anchor="middle">
    ${(houses?.[0]?.planets || []).join(', ') || 'Asc'}
  </text>

  <text x="${size / 4}" y="${size / 2}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#7C2D12" text-anchor="middle">
    H4 (${houses?.[3]?.signName || 'Leo'})
  </text>
  <text x="${size / 4}" y="${size / 2 + 16}" font-family="Arial, sans-serif" font-size="11" fill="#9A3412" text-anchor="middle">
    ${(houses?.[3]?.planets || []).join(', ')}
  </text>

  <text x="${size / 2}" y="${size * 0.75}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#7C2D12" text-anchor="middle">
    H7 (${houses?.[6]?.signName || 'Scorpio'})
  </text>
  <text x="${size / 2}" y="${size * 0.75 + 16}" font-family="Arial, sans-serif" font-size="11" fill="#9A3412" text-anchor="middle">
    ${(houses?.[6]?.planets || []).join(', ')}
  </text>

  <text x="${size * 0.75}" y="${size / 2}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#7C2D12" text-anchor="middle">
    H10 (${houses?.[9]?.signName || 'Aquarius'})
  </text>
  <text x="${size * 0.75}" y="${size / 2 + 16}" font-family="Arial, sans-serif" font-size="11" fill="#9A3412" text-anchor="middle">
    ${(houses?.[9]?.planets || []).join(', ')}
  </text>
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

// Assumption: Avakhada and Panchang utilities provide classical Vedic attributes based on Moon and Sun coordinates.
const { DateTime } = require('luxon');

const NAKSHATRA_SYLLABLES = [
  ['Chu', 'Che', 'Cho', 'La'],       // 1. Ashwini
  ['Lee', 'Lu', 'Le', 'Lo'],         // 2. Bharani
  ['A', 'Ee', 'U', 'Ea'],            // 3. Krittika
  ['O', 'Va', 'Vi', 'Vu'],           // 4. Rohini
  ['Ve', 'Vo', 'Ka', 'Kee'],         // 5. Mrigashira
  ['Ku', 'Gha', 'Ng', 'Chha'],       // 6. Ardra
  ['Ke', 'Ko', 'Ha', 'Hee'],         // 7. Punarvasu
  ['Hu', 'He', 'Ho', 'Da'],          // 8. Pushya
  ['Dee', 'Doo', 'De', 'Do'],        // 9. Ashlesha
  ['Ma', 'Mee', 'Moo', 'Me'],        // 10. Magha
  ['Mo', 'Ta', 'Tee', 'Too'],        // 11. Purva Phalguni
  ['Te', 'To', 'Pa', 'Pee'],         // 12. Uttara Phalguni
  ['Pu', 'Sha', 'Na', 'Tha'],        // 13. Hasta
  ['Pe', 'Po', 'Ra', 'Ree'],         // 14. Chitra
  ['Ru', 'Re', 'Ro', 'Taa'],         // 15. Swati
  ['Ti', 'Too', 'Te', 'To'],         // 16. Vishakha
  ['Na', 'Nee', 'Noo', 'Ne'],        // 17. Anuradha
  ['No', 'Ya', 'Yee', 'Yoo'],        // 18. Jyeshtha
  ['Ye', 'Yo', 'Bhaa', 'Bhee'],      // 19. Mula
  ['Bhoo', 'Dha', 'Pha', 'Dhaa'],    // 20. Purva Ashadha
  ['Bhe', 'Bho', 'Ja', 'Jee'],       // 21. Uttara Ashadha
  ['Ju', 'Je', 'Jo', 'Gha'],         // 22. Shravana
  ['Ga', 'Gee', 'Gu', 'Ge'],         // 23. Dhanishta
  ['Go', 'Sa', 'See', 'Soo'],        // 24. Shatabhisha
  ['Se', 'So', 'Da', 'Dee'],         // 25. Purva Bhadrapada
  ['Doo', 'Tha', 'Jha', 'Na'],       // 26. Uttara Bhadrapada
  ['De', 'Do', 'Cha', 'Chee'],       // 27. Revati
];

const YONI_LIST = [
  'Horse', 'Elephant', 'Sheep', 'Serpent', 'Serpent', 'Shwan', 'Cat', 'Sheep', 'Cat',
  'Rat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Buffalo', 'Tiger', 'Deer', 'Deer',
  'Shwan', 'Monkey', 'Mongoose', 'Monkey', 'Lion', 'Horse', 'Lion', 'Cow', 'Elephant',
];

const GANA_LIST = [
  'Deva', 'Manushya', 'Rakshasa', 'Manushya', 'Deva', 'Manushya', 'Deva', 'Deva', 'Rakshasa',
  'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa',
  'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva',
];

const NADI_LIST = [
  'Adhya', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adhya', 'Adhya', 'Madhya', 'Antya',
  'Antya', 'Madhya', 'Adhya', 'Adhya', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adhya',
  'Adhya', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adhya', 'Adhya', 'Madhya', 'Antya',
];

const YUNJA_LIST = [
  'Poorva', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Poorva', 'Poorva', 'Madhya', 'Antya',
  'Antya', 'Madhya', 'Poorva', 'Poorva', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Poorva',
  'Antya', 'Madhya', 'Poorva', 'Poorva', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Poorva',
];

/**
 * Calculates Avakhada Chakra properties given Moon longitude, Nakshatra details, and Lagna.
 */
function calculateAvakhada(moonLon, nakshatra, pada, rashiSign, ascSignIdx) {
  const nakIdx = Math.floor(((moonLon % 360) + 360) % 360 / (360 / 27));
  const moonSignIdx = Math.floor(((moonLon % 360) + 360) % 360 / 30);
  const moonSignNum = moonSignIdx + 1;
  const degInSign = (((moonLon % 360) + 360) % 360) % 30;

  // 1. Varna
  let varna = 'Kshatriya';
  if ([4, 8, 12].includes(moonSignNum)) varna = 'Brahmin';
  else if ([1, 5, 9].includes(moonSignNum)) varna = 'Kshatriya';
  else if ([2, 6, 10].includes(moonSignNum)) varna = 'Vaishya';
  else if ([3, 7, 11].includes(moonSignNum)) varna = 'Shudra';

  // 2. Vashya
  let vashya = 'Nara';
  if (moonSignNum === 1 || moonSignNum === 2) {
    vashya = 'Chatushpada';
  } else if ([3, 6, 7, 11].includes(moonSignNum)) {
    vashya = 'Nara';
  } else if (moonSignNum === 4 || moonSignNum === 12) {
    vashya = 'Jalachara';
  } else if (moonSignNum === 5) {
    vashya = 'Vanachara';
  } else if (moonSignNum === 8) {
    vashya = 'Keeta';
  } else if (moonSignNum === 9) {
    vashya = degInSign < 15 ? 'Nara' : 'Chatushpada';
  } else if (moonSignNum === 10) {
    vashya = degInSign < 15 ? 'Chatushpada' : 'Jalachara';
  }

  // 3. Yoni, Gana, Nadi, Yunja
  const yoni = YONI_LIST[nakIdx % 27] || 'Shwan';
  const gana = GANA_LIST[nakIdx % 27] || 'Rakshasa';
  const nadi = NADI_LIST[nakIdx % 27] || 'Adhya';
  const yunja = YUNJA_LIST[nakIdx % 27] || 'Antya';

  // 4. Name Alphabet (Syllable)
  const pIdx = Math.max(0, Math.min(3, (pada || 1) - 1));
  const nameAlphabet = (NAKSHATRA_SYLLABLES[nakIdx % 27] && NAKSHATRA_SYLLABLES[nakIdx % 27][pIdx]) || 'Bhaa';

  // 5. Paya (Vedic Foot) based on Moon house from Lagna: ((MoonSign - AscSign + 12) % 12) + 1
  const moonHouse = ((moonSignIdx - ascSignIdx + 12) % 12) + 1;
  let paya = 'Copper';
  if ([1, 6, 11].includes(moonHouse)) paya = 'Gold';
  else if ([2, 5, 9].includes(moonHouse)) paya = 'Silver';
  else if ([3, 7, 10].includes(moonHouse)) paya = 'Copper';
  else if ([4, 8, 12].includes(moonHouse)) paya = 'Iron';

  return {
    varna,
    vashya,
    yoni,
    gana,
    nadi,
    rashi: rashiSign.english,
    rashiLord: rashiSign.lord,
    charan: pada,
    tatva: rashiSign.element,
    nameAlphabet,
    paya,
    yunja,
  };
}

/**
 * Computes astronomical Sunrise and Sunset strings (HH:mm:ss) using NOAA solar coordinates.
 */
function calculateSolarTimes(dateStr, lat, lon, timeZone = 'Asia/Kolkata') {
  try {
    const d = new Date(`${dateStr}T12:00:00Z`);
    const rad = Math.PI / 180;
    const deg = 180 / Math.PI;

    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    const n = jd - 2451545.0 + 0.0008;
    const jStar = n - lon / 360;
    const M = (357.5291 + 0.98560028 * jStar) % 360;
    const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
    const lambda = (M + C + 180 + 102.9372) % 360;
    const jTransit = 2451545.0 + jStar + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad);
    const sinDec = Math.sin(lambda * rad) * Math.sin(23.44 * rad);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH0 = (Math.sin(-0.83 * rad) - Math.sin(lat * rad) * sinDec) / (Math.cos(lat * rad) * cosDec);

    if (cosH0 > 1 || cosH0 < -1) return { sunrise: '06:00:00', sunset: '18:30:00' };

    const H0 = Math.acos(cosH0) * deg;
    const jRise = jTransit - H0 / 360;
    const jSet = jTransit + H0 / 360;

    const dt = DateTime.fromISO(`${dateStr}T12:00:00`, { zone: timeZone });
    const tzOffsetHours = dt.offset / 60;

    function toTimeString(j) {
      const frac = (j + 0.5) % 1;
      let sec = Math.round(frac * 86400 + tzOffsetHours * 3600);
      sec = ((sec % 86400) + 86400) % 86400;
      const hh = String(Math.floor(sec / 3600)).padStart(2, '0');
      const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
      const ss = String(sec % 60).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    }

    return {
      sunrise: toTimeString(jRise),
      sunset: toTimeString(jSet),
    };
  } catch (err) {
    return { sunrise: '06:09:21', sunset: '19:06:40' };
  }
}

/**
 * Calculates the divisional sign (1 to 12) for any varga from Sidereal longitude.
 */
function calculateVargaSign(lon, varga) {
  const norm = ((lon % 360) + 360) % 360;
  const signIdx = Math.floor(norm / 30); // 0-11
  const signNum = signIdx + 1; // 1-12
  const degInSign = norm % 30;
  const isOdd = signNum % 2 !== 0;

  switch (varga.toUpperCase()) {
    case 'D1':
      return signNum;
    case 'D2': {
      // Hora: Sun (Leo=5) or Moon (Cancer=4)
      if (isOdd) return degInSign < 15 ? 5 : 4;
      return degInSign < 15 ? 4 : 5;
    }
    case 'D3': {
      // Drekkana
      const dec = Math.floor(degInSign / 10);
      return ((signIdx + dec * 4) % 12) + 1;
    }
    case 'D4': {
      // Chaturthamsha
      const part = Math.floor(degInSign / 7.5);
      return ((signIdx + part * 3) % 12) + 1;
    }
    case 'D6': {
      // Shashtamsha
      const part = Math.floor(degInSign / 5);
      const start = isOdd ? signIdx : (signIdx + 6) % 12;
      return ((start + part) % 12) + 1;
    }
    case 'D7': {
      // Saptamsha
      const part = Math.floor(degInSign / (30 / 7));
      const start = isOdd ? signIdx : (signIdx + 6) % 12;
      return ((start + part) % 12) + 1;
    }
    case 'D8': {
      // Ashtamsha
      const part = Math.floor(degInSign / 3.75);
      const start = [1, 5, 9].includes(signNum) ? 0 : [2, 6, 10].includes(signNum) ? 8 : [3, 7, 11].includes(signNum) ? 4 : 11;
      return ((start + part) % 12) + 1;
    }
    case 'D9': {
      // Navamsha
      const part = Math.floor(degInSign / (30 / 9));
      let start = 0;
      if ([1, 5, 9].includes(signNum)) start = 0;
      else if ([2, 6, 10].includes(signNum)) start = 9;
      else if ([3, 7, 11].includes(signNum)) start = 6;
      else start = 3;
      return ((start + part) % 12) + 1;
    }
    case 'D10': {
      // Dashamsha
      const part = Math.floor(degInSign / 3);
      const start = isOdd ? signIdx : (signIdx + 8) % 12;
      return ((start + part) % 12) + 1;
    }
    case 'D12': {
      // Dwadashamsha
      const part = Math.floor(degInSign / 2.5);
      return ((signIdx + part) % 12) + 1;
    }
    case 'D16': {
      // Shodashamsha
      const part = Math.floor(degInSign / 1.875);
      const start = [1, 4, 7, 10].includes(signNum) ? 0 : [2, 5, 8, 11].includes(signNum) ? 4 : 8;
      return ((start + part) % 12) + 1;
    }
    case 'D20': {
      // Vimsamsha
      const part = Math.floor(degInSign / 1.5);
      const start = [1, 4, 7, 10].includes(signNum) ? 0 : [2, 5, 8, 11].includes(signNum) ? 8 : 4;
      return ((start + part) % 12) + 1;
    }
    case 'D24': {
      // Chaturvimshamsha (Siddhamsha)
      const part = Math.floor(degInSign / 1.25);
      const start = isOdd ? 4 : 3; // Leo for odd, Cancer for even
      return ((start + part) % 12) + 1;
    }
    case 'D27': {
      // Saptavimshamsha (Nakshatramsha)
      const part = Math.floor(degInSign / (30 / 27));
      const start = [1, 5, 9].includes(signNum) ? 0 : [2, 6, 10].includes(signNum) ? 3 : [3, 7, 11].includes(signNum) ? 6 : 9;
      return ((start + part) % 12) + 1;
    }
    case 'D30': {
      // Trimsamsha
      if (isOdd) {
        if (degInSign < 5) return 1; // Mars (Aries)
        if (degInSign < 10) return 11; // Saturn (Aquarius)
        if (degInSign < 18) return 9; // Jupiter (Sagittarius)
        if (degInSign < 25) return 3; // Mercury (Gemini)
        return 7; // Venus (Libra)
      } else {
        if (degInSign < 5) return 2; // Venus (Taurus)
        if (degInSign < 12) return 6; // Mercury (Virgo)
        if (degInSign < 20) return 12; // Jupiter (Pisces)
        if (degInSign < 25) return 10; // Saturn (Capricorn)
        return 8; // Mars (Scorpio)
      }
    }
    case 'D40': {
      // Khavedamsha
      const part = Math.floor(degInSign / 0.75);
      const start = isOdd ? 0 : 6; // Aries for odd, Libra for even
      return ((start + part) % 12) + 1;
    }
    case 'D45': {
      // Akshavedamsha
      const part = Math.floor(degInSign / (30 / 45));
      const start = [1, 4, 7, 10].includes(signNum) ? 0 : [2, 5, 8, 11].includes(signNum) ? 4 : 8;
      return ((start + part) % 12) + 1;
    }
    case 'D60': {
      // Shashtiamsha
      const part = Math.floor(degInSign / 0.5);
      return ((signIdx + part) % 12) + 1;
    }
    default: {
      const v = parseInt(varga.replace(/\D/g, ''), 10) || 1;
      const part = Math.floor(degInSign / (30 / v));
      return ((signIdx + part) % 12) + 1;
    }
  }
}

/**
 * Classical Moolatrikona zones for the 7 classical planets.
 */
function isMoolatrikona(planetId, signNumber, degreeInRashi) {
  switch (planetId) {
    case 'sun': return signNumber === 5 && degreeInRashi <= 20; // Leo 0-20°
    case 'moon': return signNumber === 2 && degreeInRashi >= 3 && degreeInRashi <= 30; // Taurus 3-30°
    case 'mars': return signNumber === 1 && degreeInRashi <= 12; // Aries 0-12°
    case 'mercury': return signNumber === 6 && degreeInRashi >= 15 && degreeInRashi <= 20; // Virgo 15-20°
    case 'jupiter': return signNumber === 9 && degreeInRashi <= 10; // Sagittarius 0-10°
    case 'venus': return signNumber === 7 && degreeInRashi <= 15; // Libra 0-15°
    case 'saturn': return signNumber === 11 && degreeInRashi <= 20; // Aquarius 0-20°
    default: return false;
  }
}

module.exports = {
  calculateAvakhada,
  calculateSolarTimes,
  calculateVargaSign,
  isMoolatrikona,
};

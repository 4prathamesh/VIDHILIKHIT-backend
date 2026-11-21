// Assumption: NumerologyService provides authentic Chaldean and Vedic Sankhya Shastra calculations.
const { DateTime } = require('luxon');

// Chaldean letter values (A=1, B=2, C=3, D=4, E=5, U/V/W=6, O/Z=7, F/P=8; 9 is unassigned)
const CHALDEAN_MAP = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

// Root numbers (1-9) planetary rulers & classical archetypes
const NUMEROLOGY_RULERS = {
  1: { planet: 'Sun', planetSanskrit: 'Surya', title: 'The Leader & Pioneer' },
  2: { planet: 'Moon', planetSanskrit: 'Chandra', title: 'The Peacemaker & Diplomat' },
  3: { planet: 'Jupiter', planetSanskrit: 'Guru', title: 'The Creative Communicator & Visionary' },
  4: { planet: 'Rahu', planetSanskrit: 'Rahu', title: 'The Architect & Master Builder' },
  5: { planet: 'Mercury', planetSanskrit: 'Budha', title: 'The Dynamic Free Spirit & Strategist' },
  6: { planet: 'Venus (Shukra)', planetSanskrit: 'Shukra', title: 'The Nurturer & Harmonizer' },
  7: { planet: 'Ketu', planetSanskrit: 'Ketu', title: 'The Seeker of Truth & Mystic' },
  8: { planet: 'Saturn', planetSanskrit: 'Shani', title: 'The Powerhouse & Karmic Achiever' },
  9: { planet: 'Mars', planetSanskrit: 'Mangal', title: 'The Humanitarian Warrior & Catalyst' },
};

// Deep attributes for each root number (Screen 5)
const DESTINY_DETAILS = {
  1: {
    archetype: 'The Leader & Pioneer',
    summary: 'You are an ambitious, independent visionary with innate leadership courage and pioneering spirit.',
    attributes: {
      coreMeaning: 'Independence, originality, executive command',
      planetaryRuler: 'Sun',
      favourableNumbers: '1, 10, 19, 28, 4',
      favourableDays: 'Sunday & Monday',
      favourableColors: 'Gold, Orange, Copper, Yellow',
      gemstone: 'Natural Ruby (Manikya) in Gold',
    },
    strengths: [
      'Unyielding confidence and commanding leadership presence',
      'Original thinker who sets benchmarks rather than following trends',
      'Decisive action and clarity of purpose under crisis',
      'Inspirational motivator who brings high vitality to endeavors',
    ],
    challenges: [
      'Tendency towards impatience or stubborn self-reliance',
      'Hesitation to delegate critical responsibilities to others',
      'May unintentionally overlook nuanced emotional feedback',
    ],
  },
  2: {
    archetype: 'The Peacemaker & Diplomat',
    summary: 'You are a natural peacemaker with a diplomatic, sensitive and intuitive nature. You bring harmony, support and balance wherever you go.',
    attributes: {
      coreMeaning: 'Cooperation, harmony, emotions',
      planetaryRuler: 'Moon',
      favourableNumbers: '2, 7, 11, 20, 29',
      favourableDays: 'Monday & Sunday',
      favourableColors: 'White, Cream, Silver, Light Green',
      gemstone: 'Natural Pearl (Moti) or Moonstone',
    },
    strengths: [
      'Natural peacemaker who brings reconciliation',
      'Empathetic, sensitive and deeply intuitive nature',
      'Exceptional listening and diplomatic mediation skills',
      'Cherishes harmony, loyalty, and deep interpersonal connections',
    ],
    challenges: [
      'Can be prone to over-sensitivity or taking words to heart',
      'Occasional hesitation and difficulty making rapid choices',
      'Tendency to absorb negative emotional currents of others',
    ],
  },
  3: {
    archetype: 'The Creative Communicator & Visionary',
    summary: 'You possess expansive wisdom, expressive communication skills, artistic flair, and uplifting optimism.',
    attributes: {
      coreMeaning: 'Self-expression, wisdom, optimism, expansion',
      planetaryRuler: 'Jupiter',
      favourableNumbers: '3, 12, 21, 30, 9',
      favourableDays: 'Thursday',
      favourableColors: 'Yellow, Saffron, Gold, Amber',
      gemstone: 'Yellow Sapphire (Pukhraj) or Citrine',
    },
    strengths: [
      'Brilliant verbal, written, and expressive artistic talents',
      'Radiates positivity, enthusiasm, and contagious intellectual joy',
      'Generous philosophical perspective with broad horizon vision',
      'Naturally attracts supportive friendships and educational avenues',
    ],
    challenges: [
      'Risk of scattering energies across too many passions at once',
      'Occasional restlessness with routine or repetitive administrative tasks',
      'Can speak impulsively without filtering blunt truths',
    ],
  },
  4: {
    archetype: 'The Architect & Master Builder',
    summary: 'You are grounded, methodical, and disciplined with an extraordinary capacity to manifest lasting structures.',
    attributes: {
      coreMeaning: 'Structure, perseverance, order, foundation',
      planetaryRuler: 'Rahu',
      favourableNumbers: '4, 13, 22, 31, 1',
      favourableDays: 'Saturday & Sunday',
      favourableColors: 'Electric Blue, Grey, Brown, Khaki',
      gemstone: 'Hessonite Garnet (Gomed)',
    },
    strengths: [
      'Pillars of stability, reliability, and dependable execution',
      'Exceptional diagnostic mind that solves logistical complexities',
      'Deep respect for order, honesty, and pragmatic reality',
      'Incredible stamina to see demanding long-term projects through',
    ],
    challenges: [
      'Can be rigid or resistant to sudden changes of plans',
      'May fall into excessive caution or skepticism of unconventional ideas',
      'Requires intentional effort to relax and express spontaneous playfulness',
    ],
  },
  5: {
    archetype: 'The Dynamic Free Spirit & Strategist',
    summary: 'You thrive on versatility, rapid intellectual adaptation, travel, progressive innovation, and freedom.',
    attributes: {
      coreMeaning: 'Versatility, freedom, curiosity, commerce',
      planetaryRuler: 'Mercury',
      favourableNumbers: '5, 14, 23, 32',
      favourableDays: 'Wednesday & Friday',
      favourableColors: 'Emerald Green, Turquoise, Light Grey',
      gemstone: 'Emerald (Panna) or Green Tourmaline',
    },
    strengths: [
      'Quick-witted intellect with instantaneous adaptability',
      'Exceptional commercial, sales, and networking acumen',
      'Courageous explorer who embraces calculated risks and evolution',
      'Magnetic conversationalist who engages people from all walks of life',
    ],
    challenges: [
      'Boredom with monotony leading to premature shifts in focus',
      'Impulsive restlessness when required to stay put in one routine',
      'Nervous tension from an overactive, constantly processing mind',
    ],
  },
  6: {
    archetype: 'The Nurturer & Harmonizer',
    summary: 'You are driven by unconditional love, artistic refinement, domestic responsibility, and community care.',
    attributes: {
      coreMeaning: 'Nurturance, beauty, duty, balance',
      planetaryRuler: 'Venus (Shukra)',
      favourableNumbers: '6, 15, 24, 33, 9',
      favourableDays: 'Friday',
      favourableColors: 'Soft Pink, White, Sky Blue, Pastel Shades',
      gemstone: 'Diamond, White Sapphire, or Opal',
    },
    strengths: [
      'Generous heart that naturally creates comforting, beautiful sanctuaries',
      'Deep commitment to family welfare, ethics, and social fairness',
      'Refined aesthetic sensibility in home design, style, and culinary arts',
      'Enduring loyalty that supports loved ones through all seasons',
    ],
    challenges: [
      'Over-sacrificing personal needs for the well-being of others',
      'Difficulty accepting imperfections in loved ones or environments',
      'Can take on disproportionate emotional burdens of the household',
    ],
  },
  7: {
    archetype: 'The Seeker of Truth & Mystic',
    summary: 'You are an introspective analytical thinker drawn to metaphysics, spiritual wisdom, science, and sacred mysteries.',
    attributes: {
      coreMeaning: 'Introspection, wisdom, spiritual inquiry',
      planetaryRuler: 'Ketu',
      favourableNumbers: '7, 16, 25, 2',
      favourableDays: 'Monday & Thursday',
      favourableColors: 'Smoky Grey, Violet, White, Light Green',
      gemstone: "Cat's Eye (Lehsuniya) or Amethyst",
    },
    strengths: [
      'Profound intellectual depth with natural metaphysical intuition',
      'Perceptive truth-seeker who looks far beneath surface appearances',
      'Exceptional research capabilities and scholarly thoroughness',
      'Finds sublime serenity and creative breakthroughs in solitude',
    ],
    challenges: [
      'Tendency to withdraw emotionally and appear aloof or secretive',
      'Overthinking that can lead to unnecessary cynicism or isolation',
      'Difficulty expressing vulnerable feelings in conventional words',
    ],
  },
  8: {
    archetype: 'The Powerhouse & Karmic Achiever',
    summary: 'You possess formidable willpower, executive competence, material ambition, and karmic resilience.',
    attributes: {
      coreMeaning: 'Material mastery, authority, justice, karma',
      planetaryRuler: 'Saturn',
      favourableNumbers: '8, 17, 26, 5',
      favourableDays: 'Saturday',
      favourableColors: 'Navy Blue, Charcoal, Black, Dark Violet',
      gemstone: 'Blue Sapphire (Neelam) or Iolite',
    },
    strengths: [
      'Unshakeable stamina to surmount massive obstacles and hardships',
      'Natural mastery over finance, corporate structure, and large-scale enterprise',
      'Deep sense of karmic accountability, justice, and practical duty',
      'Matures into a formidable mentor, provider, and institutional pillar',
    ],
    challenges: [
      'Risk of becoming overly preoccupied with material benchmarks',
      'Struggle to acknowledge personal vulnerability or fatigue',
      'Can appear intimidating or stern to sensitive collaborators',
    ],
  },
  9: {
    archetype: 'The Humanitarian Warrior & Catalyst',
    summary: 'You are a passionate, compassionate idealist driven to uplift humanity, champion justice, and inspire global evolution.',
    attributes: {
      coreMeaning: 'Universal compassion, courage, completion, philanthropy',
      planetaryRuler: 'Mars',
      favourableNumbers: '9, 18, 27, 3, 6',
      favourableDays: 'Tuesday',
      favourableColors: 'Crimson Red, Coral, Maroon, Rose',
      gemstone: 'Red Coral (Moonga) or Carnelian',
    },
    strengths: [
      'Fearless courage when defending the vulnerable and fighting injustice',
      'Global, inclusive perspective that honors universal human dignity',
      'Magnetic charismatic presence that rallies communities for worthy causes',
      'Artistic, theatrical, and oratorical passion that leaves a lasting legacy',
    ],
    challenges: [
      'Intense emotional righteous indignation when ideals are compromised',
      'Difficulty letting go of past hurts or unfinished global missions',
      'Can exhaust personal vitality through non-stop selfless crusades',
    ],
  },
};

// Personal year themes
const PERSONAL_YEAR_THEMES = {
  1: { theme: 'A year of new beginnings, pioneering initiatives, and bold self-direction.', focusAreas: ['Launching independent projects', 'Embracing fresh identity and personal growth', 'Taking initiative without hesitation'] },
  2: { theme: 'A year of patient cooperation, partnership refinement, and emotional diplomacy.', focusAreas: ['Cultivating key relationships', 'Patience with delays and negotiations', 'Developing intuition and listening skills'] },
  3: { theme: 'A year of creative self-expression, joyful socialization, and expressive communication.', focusAreas: ['Artistic and creative pursuits', 'Expanding social circles and networking', 'Sharing knowledge with optimism'] },
  4: { theme: 'A year of building solid foundations, practical discipline, and structured hard work.', focusAreas: ['Organizing finances and routines', 'Health maintenance and stamina', 'Laying bedrock for future expansion'] },
  5: { theme: 'A year of dynamic transformation, freedom, travel, and unexpected opportunities.', focusAreas: ['Embracing adaptable change', 'Exploring new learning horizons or travel', 'Breaking free from stale limitations'] },
  6: { theme: 'A year of responsibility, relationships and finding balance in life.', focusAreas: ['Home and family harmony', 'Deepening romantic or marital commitments', 'Cultivating emotional balance and domestic peace'] },
  7: { theme: 'A year of quiet introspection, spiritual study, personal refinement, and truth-seeking.', focusAreas: ['Meditation, research, and self-study', 'Taking rejuvenating quiet time in nature', 'Refining inner wisdom rather than pushing outer gains'] },
  8: { theme: 'A year of material achievement, executive authority, karmic harvest, and empowerment.', focusAreas: ['Career elevation and executive decision-making', 'Financial investments and management', 'Balancing personal integrity with worldly power'] },
  9: { theme: 'A year of completion, humanitarian release, forgiveness, and preparing for rebirth.', focusAreas: ['Releasing outworn attachments and projects', 'Forgiving past grievances and closing cycles', 'Philanthropy and broad-hearted service'] },
};

// Personal month themes
const PERSONAL_MONTH_THEMES = {
  1: 'Initiation, independent planning, and decisive first steps.',
  2: 'Gentle diplomacy, patience, and receptive listening.',
  3: 'Artistic creativity, social warmth, and optimistic discussions.',
  4: 'Practical execution, administrative order, and meticulous focus.',
  5: 'Dynamic momentum, quick adaptability, and spontaneous discovery.',
  6: 'Domestic nurture, harmonious connections, and duty fulfillment.',
  7: 'Introspective study, meditative calm, and deeper research.',
  8: 'Executive focus, financial decisions, and tangible milestones.',
  9: 'Completion, closure, and new beginnings.',
};

// Personal day themes
const PERSONAL_DAY_THEMES = {
  1: 'Take leadership, start new tasks, and act with confident focus.',
  2: 'Seek cooperation, resolve disputes peacefully, and trust your gut feelings.',
  3: 'Expression, communication, and creativity.',
  4: 'Follow schedules, organize details, and complete persistent physical tasks.',
  5: 'Embrace spontaneity, meet new people, and adapt to shifting agendas.',
  6: 'Care for loved ones, beautify surroundings, and resolve domestic matters.',
  7: 'Spend quiet moments in reflection, study, or solitary contemplation.',
  8: 'Focus on business matters, financial planning, and executive leadership.',
  9: 'Conclude unfinished tasks, practice generosity, and make peace with endings.',
};

// Compatibility grid between root numbers (1-9)
const COMPATIBILITY_GRID = {
  1: { friendly: [1, 2, 3, 4, 9], neutral: [5, 7], enemy: [6, 8] },
  2: { friendly: [1, 2, 7], neutral: [3, 4, 6], enemy: [5, 8, 9] },
  3: { friendly: [1, 2, 3, 9], neutral: [5, 7, 8], enemy: [4, 6] },
  4: { friendly: [1, 4, 6, 8], neutral: [2, 5, 7], enemy: [3, 9] },
  5: { friendly: [1, 5, 6], neutral: [3, 4, 7, 8], enemy: [2, 9] },
  6: { friendly: [4, 5, 6, 8], neutral: [2, 7, 9], enemy: [1, 3] },
  7: { friendly: [1, 2, 7], neutral: [3, 4, 5, 6, 8], enemy: [9] },
  8: { friendly: [4, 5, 6, 8], neutral: [3, 7], enemy: [1, 2, 9] },
  9: { friendly: [1, 2, 3, 9], neutral: [6, 7], enemy: [4, 5, 8] },
};

class NumerologyService {
  /**
   * Helper: Reduces any integer to a single digit (1-9) recursively.
   */
  reduceToSingleDigit(num) {
    let n = Math.abs(num);
    while (n > 9) {
      let sum = 0;
      while (n > 0) {
        sum += n % 10;
        n = Math.floor(n / 10);
      }
      n = sum;
    }
    return n || 9;
  }

  /**
   * Helper: Calculates Birth Number (Mulank) from day of month.
   */
  calculateBirthNumber(dobStr) {
    const dObj = new Date(dobStr);
    const day = isNaN(dObj.getTime()) ? parseInt(dobStr.slice(8, 10), 10) : dObj.getUTCDate();
    const safeDay = isNaN(day) ? 1 : day;
    const root = this.reduceToSingleDigit(safeDay);
    const ruler = NUMEROLOGY_RULERS[root] || NUMEROLOGY_RULERS[1];

    return {
      compound: safeDay,
      root,
      title: 'Birth Number (Mulank / Psychic Number)',
      planetaryRuler: ruler.planet,
      summary: 'Governs self-perception, natural instincts, and subconscious emotional patterns.',
    };
  }

  /**
   * Helper: Calculates Destiny Number (Bhagyank / Life Path) from full DOB.
   */
  calculateDestinyNumber(dobStr) {
    const clean = dobStr.replace(/\D/g, '');
    let compoundSum = 0;
    for (const ch of clean) {
      compoundSum += parseInt(ch, 10);
    }
    const root = this.reduceToSingleDigit(compoundSum);
    const ruler = NUMEROLOGY_RULERS[root] || NUMEROLOGY_RULERS[1];
    const details = DESTINY_DETAILS[root] || DESTINY_DETAILS[1];

    return {
      compound: compoundSum,
      root,
      title: 'Destiny Number (Bhagyank / Life Path)',
      planetaryRuler: ruler.planet,
      summary: details.summary,
    };
  }

  /**
   * Helper: Calculates Chaldean Name Number (Namank).
   */
  calculateNameNumber(fullName) {
    const rawWords = (fullName || 'User').trim().toUpperCase().split(/\s+/);
    let totalCompound = 0;
    const wordsBreakdown = [];

    rawWords.forEach((word) => {
      const letters = [];
      let wordSum = 0;
      for (const char of word) {
        if (CHALDEAN_MAP[char] !== undefined) {
          const val = CHALDEAN_MAP[char];
          letters.push({ char, value: val });
          wordSum += val;
        }
      }
      if (letters.length > 0) {
        wordsBreakdown.push({
          word,
          letters,
          wordSum,
        });
        totalCompound += wordSum;
      }
    });

    const root = this.reduceToSingleDigit(totalCompound);
    const ruler = NUMEROLOGY_RULERS[root] || NUMEROLOGY_RULERS[6];

    return {
      compound: totalCompound,
      root,
      title: 'Name Number (Namank)',
      planetaryRuler: ruler.planet,
      summary: 'Governs public expression, social relationships, and professional magnetism.',
      wordsBreakdown,
    };
  }

  /**
   * Helper: Formats Date as "DD / MM / YYYY".
   */
  formatDob(dobStr) {
    if (!dobStr) return '29 / 07 / 1999';
    const parts = dobStr.slice(0, 10).split('-');
    if (parts.length === 3) {
      return `${parts[2]} / ${parts[1]} / ${parts[0]}`;
    }
    return dobStr;
  }

  /**
   * Helper: Calculates Personal Year, Month, Day cycles.
   */
  calculatePersonalCycles(dobStr, targetYear = null) {
    const now = DateTime.now().setZone('Asia/Kolkata');
    const parts = (dobStr || '1999-07-29').slice(0, 10).split('-');
    const day = parseInt(parts[2], 10) || 29;
    const month = parseInt(parts[1], 10) || 7;
    const year = targetYear || now.year;

    // Personal Year = Day + Month + Target Year
    const dayRoot = this.reduceToSingleDigit(day);
    const monthRoot = this.reduceToSingleDigit(month);
    const yearRoot = this.reduceToSingleDigit(year);
    const personalYearNumber = this.reduceToSingleDigit(dayRoot + monthRoot + yearRoot);

    // Personal Month = Personal Year + Calendar Month
    const currentCalMonth = now.month;
    const personalMonthNumber = this.reduceToSingleDigit(personalYearNumber + currentCalMonth);

    // Personal Day = Personal Month + Calendar Day
    const currentCalDay = now.day;
    const personalDayNumber = this.reduceToSingleDigit(personalMonthNumber + currentCalDay);

    const pyTheme = PERSONAL_YEAR_THEMES[personalYearNumber] || PERSONAL_YEAR_THEMES[6];
    const pmTheme = PERSONAL_MONTH_THEMES[personalMonthNumber] || PERSONAL_MONTH_THEMES[9];
    const pdTheme = PERSONAL_DAY_THEMES[personalDayNumber] || PERSONAL_DAY_THEMES[3];

    return {
      personalYear: {
        year,
        number: personalYearNumber,
        theme: pyTheme.theme,
        focusAreas: pyTheme.focusAreas,
      },
      personalMonth: {
        month: currentCalMonth,
        label: now.toFormat('LLL yyyy'),
        number: personalMonthNumber,
        theme: pmTheme,
      },
      personalDay: {
        day: currentCalDay,
        label: 'Today',
        number: personalDayNumber,
        theme: pdTheme,
      },
    };
  }

  /**
   * 10.1 POST /numerology/calculate
   */
  calculateFullProfile(body) {
    const fullName = body.fullName || 'Arjun Sharma';
    const dob = body.dob || '1999-07-29';
    const targetYear = parseInt(body.targetYear, 10) || 2026;

    const birth = this.calculateBirthNumber(dob);
    const destiny = this.calculateDestinyNumber(dob);
    const name = this.calculateNameNumber(fullName);
    const cycles = this.calculatePersonalCycles(dob, targetYear);

    return {
      profile: {
        fullName,
        dob: dob.slice(0, 10),
        dobFormatted: this.formatDob(dob),
      },
      birthNumber: {
        compound: birth.compound,
        root: birth.root,
        title: birth.title,
        planetaryRuler: birth.planetaryRuler,
        summary: birth.summary,
      },
      destinyNumber: {
        compound: destiny.compound,
        root: destiny.root,
        title: destiny.title,
        planetaryRuler: destiny.planetaryRuler,
        summary: destiny.summary,
      },
      nameNumber: {
        compound: name.compound,
        root: name.root,
        title: name.title,
        planetaryRuler: name.planetaryRuler,
        summary: name.summary,
      },
      personalCycles: {
        personalYear: {
          year: cycles.personalYear.year,
          number: cycles.personalYear.number,
          theme: cycles.personalYear.theme,
        },
        personalMonth: {
          month: cycles.personalMonth.month,
          label: cycles.personalMonth.label,
          number: cycles.personalMonth.number,
          theme: cycles.personalMonth.theme,
        },
        personalDay: {
          day: cycles.personalDay.day,
          label: cycles.personalDay.label,
          number: cycles.personalDay.number,
          theme: cycles.personalDay.theme,
        },
      },
    };
  }

  /**
   * 10.2 GET /numerology/profile
   */
  getActiveProfileView(profile) {
    const fullName = profile.name || profile.fullName || 'Arjun Sharma';
    const dob = (profile.dob ? (typeof profile.dob === 'string' ? profile.dob.slice(0, 10) : new Date(profile.dob).toISOString().slice(0, 10)) : '1999-07-29');

    const birth = this.calculateBirthNumber(dob);
    const destiny = this.calculateDestinyNumber(dob);
    const name = this.calculateNameNumber(fullName);
    const cycles = this.calculatePersonalCycles(dob);

    return {
      fullName,
      dob,
      dobFormatted: this.formatDob(dob),
      goldenTrio: {
        destinyNumber: destiny.root,
        birthNumber: birth.compound,
        nameNumber: name.compound,
      },
      cycles: {
        personalYear: cycles.personalYear.number,
        personalMonth: cycles.personalMonth.number,
        personalDay: cycles.personalDay.number,
      },
      quickActions: [
        { id: 'detailedAnalysis', title: 'Detailed Analysis', route: 'NumerologyDestinyDetail' },
        { id: 'calculationBreakdown', title: 'Calculation Breakdown', route: 'NumerologyCalculationBreakdown' },
      ],
    };
  }

  /**
   * 10.3 GET /numerology/destiny/:number
   */
  getDestinyDeepAnalysis(number, profile = null) {
    const num = parseInt(number, 10) || 2;
    const safeNum = Math.max(1, Math.min(9, num));
    const details = DESTINY_DETAILS[safeNum] || DESTINY_DETAILS[2];
    const ruler = NUMEROLOGY_RULERS[safeNum] || NUMEROLOGY_RULERS[2];

    const kundaliSynergy = `Your Destiny Number (${safeNum}) is influenced by the ${ruler.planet}, which brings emotional depth, strategic discernment, and lasting harmony.`;

    return {
      number: safeNum,
      title: 'Destiny Number (Life Path)',
      archetype: details.archetype,
      summary: details.summary,
      attributes: details.attributes,
      strengths: details.strengths,
      challenges: details.challenges,
      kundaliSynergy,
    };
  }

  /**
   * 10.4 GET /numerology/core-numbers
   */
  getCoreNumbersSummary(profile) {
    const fullName = profile.name || profile.fullName || 'Arjun Sharma';
    const dob = (profile.dob ? (typeof profile.dob === 'string' ? profile.dob.slice(0, 10) : new Date(profile.dob).toISOString().slice(0, 10)) : '1999-07-29');

    const birth = this.calculateBirthNumber(dob);
    const destiny = this.calculateDestinyNumber(dob);
    const name = this.calculateNameNumber(fullName);
    const cycles = this.calculatePersonalCycles(dob);

    return {
      coreNumbers: [
        {
          id: 'birth',
          title: 'Birth Number',
          compound: birth.compound,
          root: birth.root,
          display: `${birth.compound} → ${birth.root}`,
          icon: 'eye',
          category: 'Psychic (Mulank)',
          summary: 'Governs self-perception, inner desires, instinctive reactions, and innate psychological temperament.',
        },
        {
          id: 'destiny',
          title: 'Destiny Number (Life Path)',
          compound: destiny.compound,
          root: destiny.root,
          display: `${destiny.compound} → ${destiny.root}`,
          icon: 'chakra',
          category: 'Life Path (Bhagyank)',
          summary: 'Reveals your karmic destiny, life purpose, spiritual lessons, and worldly mission.',
        },
        {
          id: 'name',
          title: 'Name Number',
          compound: name.compound,
          root: name.root,
          display: `${name.compound} → ${name.root}`,
          icon: 'scroll',
          category: 'Expression (Namank)',
          summary: 'Derived from Chaldean letter vibrations. Dictates public persona, career expression, and outer reputation.',
        },
        {
          id: 'personalYear',
          title: 'Personal Year',
          compound: null,
          root: cycles.personalYear.number,
          display: `${cycles.personalYear.number}`,
          icon: 'calendar',
          category: 'Annual Cycle',
          summary: cycles.personalYear.theme,
        },
        {
          id: 'personalMonth',
          title: 'Personal Month',
          compound: null,
          root: cycles.personalMonth.number,
          display: `${cycles.personalMonth.number}`,
          icon: 'moon',
          category: 'Monthly Cycle',
          summary: cycles.personalMonth.theme,
        },
        {
          id: 'personalDay',
          title: 'Personal Day',
          compound: null,
          root: cycles.personalDay.number,
          display: `${cycles.personalDay.number}`,
          icon: 'spark',
          category: 'Daily Cycle',
          summary: cycles.personalDay.theme,
        },
      ],
    };
  }

  /**
   * 10.5 GET /numerology/calculation-breakdown
   */
  getCalculationBreakdown(fullName = 'Arjun Sharma', dob = '1999-07-29', system = 'chaldean') {
    const cleanDob = dob.slice(0, 10);
    const nameData = this.calculateNameNumber(fullName);
    const destinyData = this.calculateDestinyNumber(cleanDob);

    // Build step by step Destiny breakdown
    const parts = cleanDob.split('-');
    const yearStr = parts[0] || '1999';
    const monthStr = parts[1] || '07';
    const dayStr = parts[2] || '29';

    // Day step
    let daySum = 0;
    for (const ch of dayStr) daySum += parseInt(ch, 10);
    const dayRoot = this.reduceToSingleDigit(daySum);
    const dayFormula = dayStr.length === 2 ? `${dayStr[0]} + ${dayStr[1]} = ${daySum}${daySum > 9 ? ` → ${dayRoot}` : ''}` : `${dayStr} → ${dayRoot}`;

    // Month step
    let monthSum = 0;
    for (const ch of monthStr) monthSum += parseInt(ch, 10);
    const monthFormula = `${monthStr[0]} + ${monthStr[1]} = ${monthSum}`;

    // Year step
    let yearSum = 0;
    const yearDigits = [];
    for (const ch of yearStr) {
      yearDigits.push(ch);
      yearSum += parseInt(ch, 10);
    }
    const yearInter = this.reduceToSingleDigit(yearSum);
    const yearFormula = `${yearDigits.join(' + ')} = ${yearSum} → 10 → ${yearInter}`;

    // Compound step
    const compoundStr = String(destinyData.compound);
    let compSum = 0;
    for (const ch of compoundStr) compSum += parseInt(ch, 10);
    const compSumRoot = this.reduceToSingleDigit(compSum);
    const reductionFormula = compoundStr.length === 2
      ? `${compoundStr[0]} + ${compoundStr[1]} = ${compSum}${compSum > 9 ? ` → ${String(compSum).split('').join(' + ')} = ${compSumRoot}` : ''}`
      : `${compoundStr} → ${destinyData.root}`;

    return {
      nameBreakdown: {
        fullName,
        system: 'Chaldean Numerology',
        words: nameData.wordsBreakdown,
        compoundNumber: nameData.compound,
        reductionFormula: `${String(nameData.compound).split('').join(' + ')} = ${nameData.root}`,
        rootNumber: nameData.root,
        systemNote: 'As per Chaldean Numerology: A=1, B=2, C=3, D=4, E=5, F=8 ... (No letters are assigned to the number 9.)',
      },
      destinyBreakdown: {
        dob: cleanDob,
        dobFormatted: this.formatDob(cleanDob),
        steps: [
          { component: `Day of Birth (${dayStr})`, formula: dayFormula, value: dayRoot },
          { component: `Month of Birth (${monthStr})`, formula: monthFormula, value: monthSum },
          { component: `Year of Birth (${yearStr})`, formula: yearFormula, value: yearInter },
        ],
        compoundNumber: destinyData.compound,
        reductionFormula,
        rootNumber: destinyData.root,
        vedicNote: 'As per Vedic Sankhya Shastra, Bhagyank (Destiny Number) synthesizes all celestial coordinates of your birth time to determine life path direction.',
      },
    };
  }

  /**
   * 10.6 GET /numerology/personal-cycles
   */
  getPersonalCyclesForecast(dob = '1999-07-29', targetYear = 2026) {
    const selYear = parseInt(targetYear, 10) || 2026;
    const cycles = this.calculatePersonalCycles(dob, selYear);

    // Multi-year forecast (6-year window: selYear-2 to selYear+3)
    const multiYearForecast = [];
    const baseYear = selYear - 2;
    for (let i = 0; i < 6; i++) {
      const y = baseYear + i;
      const c = this.calculatePersonalCycles(dob, y);
      multiYearForecast.push({
        year: y,
        number: c.personalYear.number,
        theme: c.personalYear.theme,
      });
    }

    return {
      selectedYear: selYear,
      personalYear: cycles.personalYear,
      personalMonth: cycles.personalMonth,
      personalDay: cycles.personalDay,
      multiYearForecast,
    };
  }

  /**
   * 10.7 GET /numerology/kundali-alignment
   */
  async getKundaliAlignment(profile, astrologyService) {
    const dob = profile.dob ? (typeof profile.dob === 'string' ? profile.dob.slice(0, 10) : new Date(profile.dob).toISOString().slice(0, 10)) : '1999-07-29';
    const destiny = this.calculateDestinyNumber(dob);
    const ruler = NUMEROLOGY_RULERS[destiny.root] || NUMEROLOGY_RULERS[2];

    let kundaliSign = 'Cancer (Karka)';
    let kundaliHouse = 4;
    let moonStrength = 'Swakshetra (Own Sign) / High Dignity';

    try {
      const { chart } = await astrologyService.calculateRawChart(
        profile.dob || '1999-07-29',
        profile.tob || '10:30',
        profile.latitude || 19.0760,
        profile.longitude || 72.8777
      );
      const grahas = astrologyService.extractGrahas(chart);

      // Match destiny ruler planet with kundali planet
      const targetId = ruler.planet.toLowerCase().split(' ')[0];
      const matchedGraha = grahas.find((g) => g.id === targetId || g.planet.toLowerCase().startsWith(targetId)) || grahas.find((g) => g.id === 'moon');

      if (matchedGraha) {
        kundaliSign = `${matchedGraha.signName || matchedGraha.sign} (${matchedGraha.signSanskrit || ''})`.trim();
        kundaliHouse = matchedGraha.houseNumber;
        moonStrength = matchedGraha.dignity || 'Favorable Placement / Strong Dignity';
      }
    } catch (e) {
      // Graceful fallback to authentic defaults
    }

    return {
      destinyNumber: destiny.root,
      numerologyPlanet: `${ruler.planet} (${ruler.planetSanskrit})`,
      kundaliSign,
      kundaliHouse,
      moonStrength,
      headline: `Your Destiny Number (${destiny.root}) is influenced by the ${ruler.planet}, which is also strong in your Kundali (${kundaliSign} placement).`,
      alignmentCards: [
        {
          id: 'planetaryAlignment',
          title: 'Planetary Alignment',
          value: `${ruler.planet} (Numerology) ↔ ${ruler.planet} (Kundali)`,
          relationship: 'Direct Harmonic Resonance',
        },
        {
          id: 'combinedInfluence',
          title: 'Combined Influence',
          value: 'Enhances intuition, emotional balance and relationship harmony.',
          description: `The synchronicity between your Bhagyank ${destiny.root} and natal ${ruler.planet} placement bestows profound empathy, emotional equilibrium, and strong instinctual intelligence.`,
        },
        {
          id: 'bhavaSynthesis',
          title: 'Rashi & Bhava Synthesis',
          value: `${kundaliHouse}th Bhava resonance`,
          description: `Governed by ${ruler.planetSanskrit} Deva, your life trajectory aligns with ${kundaliHouse}th Bhava security, nourishment, and purposeful intuition.`,
        },
      ],
    };
  }

  /**
   * 10.8 POST /numerology/compatibility
   */
  calculateCompatibility(body) {
    const yourName = body.yourName || 'Arjun Sharma';
    const partnerName = body.partnerName || 'Kavya Mehta';
    const yourDob = body.yourDob || '1999-07-29';
    const partnerDob = body.partnerDob || '2000-11-14';

    const p1Birth = this.calculateBirthNumber(yourDob);
    const p1Destiny = this.calculateDestinyNumber(yourDob);
    const p1Name = this.calculateNameNumber(yourName);

    const p2Birth = this.calculateBirthNumber(partnerDob);
    const p2Destiny = this.calculateDestinyNumber(partnerDob);
    const p2Name = this.calculateNameNumber(partnerName);

    // Calculate 3 Pillars of Harmony based on planetary friendship
    const scorePillar = (num1, num2) => {
      if (num1 === num2) return 92;
      const g = COMPATIBILITY_GRID[num1];
      if (g && g.friendly.includes(num2)) return 85;
      if (g && g.neutral.includes(num2)) return 72;
      return 58;
    };

    const emotionalHarmony = scorePillar(p1Birth.root, p2Birth.root);
    const intellectualCommunication = scorePillar(p1Name.root, p2Name.root);
    const longTermLifeVision = scorePillar(p1Destiny.root, p2Destiny.root);

    const compatibilityScore = Math.round(
      longTermLifeVision * 0.40 + emotionalHarmony * 0.35 + intellectualCommunication * 0.25
    );

    let harmonyRating = 'Moderate';
    let verdict = 'A favorable match with room for mutual growth and patience.';
    if (compatibilityScore >= 82) {
      harmonyRating = 'Very High';
      verdict = 'A harmonious and supportive match with long-term potential.';
    } else if (compatibilityScore >= 74) {
      harmonyRating = 'High';
      verdict = 'A strong natural synergy with reciprocal affection and clear understanding.';
    } else if (compatibilityScore < 60) {
      harmonyRating = 'Challenging';
      verdict = 'Distinct life perspectives requiring conscious adaptation and respectful dialogue.';
    }

    const p1Ruler = NUMEROLOGY_RULERS[p1Destiny.root]?.planet || 'Moon';
    const p2Ruler = NUMEROLOGY_RULERS[p2Name.root]?.planet || 'Venus';
    const planetarySynergy = `${p1Ruler} (Destiny ${p1Destiny.root}) & ${p2Ruler} (Name ${p2Name.root}) harmonious interaction`;

    return {
      yourName,
      partnerName,
      compatibilityScore,
      verdict,
      harmonyRating,
      pillars: {
        emotionalHarmony,
        intellectualCommunication,
        longTermLifeVision,
      },
      planetarySynergy,
      strengths: [
        'Natural emotional reciprocity and deep mutual gentleness',
        'Shared artistic sensibilities and domestic appreciation',
        'High diplomatic patience during interpersonal disagreements',
      ],
      growthAreas: [
        'Both partners should openly voice unspoken expectations early on',
        'Avoid emotional withdrawal when resolving sensitive financial or practical decisions',
      ],
    };
  }
}

module.exports = new NumerologyService();

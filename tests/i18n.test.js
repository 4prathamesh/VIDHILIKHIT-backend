// Test suite for 12 Indian Languages + English Multilingual API Support
const { test, describe } = require('node:test');
const assert = require('node:assert');
const i18n = require('../src/i18n');
const i18nMiddleware = require('../src/middlewares/i18n.middleware');
const i18nController = require('../src/controllers/i18n.controller');
const numerologyController = require('../src/controllers/numerology.controller');

function createMockReqRes({ query = {}, headers = {}, body = null, url = '/api/v1/test' }) {
  const req = {
    query,
    headers,
    body,
    url,
    originalUrl: url,
  };
  let responseData = null;
  let statusCode = 200;
  const resHeaders = {};

  const res = {
    setHeader(name, value) {
      resHeaders[name.toLowerCase()] = value;
      return res;
    },
    status(code) {
      statusCode = code;
      return res;
    },
    json(payload) {
      responseData = payload;
      return res;
    },
    send(payload) {
      responseData = payload;
      return res;
    },
    getHeaders() {
      return resHeaders;
    },
    getResponseData() {
      return responseData;
    },
    getStatusCode() {
      return statusCode;
    },
  };

  return { req, res };
}

describe('Multilingual i18n API Suite (12 Indian Languages + English)', () => {
  test('1. GET /api/v1/i18n/languages lists all 12 requested Indian languages + English', async () => {
    const { req, res } = createMockReqRes({ url: '/api/v1/i18n/languages' });
    i18nMiddleware(req, res, () => {});
    i18nController.getLanguages(req, res, (err) => {
      if (err) throw err;
    });

    const body = res.getResponseData();
    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.languages.length, 13);

    const codes = body.data.languages.map((l) => l.code);
    const expectedCodes = ['mr', 'hi', 'gu', 'bn', 'ta', 'te', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'en'];
    for (const c of expectedCodes) {
      assert.ok(codes.includes(c), `Expected language code ${c} to be supported`);
    }

    // Verify Urdu direction is rtl and appName is مُقَدَّر
    const urdu = body.data.languages.find((l) => l.code === 'ur');
    assert.strictEqual(urdu.direction, 'rtl');
    assert.strictEqual(urdu.appName, 'مُقَدَّر');

    // Verify Marathi appName is विधिलिखित
    const marathi = body.data.languages.find((l) => l.code === 'mr');
    assert.strictEqual(marathi.appName, 'विधिलिखित');
    assert.strictEqual(marathi.nativeName, 'मराठी');
  });

  test('2. GET /api/v1/i18n/translations returns full translation catalog for requested language', async () => {
    const { req, res } = createMockReqRes({
      url: '/api/v1/i18n/translations?lang=mr',
      query: { lang: 'mr' },
    });
    i18nMiddleware(req, res, () => {});
    i18nController.getTranslations(req, res, (err) => {
      if (err) throw err;
    });

    const body = res.getResponseData();
    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(body.data.language, 'mr');
    assert.strictEqual(body.data.meta.appName, 'विधिलिखित');
    assert.strictEqual(body.data.grahas.Sun, 'सूर्य (Surya)');
    assert.strictEqual(body.data.rashis.Aries, 'मेष (Aries)');
    assert.strictEqual(body.data.numerology.mulank, 'मूलांक (जन्मतारीख अंक)');
  });

  test('3. Query Parameter ?lang=mr localizes response message and payload in Marathi', async () => {
    const { req, res } = createMockReqRes({
      url: '/api/v1/numerology/calculate?lang=mr',
      query: { lang: 'mr' },
      body: { fullName: 'Aarav Sharma', dob: '1995-03-15' },
    });

    i18nMiddleware(req, res, () => {});
    await numerologyController.calculateProfile(req, res, (err) => {
      if (err) throw err;
    });

    const body = res.getResponseData();
    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(res.getHeaders()['content-language'], 'mr');
    assert.strictEqual(body.message, 'अंकशास्त्र गणना यशस्वीरीत्या पूर्ण झाली');
    assert.strictEqual(body.language, 'mr');
    assert.ok(body.data.birthNumber.localizedTitle.includes('मूलांक'));
  });

  test('4. Header Accept-Language: hi localizes response message in Hindi', async () => {
    const { req, res } = createMockReqRes({
      url: '/api/v1/numerology/calculate',
      headers: { 'accept-language': 'hi' },
      body: { fullName: 'Rohit Verma', dob: '1990-10-24' },
    });

    i18nMiddleware(req, res, () => {});
    await numerologyController.calculateProfile(req, res, (err) => {
      if (err) throw err;
    });

    const body = res.getResponseData();
    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(res.getHeaders()['content-language'], 'hi');
    assert.strictEqual(body.message, 'अंकशास्त्र गणना सफलतापूर्वक पूरी हुई');
    assert.strictEqual(body.language, 'hi');
    assert.ok(body.data.destinyNumber.localizedPlanet.includes('सूर्य') || body.data.destinyNumber.localizedTitle.includes('भाग्यांक'));
  });

  test('5. Verify all 12 Indian languages return localized messages and content-language headers', async () => {
    const langChecks = [
      { code: 'gu', expectedMsg: 'અંકશાસ્ત્ર ગણતરી સફળતાપૂર્વક પૂર્ણ થઈ' },
      { code: 'bn', expectedMsg: 'সংখ্যাতত্ত্ব গণনা সফলভাবে সম্পন্ন হয়েছে' },
      { code: 'ta', expectedMsg: 'எண் கணிதம் வெற்றிகரமாக கணக்கிடப்பட்டது' },
      { code: 'te', expectedMsg: 'సంఖ్యాశాస్త్ర గణన విజయవంతంగా పూర్తయింది' },
      { code: 'kn', expectedMsg: 'ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಲೆಕ್ಕಾಚಾರ ಯಶಸ್ವಿಯಾಗಿ ಮುಗಿದಿದೆ' },
      { code: 'ml', expectedMsg: 'സംഖ്യാശാസ്ത്ര ഗണനം പൂർത്തിയായി' },
      { code: 'pa', expectedMsg: 'ਅੰਕ ਵਿਗਿਆਨ ਗਣਨਾ ਸਫਲਤਾਪੂਰਵਕ ਮੁਕੰਮਲ ਹੋਈ' },
      { code: 'or', expectedMsg: 'ସଂଖ୍ୟାତତ୍ତ୍ୱ ଗଣନା ସଫଳତାର ସହ ସମ୍ପୂର୍ଣ୍ଣ ହେଲା' },
      { code: 'as', expectedMsg: 'সংখ্যাতত্ত্ব গণনা সফলতাৰে সম্পূৰ্ণ হ\'ল' },
      { code: 'ur', expectedMsg: 'علم الاعداد کا حساب کامیابی سے مکمل ہوا' },
    ];

    for (const item of langChecks) {
      const { req, res } = createMockReqRes({
        url: `/api/v1/numerology/calculate?lang=${item.code}`,
        query: { lang: item.code },
        body: { fullName: 'Pooja Patil', dob: '1998-05-12' },
      });

      i18nMiddleware(req, res, () => {});
      await numerologyController.calculateProfile(req, res, (err) => {
        if (err) throw err;
      });

      const body = res.getResponseData();
      assert.strictEqual(res.getStatusCode(), 200);
      assert.strictEqual(res.getHeaders()['content-language'], item.code);
      assert.strictEqual(body.message, item.expectedMsg, `Mismatch for ${item.code}`);
      assert.strictEqual(body.language, item.code);
    }
  });

  test('6. Request Body language: "ta" overrides default and returns Tamil', async () => {
    const { req, res } = createMockReqRes({
      url: '/api/v1/numerology/calculate',
      body: { fullName: 'Suresh Kumar', dob: '1992-08-15', language: 'ta' },
    });

    i18nMiddleware(req, res, () => {});
    await numerologyController.calculateProfile(req, res, (err) => {
      if (err) throw err;
    });

    const body = res.getResponseData();
    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(res.getHeaders()['content-language'], 'ta');
    assert.strictEqual(body.message, 'எண் கணிதம் வெற்றிகரமாக கணக்கிடப்பட்டது');
    assert.strictEqual(body.language, 'ta');
  });

  test('7. Default without language parameters cleanly falls back to English', async () => {
    const { req, res } = createMockReqRes({
      url: '/api/v1/numerology/calculate',
      body: { fullName: 'Arjun Sharma', dob: '1999-07-29' },
    });

    i18nMiddleware(req, res, () => {});
    await numerologyController.calculateProfile(req, res, (err) => {
      if (err) throw err;
    });

    const body = res.getResponseData();
    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(res.getHeaders()['content-language'], 'en');
    assert.strictEqual(body.message, 'Numerology calculated successfully');
    assert.strictEqual(body.language, undefined); // Untouched clean envelope for English
  });

  test('8. Kundali Grahas & Bhavas localization', async () => {
    const mockGrahasData = {
      grahas: [
        { planet: 'Sun', sign: 'Aries', house: 1, nakshatra: 'Ashwini', signLord: 'Mars' },
        { planet: 'Moon', sign: 'Taurus', house: 2, nakshatra: 'Rohini', signLord: 'Venus' },
      ],
      bhavas: [
        { house: 1, sign: 'Aries', signLord: 'Mars' },
        { house: 2, sign: 'Taurus', signLord: 'Venus' },
      ],
    };

    const localizedMr = i18n.localizeKundali(mockGrahasData, 'mr');
    assert.strictEqual(localizedMr.grahas[0].localizedPlanet, 'सूर्य (Surya)');
    assert.strictEqual(localizedMr.grahas[0].localizedSign, 'मेष (Aries)');
    assert.strictEqual(localizedMr.grahas[0].localizedNakshatra, 'अश्विनी');
    assert.ok(localizedMr.grahas[0].localizedHouseName.includes('प्रथम भाव'));

    const localizedTa = i18n.localizeKundali(mockGrahasData, 'ta');
    assert.strictEqual(localizedTa.grahas[0].localizedPlanet, 'சூரியன் (Suriyan)');
    assert.strictEqual(localizedTa.grahas[0].localizedSign, 'மேஷம் (Mesham)');

    const localizedUr = i18n.localizeKundali(mockGrahasData, 'ur');
    assert.ok(localizedUr.grahas[0].localizedPlanet.includes('شمس'));
  });

  test('9. Matchmaking Ashtakoota localization', async () => {
    const mockMatchData = {
      ashtakootaGunas: [
        { category: 'Varna', obtained: 1, max: 1 },
        { category: 'Yoni', obtained: 3, max: 4 },
        { category: 'Nadi', obtained: 8, max: 8 },
      ],
    };

    const localizedMr = i18n.localizeMatchmaking(mockMatchData, 'mr');
    assert.strictEqual(localizedMr.ashtakootaGunas[0].localizedCategory, 'वर्ण (आध्यात्मिक सुसंगतता)');
    assert.strictEqual(localizedMr.ashtakootaGunas[2].localizedCategory, 'नाडी (आरोग्य, वंश व अनुवंशिकता)');

    const localizedHi = i18n.localizeMatchmaking(mockMatchData, 'hi');
    assert.strictEqual(localizedHi.ashtakootaGunas[0].localizedCategory, 'वर्ण (आध्यात्मिक अनुकूलता)');
  });

  test('10. Deep Destiny Analysis (?lang=mr) returns full Marathi paragraphs, strengths, and gemstone', async () => {
    const { req, res } = createMockReqRes({
      url: '/api/v1/numerology/destiny/1?lang=mr',
      query: { lang: 'mr' },
    });
    req.params = { number: '1' };

    i18nMiddleware(req, res, () => {});
    await numerologyController.getDestinyDetail(req, res, (err) => {
      if (err) throw err;
    });

    const body = res.getResponseData();
    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(body.language, 'mr');
    assert.ok(body.data.summary.includes('तुम्ही एक महत्त्वाकांक्षी'));
    assert.ok(body.data.strengths[0].includes('अढळ आत्मविश्वास'));
    assert.ok(body.data.challenges[0].includes('अधीरता'));
    assert.ok(body.data.attributes.gemstone.includes('माणिक'));
    assert.ok(body.data.attributes.coreMeaning.includes('स्वावलंबन'));
    assert.ok(body.data.attributes.favourableDays.includes('रविवार'));
  });

  test('11. Deep Destiny Analysis (?lang=hi) returns full Hindi paragraphs, strengths, and gemstone', async () => {
    const { req, res } = createMockReqRes({
      url: '/api/v1/numerology/destiny/1?lang=hi',
      query: { lang: 'hi' },
    });
    req.params = { number: '1' };

    i18nMiddleware(req, res, () => {});
    await numerologyController.getDestinyDetail(req, res, (err) => {
      if (err) throw err;
    });

    const body = res.getResponseData();
    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(body.language, 'hi');
    assert.ok(body.data.summary.includes('आप एक महत्वाकांक्षी'));
    assert.ok(body.data.strengths[0].includes('अटूट आत्मविश्वास'));
    assert.ok(body.data.challenges[0].includes('अधीरता'));
    assert.ok(body.data.attributes.gemstone.includes('माणिक्य'));
    assert.ok(body.data.attributes.coreMeaning.includes('स्वावलंबन'));
  });

  test('12. Deep Matchmaking Localization returns localized Ashtakoota descriptions & verdict', () => {
    const mockMatchData = {
      ashtakootaGunas: [
        { koota: 'Varna', obtained: 1, max: 1, description: 'Spiritual compatibility and ego harmony' },
        { koota: 'Nadi', obtained: 8, max: 8, description: 'Genetic compatibility and progeny' },
      ],
      overallRecommendation: {
        score: 28,
        verdict: 'Highly Auspicious Match',
        summary: 'This union demonstrates high matrimonial bliss.',
      },
    };

    const localizedMr = i18n.localizeMatchmaking(mockMatchData, 'mr');
    assert.ok(localizedMr.ashtakootaGunas[0].description.includes('आध्यात्मिक'));
    assert.ok(localizedMr.overallRecommendation.verdict.includes('अत्यंत शुभ'));
    assert.ok(localizedMr.overallRecommendation.summary.includes('36 पैकी 28 गुणांसह'));

    const localizedHi = i18n.localizeMatchmaking(mockMatchData, 'hi');
    assert.ok(localizedHi.ashtakootaGunas[0].description.includes('आध्यात्मिक'));
    assert.ok(localizedHi.overallRecommendation.verdict.includes('अत्यंत शुभ'));
    assert.ok(localizedHi.overallRecommendation.summary.includes('36 में से 28 गुणों'));
  });

  test('13. Localize Home Dashboard (?lang=mr) translates message, kundaliCard, panchangSnippet, and botBanner in Marathi', () => {
    const rawDashboardData = {
      user: {
        firstName: 'Aarav',
        fullName: 'Aarav Mehta',
        avatarUrl: 'https://cdn.vidhilikhit.com/avatars/default_male.jpg',
      },
      unreadNotificationsCount: 2,
      kundaliCard: {
        isReady: true,
        title: 'Your Kundali is Ready',
        subtitle: 'Explore your birth chart and personalized insights.',
        rashi: 'Leo (Simha)',
        lagna: 'Scorpio (Vrischika)',
      },
      dailyPanchangSnippet: {
        tithi: 'Shukla Dashami',
        nakshatra: 'Ashwini',
        auspiciousTime: '11:45 AM – 12:30 PM (Abhijit)',
      },
      vidhilikhitBotBanner: {
        title: 'Ask Our\nVidhilikhit Bot',
        subtitle: 'Get answers to your\nquestions anytime.',
        promptSuggestion: 'What does my 10th house say about my career?',
      },
    };

    const localized = i18n.localizeDashboard(rawDashboardData, 'mr');
    assert.strictEqual(localized.kundaliCard.title, 'तुमची कुंडली तयार आहे');
    assert.strictEqual(localized.kundaliCard.subtitle, 'तुमची जन्मपत्रिका आणि वैयक्तिक मार्गदर्शन जाणून घ्या.');
    assert.ok(localized.kundaliCard.rashi.includes('सिंह'));
    assert.ok(localized.kundaliCard.lagna.includes('वृश्चिक'));
    assert.strictEqual(localized.dailyPanchangSnippet.tithi, 'शुक्ल दशमी');
    assert.strictEqual(localized.dailyPanchangSnippet.nakshatra, 'अश्विनी');
    assert.ok(localized.dailyPanchangSnippet.auspiciousTime.includes('अभिजित मुहूर्त'));
    assert.strictEqual(localized.vidhilikhitBotBanner.title, 'आमच्या\nविधिलिखित बॉटला विचारा');
    assert.strictEqual(localized.vidhilikhitBotBanner.subtitle, 'तुमच्या प्रश्नांची उत्तरे\nकधीही मिळवा.');
    assert.strictEqual(localized.vidhilikhitBotBanner.promptSuggestion, 'माझे १० वे घर माझ्या करिअरबद्दल काय सांगते?');

    // Also test message translation
    assert.strictEqual(i18n.t('Dashboard fetched successfully', 'mr'), 'डॅशबोर्ड यशस्वीरीत्या प्राप्त झाला');
  });

  test('14. Localize Home Dashboard (?lang=hi) translates message, kundaliCard, and botBanner in Hindi', () => {
    const rawDashboardData = {
      kundaliCard: {
        isReady: true,
        title: 'Your Kundali is Ready',
        subtitle: 'Explore your birth chart and personalized insights.',
        rashi: 'Leo (Simha)',
        lagna: 'Scorpio (Vrischika)',
      },
      dailyPanchangSnippet: {
        tithi: 'Shukla Dashami',
        nakshatra: 'Ashwini',
        auspiciousTime: '11:45 AM – 12:30 PM (Abhijit)',
      },
      vidhilikhitBotBanner: {
        title: 'Ask Our\nVidhilikhit Bot',
        subtitle: 'Get answers to your\nquestions anytime.',
        promptSuggestion: 'What does my 10th house say about my career?',
      },
    };

    const localized = i18n.localizeDashboard(rawDashboardData, 'hi');
    assert.strictEqual(localized.kundaliCard.title, 'आपकी कुंडली तैयार है');
    assert.strictEqual(localized.kundaliCard.subtitle, 'अपनी जन्मपत्रिका और व्यक्तिगत अंतर्दृष्टि देखें।');
    assert.ok(localized.kundaliCard.rashi.includes('सिंह'));
    assert.strictEqual(localized.dailyPanchangSnippet.tithi, 'शुक्ल दशमी');
    assert.strictEqual(localized.vidhilikhitBotBanner.title, 'हमारे\nविधिलिखित बॉट से पूछें');
    assert.strictEqual(i18n.t('Dashboard fetched successfully', 'hi'), 'डैशबोर्ड सफलतापूर्वक प्राप्त हुआ');
  });

  test('15. Localize Kundali Overview (?lang=mr) translates rashi, lagna, nakshatra, and chartLabel', () => {
    const rawOverview = {
      summary: {
        rashi: {
          english: 'Leo',
          sanskrit: 'Simha',
          lord: 'Sun',
          element: 'Fire',
        },
        nakshatra: {
          name: 'Ashwini',
          pada: 1,
          lord: 'Ketu',
          deity: 'Ashwini Kumaras',
        },
        lagna: {
          english: 'Scorpio',
          sanskrit: 'Vrischika',
          lord: 'Mars',
          degree: '12° 30\' 00"',
        },
      },
      chart: {
        chartLabel: 'D1 Rashi Chart (Whole-Sign)',
        houses: [
          { house: 1, sign: 'Scorpio', signLord: 'Mars', rashi: 'Scorpio', grahas: [{ planet: 'Sun', sign: 'Leo' }] },
        ],
      },
    };

    const localized = i18n.localizeKundali(rawOverview, 'mr');
    assert.ok(localized.summary.rashi.english.includes('सिंह'));
    assert.ok(localized.summary.rashi.lord.includes('सूर्य'));
    assert.ok(localized.summary.rashi.element.includes('अग्नी'));
    assert.strictEqual(localized.summary.nakshatra.name, 'अश्विनी');
    assert.ok(localized.summary.nakshatra.lord.includes('केतू'));
    assert.ok(localized.summary.lagna.english.includes('वृश्चिक'));
    assert.ok(localized.summary.lagna.lord.includes('मंगळ'));
    assert.ok(localized.chart.chartLabel.includes('राशी चक्र'));
    assert.ok(localized.chart.houses[0].sign.includes('वृश्चिक'));
    assert.ok(localized.chart.houses[0].grahas[0].planet.includes('सूर्य'));
  });

  test('16. Localize Kundali Dasha Timeline (?lang=mr) translates Mahadasha & Antardasha in Marathi', () => {
    const rawDasha = {
      currentMahadasha: {
        planet: 'Saturn',
        title: 'Saturn Mahadasha',
        description: 'A major 19-year cycle ruled by Saturn.',
      },
      currentAntardasha: {
        planet: 'Mercury',
        title: 'Mercury Antardasha',
        description: 'A sub-period ruled by Mercury.',
      },
      upcomingAntardashas: [
        { planet: 'Ketu', title: 'Ketu Antardasha', description: 'A spiritual transit.' },
      ],
      timeline: {
        system: 'VIMSHOTTARI',
        birthNakshatra: 'Ashwini',
        birthNakshatraLord: 'Ketu',
        balanceAtBirth: { planet: 'Ketu', years: 3.36 },
      },
    };

    const localized = i18n.localizeKundali(rawDasha, 'mr');
    assert.ok(localized.currentMahadasha.planet.includes('शनी'));
    assert.ok(localized.currentMahadasha.title.includes('शनी') && localized.currentMahadasha.title.includes('महादशा'));
    assert.ok(localized.currentMahadasha.description.includes('शिस्त'));
    assert.ok(localized.currentAntardasha.planet.includes('बुध'));
    assert.ok(localized.currentAntardasha.title.includes('बुध') && localized.currentAntardasha.title.includes('अंतर्दशा'));
    assert.ok(localized.currentAntardasha.description.includes('बुद्धिमत्ता'));
    assert.ok(localized.upcomingAntardashas[0].planet.includes('केतू'));
    assert.strictEqual(localized.timeline.birthNakshatra, 'अश्विनी');
    assert.ok(localized.timeline.birthNakshatraLord.includes('केतू'));
  });

  test('17. Localize Kundali Yogas (?lang=mr) translates detected yogas and badge in Marathi', () => {
    const rawYogas = {
      totalYogasDetected: 2,
      yogas: [
        {
          id: 'gajakesari-yoga',
          title: 'Gajakesari Yoga',
          badge: 'Present',
          description: 'Jupiter in a kendra from the Moon.',
          planetsInvolved: ['Jupiter', 'Moon'],
        },
        {
          id: 'budhaditya-yoga',
          title: 'Budhaditya Yoga',
          badge: 'Present',
          description: 'Sun and Mercury conjunct in same sign.',
          planetsInvolved: ['Sun', 'Mercury'],
        },
      ],
    };

    const localized = i18n.localizeKundali(rawYogas, 'mr');
    assert.ok(localized.yogas[0].title.includes('गजकेसरी'));
    assert.ok(localized.yogas[0].description.includes('गुरू'));
    assert.strictEqual(localized.yogas[0].badge, 'उपस्थित');
    assert.ok(localized.yogas[0].planetsInvolved[0].includes('गुरू'));
    assert.ok(localized.yogas[1].title.includes('बुधादित्य'));
    assert.ok(localized.yogas[1].description.includes('सूर्य आणि बुध'));
  });

  test('18. Localize Kundali Doshas (?lang=mr) translates Manglik, Kalsarpa, and Sade Sati in Marathi', () => {
    const rawDoshas = {
      manglik: {
        status: 'PRESENT',
        isPresent: true,
        ruleDetails: [
          { reference: 'LAGNA', marsHouse: 1, isAfflicted: true, description: 'Mars is placed in house 1 from Lagna.' },
        ],
        explanation: 'Mars occupies a sensitive house from Lagna or Moon.',
      },
      kalsarpa: {
        status: 'NOT_PRESENT',
        isPresent: false,
        explanation: 'Planets are distributed on both sides of the Rahu-Ketu axis.',
      },
      sadeSati: {
        status: 'ACTIVE',
        isActive: true,
        phase: '2nd Phase (Peak)',
        saturnTransitSign: 'Pisces',
        moonSign: 'Sagittarius',
        explanation: 'Saturn transits directly over natal Moon sign.',
      },
    };

    const localized = i18n.localizeKundali(rawDoshas, 'mr');
    assert.strictEqual(localized.manglik.statusLabel, 'उपस्थित');
    assert.ok(localized.manglik.explanation.includes('मंगळ लग्नापासून किंवा चंद्रापासून'));
    assert.ok(localized.manglik.ruleDetails[0].description.includes('मंगळ लग्नापासून 1 व्या भावात स्थित आहे.'));
    assert.strictEqual(localized.kalsarpa.statusLabel, 'नाही');
    assert.ok(localized.kalsarpa.explanation.includes('संतुलित आहेत'));
    assert.ok(localized.sadeSati.phase.includes('दुसरी फेरी (शिखर)'));
    assert.ok(localized.sadeSati.saturnTransitSign.includes('मीन'));
    assert.ok(localized.sadeSati.moonSign.includes('धनु'));
    assert.ok(localized.sadeSati.explanation.includes('थेट जन्मकालीन चंद्र राशीवरून'));
  });

  test('19. Localize Kundali Recommendations (?lang=mr) translates Rudraksha and Gemstones in Marathi', () => {
    const rawRecommendations = {
      rudraksha: {
        recommendedMukhi: 8,
        name: '8-Mukhi Rudraksha',
        rulingPlanet: 'Ketu',
        associatedDeity: 'Ganesha',
        reason: 'Traditional recommendation.',
        benefits: ['Enhances spiritual groundedness'],
        howToWear: ['Wear on Monday or Thursday'],
        precautions: ['Remove before sleep'],
        disclaimer: 'Traditional spiritual information only.',
      },
      gemstones: {
        lifeStone: {
          name: 'Yellow Sapphire',
          regionalName: 'Pukhraj',
          planet: 'Jupiter',
          howToWear: { metal: 'Gold', finger: 'Index finger' },
        },
      },
    };

    const localized = i18n.localizeKundali(rawRecommendations, 'mr');
    assert.ok(localized.rudraksha.name.includes('८-मुखी रुद्राक्ष'));
    assert.ok(localized.rudraksha.rulingPlanet.includes('केतू'));
    assert.ok(localized.rudraksha.associatedDeity.includes('श्री गणेश'));
    assert.ok(localized.rudraksha.reason.includes('वैदिक शिफारस'));
    assert.ok(localized.rudraksha.benefits[0].includes('आत्मिक स्थिरता'));
    assert.ok(localized.gemstones.lifeStone.name.includes('पुष्कराज'));
    assert.ok(localized.gemstones.lifeStone.planet.includes('गुरू'));
    assert.strictEqual(localized.gemstones.lifeStone.howToWear.metal, 'सोने');
    assert.ok(localized.gemstones.lifeStone.howToWear.finger.includes('तर्जनी'));
  });

  test('20. Localize Daily Guidance Forecast (?lang=mr) translates timeframe, day, panchang, and domains in Marathi', () => {
    const rawGuidance = {
      timeframe: 'Today',
      dayName: 'Monday',
      panchang: {
        tithi: 'Shukla Dashami',
        nakshatra: 'Shravana',
        abhijitMuhurat: '11:50 AM – 12:38 PM (Abhijit)',
      },
      overall: {
        title: 'Overall Guidance',
        description: 'A positive day for new beginnings.',
      },
      domains: {
        career: { title: 'Career', description: 'New opportunities may arise.' },
      },
    };

    const localized = i18n.localizeGuidance(rawGuidance, 'mr');
    assert.strictEqual(localized.timeframe, 'आज');
    assert.strictEqual(localized.dayName, 'सोमवार');
    assert.strictEqual(localized.panchang.tithi, 'शुक्ल दशमी');
    assert.strictEqual(localized.panchang.nakshatra, 'श्रवण');
    assert.ok(localized.panchang.abhijitMuhurat.includes('अभिजित मुहूर्त'));
    assert.strictEqual(localized.overall.title, 'दैनंदिन मार्गदर्शन');
    assert.strictEqual(localized.domains.career.title, 'करिअर व नोकरी');
  });

  test('21. End-to-end middleware interceptor automatically localizes Kundali, Guidance, and Doshas responses', () => {
    // 1. Kundali Overview
    const { req: req1, res: res1 } = createMockReqRes({ url: '/api/v1/kundali/overview?lang=mr', query: { lang: 'mr' } });
    i18nMiddleware(req1, res1, () => {});
    res1.json({
      success: true,
      message: 'Kundali overview fetched successfully',
      data: {
        summary: {
          rashi: { english: 'Aries', lord: 'Mars', element: 'Fire' },
          lagna: { english: 'Leo', lord: 'Sun' },
        },
      },
    });
    const body1 = res1.getResponseData();
    assert.strictEqual(body1.message, 'कुंडली विहंगावलोकन यशस्वीरीत्या प्राप्त झाले');
    assert.strictEqual(body1.language, 'mr');
    assert.ok(body1.data.summary.rashi.english.includes('मेष'));
    assert.ok(body1.data.summary.lagna.english.includes('सिंह'));

    // 2. Guidance Forecast
    const { req: req2, res: res2 } = createMockReqRes({ url: '/api/v1/guidance/forecast?lang=mr', query: { lang: 'mr' } });
    i18nMiddleware(req2, res2, () => {});
    res2.json({
      success: true,
      message: 'Guidance forecast fetched successfully',
      data: {
        timeframe: 'Today',
        dayName: 'Sunday',
        panchang: { tithi: 'Shukla Dashami', nakshatra: 'Ashwini' },
      },
    });
    const body2 = res2.getResponseData();
    assert.strictEqual(body2.message, 'दैनिक मार्गदर्शन व अंदाज यशस्वीरीत्या प्राप्त झाले');
    assert.strictEqual(body2.data.timeframe, 'आज');
    assert.strictEqual(body2.data.dayName, 'रविवार');

    // 3. Doshas Evaluation
    const { req: req3, res: res3 } = createMockReqRes({ url: '/api/v1/kundali/doshas?lang=hi', query: { lang: 'hi' } });
    i18nMiddleware(req3, res3, () => {});
    res3.json({
      success: true,
      message: 'Doshas evaluated successfully',
      data: {
        manglik: { status: 'NOT_PRESENT', isPresent: false },
        kalsarpa: { status: 'NOT_PRESENT', isPresent: false },
        sadeSati: { status: 'ACTIVE', isActive: true, phase: '1st Phase (Rising)', saturnTransitSign: 'Pisces', moonSign: 'Aries' },
      },
    });
    const body3 = res3.getResponseData();
    assert.strictEqual(body3.message, 'दोष मूल्यांकन सफलतापूर्वक पूर्ण हुआ');
    assert.strictEqual(body3.language, 'hi');
    assert.strictEqual(body3.data.manglik.statusLabel, 'नहीं');
    assert.ok(body3.data.manglik.explanation.includes('मंगल किसी अनिष्ट भाव में'));
    assert.ok(body3.data.sadeSati.phase.includes('प्रथम चरण'));
  });

  test('22. Localize Kundali Bhavas (?lang=mr) translates all 12 houses, aspects, interpretations, and Rahu/Ketu analysis', () => {
    const rawBhavasData = {
      nodeCalculationMode: 'MEAN',
      ayanamsa: 'Lahiri',
      methodology: 'Parashari',
      bhavas: [
        {
          number: 1,
          title: 'First House',
          sanskritName: 'Tanu Bhava',
          sign: 'Scorpio',
          signLord: 'Mars',
          planetsPresent: [],
          description: 'Self and personality',
          houseLord: { planet: 'Mars', houseNumber: 9, sign: 'Cancer' },
          aspects: [{ planet: 'Jupiter', fromHouse: 5, aspectType: '9th Parashari Drishti' }],
          interpretation: {
            summary: 'The Self & Personality (Tanu Bhava) is situated in Scorpio and governed by Mars. Its lord is positioned in the 9th House.',
            positiveFactors: ['Sustained through lord Mars'],
            challengeFactors: [],
          },
        },
        {
          number: 2,
          title: 'Second House',
          sanskritName: 'Dhana Bhava',
          sign: 'Sagittarius',
          signLord: 'Jupiter',
          planetsPresent: [],
          description: 'Wealth and family',
          houseLord: { planet: 'Jupiter', houseNumber: 5, sign: 'Pisces' },
          aspects: [],
          interpretation: {
            summary: 'The Wealth & Family (Dhana Bhava) is situated in Sagittarius and governed by Jupiter. Its lord is positioned in the 5th House.',
            positiveFactors: ['Sustained through lord Jupiter'],
            challengeFactors: [],
          },
        },
        {
          number: 3,
          title: 'Third House',
          sanskritName: 'Sahaja Bhava',
          sign: 'Capricorn',
          signLord: 'Saturn',
          planetsPresent: [],
          description: 'Communication and courage',
          houseLord: { planet: 'Saturn', houseNumber: 6, sign: 'Aries' },
          aspects: [{ planet: 'Mars', fromHouse: 9, aspectType: '7th Parashari Drishti' }],
          interpretation: {
            summary: 'The Communication (Sahaja Bhava) is situated in Capricorn and governed by Saturn. Its lord is positioned in the 6th House.',
            positiveFactors: ['Sustained through lord Saturn'],
            challengeFactors: ['Under Parashari aspect from natural malefics'],
          },
        },
        {
          number: 4,
          title: 'Fourth House',
          sanskritName: 'Sukha Bhava',
          sign: 'Aquarius',
          signLord: 'Saturn',
          planetsPresent: ['Ketu'],
          description: 'Mother and home',
          houseLord: { planet: 'Saturn', houseNumber: 6, sign: 'Aries' },
          aspects: [],
          interpretation: {
            summary: 'The Mother & Home (Sukha Bhava) is situated in Aquarius and governed by Saturn. Its lord is positioned in the 6th House.',
            positiveFactors: ['Planetary presence: Ketu', 'Sustained through lord Saturn'],
            challengeFactors: [],
          },
          nodeInterpretations: [
            {
              planet: 'Ketu',
              houseNumber: 4,
              sign: 'Aquarius',
              bhavaName: 'Fourth House',
              methodology: 'Parashari',
              traditionalMeaning: 'Traditional 4th house Ketu meaning.',
              generalLifeThemes: ['Spiritual detachment', 'Emotional introspection', 'Focus on internal peace'],
              positivePossibilities: ['Deep spiritual connection to mother or inner sanctuary'],
              potentialChallenges: ['Restlessness at domestic level'],
              chartContext: {
                sign: 'Aquarius',
                dispositor: 'Saturn',
                nakshatra: 'Shatabhisha',
                conjunctions: [],
                parashariAspectsReceived: [],
                divisionalReference: 'D9 Navamsha support',
                methodologyNote: 'Parashari whole-sign',
              },
              disclaimer: 'General interpretation disclaimer.',
            },
          ],
        },
        {
          number: 10,
          title: 'Tenth House',
          sanskritName: 'Karma Bhava',
          sign: 'Leo',
          signLord: 'Sun',
          planetsPresent: ['Rahu'],
          description: 'Career and profession',
          houseLord: { planet: 'Sun', houseNumber: 9, sign: 'Cancer' },
          aspects: [],
          interpretation: {
            summary: 'The Career (Karma Bhava) is situated in Leo and governed by Sun. Its lord is positioned in the 9th House.',
            positiveFactors: ['Planetary presence: Rahu', 'Sustained through lord Sun'],
            challengeFactors: [],
          },
          nodeInterpretations: [
            {
              planet: 'Rahu',
              houseNumber: 10,
              sign: 'Leo',
              bhavaName: 'Tenth House',
              methodology: 'Parashari',
              traditionalMeaning: 'Traditional 10th house Rahu meaning.',
              generalLifeThemes: ['High career ambition', 'Public recognition', 'Leadership drive'],
              positivePossibilities: ['Drive to attain professional eminence'],
              potentialChallenges: ['Work-life balance issues'],
              chartContext: {
                sign: 'Leo',
                dispositor: 'Sun',
                nakshatra: 'Magha',
                conjunctions: [],
                parashariAspectsReceived: [],
                divisionalReference: 'D10 Dashamsha support',
                methodologyNote: 'Parashari whole-sign',
              },
              disclaimer: 'General interpretation disclaimer.',
            },
          ],
        },
      ],
      rahuKetuAnalysis: {
        methodology: 'Parashari Whole-Sign',
        rahu: {
          planet: 'Rahu',
          houseNumber: 10,
          sign: 'Leo',
          bhavaName: 'Tenth House',
          traditionalMeaning: 'Traditional Rahu 10th house meaning.',
          generalLifeThemes: ['High career ambition', 'Public recognition'],
          positivePossibilities: ['Drive to attain professional eminence'],
          potentialChallenges: ['Work-life balance issues'],
          chartContext: {
            sign: 'Leo',
            dispositor: 'Sun',
            nakshatra: 'Magha',
            conjunctions: [],
            parashariAspectsReceived: [],
            divisionalReference: 'D10',
            methodologyNote: 'Parashari',
          },
          disclaimer: 'General disclaimer.',
        },
        ketu: {
          planet: 'Ketu',
          houseNumber: 4,
          sign: 'Aquarius',
          bhavaName: 'Fourth House',
          traditionalMeaning: 'Traditional Ketu 4th house meaning.',
          generalLifeThemes: ['Spiritual detachment', 'Focus on internal peace'],
          positivePossibilities: ['Inner sanctuary'],
          potentialChallenges: ['Restlessness at home'],
          chartContext: {
            sign: 'Aquarius',
            dispositor: 'Saturn',
            nakshatra: 'Shatabhisha',
            conjunctions: [],
            parashariAspectsReceived: [],
            divisionalReference: 'D9',
            methodologyNote: 'Parashari',
          },
          disclaimer: 'General disclaimer.',
        },
        disclaimer: 'Disclaimer text.',
      },
    };

    // 1. Direct unit localization
    const localized = i18n.localizeKundali(rawBhavasData, 'mr');

    // House 1 checks
    const h1 = localized.bhavas[0];
    assert.strictEqual(h1.title, 'प्रथम भाव (तनु भाव)');
    assert.strictEqual(h1.sanskritName, 'तनु भाव');
    assert.ok(h1.sign.includes('वृश्चिक'));
    assert.ok(h1.signLord.includes('मंगळ'));
    assert.ok(h1.houseLord.planet.includes('मंगळ'));
    assert.ok(h1.houseLord.sign.includes('कर्क'));
    assert.strictEqual(h1.aspects[0].aspectType, '९ वी पराशरी दृष्टी');
    assert.ok(h1.aspects[0].planet.includes('गुरू'));
    assert.ok(h1.interpretation.summary.includes('प्रथम भाव (तनु भाव) हे वृश्चिक (Scorpio) राशीत स्थित'));
    assert.ok(h1.interpretation.summary.includes('९ व्या भावात स्थित आहेत'));
    assert.ok(h1.interpretation.positiveFactors[0].includes('भावाचे अधिपती मंगळ (Mangal) द्वारे संरक्षित'));

    // House 2 checks - ensure distinct title & sanskrit name (not first house duplicate!)
    const h2 = localized.bhavas[1];
    assert.strictEqual(h2.title, 'द्वितीय भाव (धन भाव)');
    assert.strictEqual(h2.sanskritName, 'धन भाव');
    assert.ok(h2.sign.includes('धनु'));
    assert.ok(h2.signLord.includes('गुरू'));
    assert.ok(h2.interpretation.summary.includes('द्वितीय भाव (धन भाव) हे धनु (Sagittarius) राशीत स्थित'));

    // House 3 checks
    const h3 = localized.bhavas[2];
    assert.strictEqual(h3.title, 'तृतीय भाव (सहज भाव)');
    assert.strictEqual(h3.sanskritName, 'सहज भाव');
    assert.strictEqual(h3.aspects[0].aspectType, '७ वी पराशरी दृष्टी');
    assert.ok(h3.interpretation.challengeFactors[0].includes('नैसर्गिक पापग्रहांची'));

    // House 4 checks (with Ketu)
    const h4 = localized.bhavas[3];
    assert.strictEqual(h4.title, 'चतुर्थ भाव (सुख भाव)');
    assert.strictEqual(h4.sanskritName, 'सुख भाव');
    assert.ok(h4.planetsPresent[0].includes('केतू'));
    assert.ok(h4.interpretation.positiveFactors[0].includes('भावामध्ये ग्रहांची उपस्थिती: केतू (Ketu)'));
    assert.strictEqual(h4.nodeInterpretations[0].planet, 'केतू (Ketu)');
    assert.strictEqual(h4.nodeInterpretations[0].bhavaName, 'चतुर्थ भाव (सुख भाव)');
    assert.ok(h4.nodeInterpretations[0].traditionalMeaning.includes('आंतरिक शांती'));
    assert.strictEqual(h4.nodeInterpretations[0].methodology, 'पराशरी');
    assert.ok(h4.nodeInterpretations[0].chartContext.sign.includes('कुंभ'));
    assert.ok(h4.nodeInterpretations[0].chartContext.dispositor.includes('शनी'));

    // House 10 checks (with Rahu)
    const h10 = localized.bhavas[4];
    assert.strictEqual(h10.title, 'दशम भाव (कर्म भाव)');
    assert.strictEqual(h10.sanskritName, 'कर्म भाव');
    assert.ok(h10.planetsPresent[0].includes('राहू'));
    assert.strictEqual(h10.nodeInterpretations[0].planet, 'राहू (Rahu)');
    assert.strictEqual(h10.nodeInterpretations[0].bhavaName, 'दशम भाव (कर्म भाव)');
    assert.ok(h10.nodeInterpretations[0].traditionalMeaning.includes('करिअर'));

    // Top-level RahuKetuAnalysis checks
    assert.strictEqual(localized.rahuKetuAnalysis.methodology, 'पराशरी');
    assert.strictEqual(localized.rahuKetuAnalysis.rahu.planet, 'राहू (Rahu)');
    assert.strictEqual(localized.rahuKetuAnalysis.ketu.planet, 'केतू (Ketu)');
    assert.ok(localized.rahuKetuAnalysis.disclaimer.includes('केवळ एका भावातील स्थितीवरून'));

    // 2. Middleware integration test for GET /kundali/bhavas
    const { req, res } = createMockReqRes({ url: '/api/v1/kundali/bhavas?lang=mr', query: { lang: 'mr' } });
    i18nMiddleware(req, res, () => {});
    res.json({
      success: true,
      message: 'Bhava analysis fetched successfully',
      data: rawBhavasData,
    });

    const body = res.getResponseData();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.message, 'भाव विश्लेषण यशस्वीरीत्या प्राप्त झाले');
    assert.strictEqual(body.language, 'mr');
    assert.strictEqual(body.data.bhavas[0].title, 'प्रथम भाव (तनु भाव)');
    assert.strictEqual(body.data.bhavas[1].title, 'द्वितीय भाव (धन भाव)');
    assert.strictEqual(body.data.bhavas[2].title, 'तृतीय भाव (सहज भाव)');
    assert.strictEqual(body.data.bhavas[3].title, 'चतुर्थ भाव (सुख भाव)');
  });

  test('23. Localize Vargas (?lang=mr and ?lang=gu) translates titles, descriptions, and chart data', () => {
    const rawVargas = {
      vargas: [
        { code: 'D1', title: 'Rashi Chart', description: 'Primary physical constitution and core destiny.' },
        { code: 'D9', title: 'Navamsha', description: 'Spouse, marriage, inner nature and dharma.' },
        { code: 'D10', title: 'Dashamsha', description: 'Career achievements, fame, profession and power.' },
      ],
    };

    // Marathi
    const locMr = i18n.localizeKundali(rawVargas, 'mr');
    assert.ok(locMr.vargas[0].title.includes('राशी चक्र'));
    assert.ok(locMr.vargas[0].description.includes('शारीरिक प्रकृती'));
    assert.ok(locMr.vargas[1].title.includes('नवांश'));
    assert.ok(locMr.vargas[1].description.includes('जीवनसाथी'));
    assert.ok(locMr.vargas[2].title.includes('दशांश'));
    assert.ok(locMr.vargas[2].description.includes('करिअर यश'));

    // Gujarati
    const locGu = i18n.localizeKundali(rawVargas, 'gu');
    assert.ok(locGu.vargas[0].title.includes('રાશિ ચક્ર'));
    assert.ok(locGu.vargas[0].description.includes('શારીરિક'));
    assert.ok(locGu.vargas[1].title.includes('નવાંશ'));
    assert.ok(locGu.vargas[2].title.includes('દશાંશ'));
  });

  test('24. Localize Yogas (?lang=mr) translates Surya-Rahu Grahan, Chandra-Rahu Grahan, and Rahu-Upachaya', () => {
    const rawYogas = {
      totalYogasDetected: 3,
      yogas: [
        {
          id: 'surya-rahu-grahan',
          title: 'Surya-Rahu Conjunction (Grahan Yoga)',
          badge: 'Notable',
          description: 'Sun and Rahu occupy Leo (Simha) (10th House)...',
          planetsInvolved: ['Sun', 'Rahu'],
          conditions: [{ description: 'Sun and Rahu occupy Leo (Simha) (10th House)...' }],
          interpretation: { summary: 'Sun and Rahu occupy Leo (Simha)...', positiveIndications: ['...'] },
        },
        {
          id: 'chandra-rahu-grahan',
          title: 'Chandra-Rahu Conjunction (Grahan Yoga)',
          badge: 'Notable',
          description: 'Moon and Rahu occupy Leo (Simha)...',
          planetsInvolved: ['Moon', 'Rahu'],
        },
        {
          id: 'rahu-upachaya',
          title: 'Rahu in Upachaya (10th House)',
          badge: 'Present',
          description: 'Rahu occupies the 10th House...',
          planetsInvolved: ['Rahu'],
        },
      ],
    };

    const loc = i18n.localizeKundali(rawYogas, 'mr');
    assert.ok(loc.yogas[0].title.includes('सूर्य-राहू ग्रहण योग'));
    assert.ok(loc.yogas[0].description.includes('सूर्य आणि राहूची युती'));
    assert.ok(loc.yogas[0].conditions[0].description.includes('सूर्य आणि राहूची युती'));
    assert.ok(loc.yogas[0].interpretation.summary.includes('सूर्य आणि राहूची युती'));
    assert.ok(loc.yogas[0].planetsInvolved[0].includes('सूर्य'));
    assert.ok(loc.yogas[0].planetsInvolved[1].includes('राहू'));

    assert.ok(loc.yogas[1].title.includes('चंद्र-राहू ग्रहण योग'));
    assert.ok(loc.yogas[1].description.includes('चंद्र आणि राहूची युती'));

    assert.ok(loc.yogas[2].title.includes('उपचय भावात राहू'));
    assert.ok(loc.yogas[2].description.includes('राहू उपचय भावात'));
  });

  test('25. Localize Strengths / Shadbala (?lang=gu and ?lang=mr) translates planet names and houses', () => {
    const rawStrengths = {
      shadbala: {
        unit: 'virupa',
        planets: [
          { planet: 'Sun', totalShadbala: 395.2, rupas: 6.59, rank: 1 },
          { planet: 'Jupiter', totalShadbala: 380.1, rupas: 6.33, rank: 2 },
        ],
      },
      bhavbala: {
        unit: 'virupa',
        houses: [{ house: 1, totalBhavaBala: 360, rank: 1 }],
      },
    };

    // Gujarati
    const locGu = i18n.localizeKundali(rawStrengths, 'gu');
    assert.ok(locGu.shadbala.planets[0].planet.includes('સૂર્ય'));
    assert.ok(locGu.shadbala.planets[1].planet.includes('ગુરુ'));
    assert.strictEqual(locGu.shadbala.localizedUnit, 'વિરૂપા (Virupa)');
    assert.ok(locGu.bhavbala.houses[0].localizedHouse.includes('પ્રથમ ભાવ'));

    // Marathi
    const locMr = i18n.localizeKundali(rawStrengths, 'mr');
    assert.ok(locMr.shadbala.planets[0].planet.includes('सूर्य'));
    assert.ok(locMr.shadbala.planets[1].planet.includes('गुरू'));
    assert.strictEqual(locMr.shadbala.localizedUnit, 'विरूपा (Virupa)');
    assert.ok(locMr.bhavbala.houses[0].localizedHouse.includes('प्रथम भाव'));
  });

  test('26. Localize Transit Charts (?lang=gu) translates Lagna/Moon houses and transiting planets in Gujarati', () => {
    const rawTransits = {
      asOf: '2026-11-16',
      lagnaTransitChart: {
        houses: [
          { house: 1, signName: 'Scorpio', signSanskrit: 'Vrischika', planets: ['Moon'] },
          { house: 2, signName: 'Sagittarius', signSanskrit: 'Dhanu', planets: ['Rahu'] },
        ],
      },
      moonTransitChart: {
        houses: [
          { house: 1, signName: 'Leo', signSanskrit: 'Simha', planets: ['Moon'] },
        ],
      },
      transitingPlanets: [
        { id: 'sun', name: 'Sun (Surya)', sign: 'Libra', signSanskrit: 'Tula' },
        { id: 'mars', name: 'Mars (Mangal)', sign: 'Leo', signSanskrit: 'Simha' },
      ],
    };

    const loc = i18n.localizeKundali(rawTransits, 'gu');
    assert.ok(loc.lagnaTransitChart.houses[0].signName.includes('વૃશ્ચિક'));
    assert.ok(loc.lagnaTransitChart.houses[0].planets[0].includes('ચંદ્ર'));
    assert.ok(loc.lagnaTransitChart.houses[1].signName.includes('ધન'));
    assert.ok(loc.lagnaTransitChart.houses[1].planets[0].includes('રાહુ'));
    assert.ok(loc.moonTransitChart.houses[0].signName.includes('સિંહ'));
    assert.ok(loc.transitingPlanets[0].name.includes('સૂર્ય'));
    assert.ok(loc.transitingPlanets[0].sign.includes('તુલા'));
    assert.ok(loc.transitingPlanets[1].name.includes('મંગળ'));
    assert.ok(loc.transitingPlanets[1].sign.includes('સિંહ'));
  });

  test('27. Localize KP Astrology (?lang=gu) translates Bhav Chalit, Ruling Planets, KP Planets & Cusps in Gujarati', () => {
    const rawKp = {
      bhavChalitChart: {
        houses: [
          { house: 1, sign: 'Scorpio', signLord: 'Mars' },
          { house: 2, sign: 'Sagittarius', signLord: 'Jupiter' },
        ],
      },
      rulingPlanets: {
        ascSignLord: 'Mars',
        ascStarLord: 'Mercury',
        ascSubLord: 'Venus',
        moonSignLord: 'Sun',
        moonStarLord: 'Ketu',
        moonSubLord: 'Rahu',
        dayLord: 'Saturn',
      },
      kpPlanets: [
        { planet: 'Sun', sign: 'Leo', signLord: 'Sun', star: 'Magha', starLord: 'Ketu', subLord: 'Mars' },
      ],
      kpCusps: [
        { cusp: 1, sign: 'Scorpio', signLord: 'Mars', star: 'Vishakha', starLord: 'Jupiter', subLord: 'Venus' },
      ],
    };

    const loc = i18n.localizeKundali(rawKp, 'gu');
    assert.ok(loc.bhavChalitChart.houses[0].sign.includes('વૃશ્ચિક'));
    assert.ok(loc.bhavChalitChart.houses[0].signLord.includes('મંગળ'));
    assert.ok(loc.rulingPlanets.ascSignLord.includes('મંગળ'));
    assert.ok(loc.rulingPlanets.ascStarLord.includes('બુધ'));
    assert.ok(loc.rulingPlanets.ascSubLord.includes('શુક્ર'));
    assert.ok(loc.rulingPlanets.moonSignLord.includes('સૂર્ય'));
    assert.ok(loc.kpPlanets[0].planet.includes('સૂર્ય'));
    assert.ok(loc.kpPlanets[0].sign.includes('સિંહ'));
    assert.ok(loc.kpPlanets[0].starLord.includes('કેતુ'));
    assert.ok(loc.kpCusps[0].sign.includes('વૃશ્ચિક'));
    assert.ok(loc.kpCusps[0].starLord.includes('ગુરુ'));
  });

  test('28. Localize Rahu-Ketu deep behavioral themes & analysis (?lang=mr) translates all 11 psychological and transit fields', () => {
    const rawRahu10 = {
      planet: 'Rahu',
      houseNumber: 10,
      bhavaName: 'Karma Bhava',
      psychologicalBehaviouralThemes: 'Strong orientation toward legacy, visibility, mastery over worldly arenas, and breaking glass ceilings.',
      relationshipWithBhavaLord: 'A dignified 10th lord stabilizes authority and converts ambition into durable respect.',
      relevantRashiInfluence: 'Earth and Air signs excel in corporate, technical, and executive governance; Fire signs amplify pioneering leadership.',
      nakshatraAndLordInfluence: 'Nakshatra lord points closely to the specialized professional niche and public style.',
      dispositorCondition: 'Strong 10th dispositor in Kendra/Trikona/11th supports lasting prominence and career stability.',
      aspectsAndConjunctions: 'Conjunction with 10th or 9th lord creates strong career momentum; Jupiter’s aspect safeguards ethics and reputation.',
      dashaAndAntardashaConditions: 'Rahu periods commonly deliver major promotions, public recognition, industry shifts, or entrepreneurial launches.',
      transitConditions: 'Saturn and Jupiter transits over the 10th house test and reward long-term professional accountability.',
      supportingAndContradictoryFactors: 'Examine D10 (Dashamsha) chart and Saturn/Sun strength for a complete career picture.',
      strengthModifiers: {
        strongerWhen: '10th lord is strong in D1 and D10, with Rahu in Taurus, Gemini, Virgo, or Aquarius.',
        weakerOrStrainedWhen: '10th lord is weak or afflicted in dusthana houses without benefic backing.',
      },
      sourceReferences: [
        'Brihat Parashara Hora Shastra (BPHS) — Karma Bhava & Upachaya Rules',
        'Saravali — Rahu in 10th Bhava',
      ],
    };

    const loc = i18n.localizeNodeRecord(rawRahu10, 'mr');
    assert.strictEqual(loc.planet, 'राहू (Rahu)');
    assert.strictEqual(loc.bhavaName, 'दशम भाव (कर्म भाव)');
    assert.ok(loc.psychologicalBehaviouralThemes.includes('वारसा, उच्च सामाजिक दृश्यमानता'));
    assert.ok(loc.relationshipWithBhavaLord.includes('दशमेश बलवान असल्यास'));
    assert.ok(loc.relevantRashiInfluence.includes('पृथ्वी आणि वायू राशी'));
    assert.ok(loc.dispositorCondition.includes('दशमेश केंद्र, त्रिकोण किंवा ११ व्या भावात'));
    assert.ok(loc.aspectsAndConjunctions.includes('दशमेश किंवा भाग्येशाशी युती'));
    assert.ok(loc.dashaAndAntardashaConditions.includes('राहूच्या दशा/अंतर्दशेत'));
    assert.ok(loc.transitConditions.includes('दशम भावावरून शनी आणि गुरूचे गोचर'));
    assert.ok(loc.supportingAndContradictoryFactors.includes('D10 (दशांश)'));
    assert.ok(loc.strengthModifiers.strongerWhen.includes('दशमेश D1 आणि D10'));
    assert.ok(loc.strengthModifiers.weakerOrStrainedWhen.includes('दशमेश निर्बळ'));
    assert.ok(loc.sourceReferences[0].includes('बृहत् पराशर होरा शास्त्र'));
  });

  test('29. Localize Matchmaking Calculation (?lang=mr and ?lang=gu) translates person1, person2, overall, highlights, manglikAnalysis', () => {
    const rawMatch = {
      matchId: 'match_12345',
      person1: {
        name: 'Aarav Mehta',
        moonSign: 'Cancer',
        nakshatra: 'Pushya',
      },
      person2: {
        name: 'Diya Sharma',
        moonSign: 'Taurus',
        nakshatra: 'Rohini',
      },
      overall: {
        percentage: '83%',
        gunasObtained: 30,
        gunasTotal: 36,
        verdict: 'High Match',
        verdictDescription: 'Strong natural harmony and shared emotional values indicate high matrimonial potential.',
      },
      highlights: [
        { id: 'emotional', title: 'Emotional Connection', score: '88%', description: 'Strong emotional understanding.' },
        { id: 'values', title: 'Values & Beliefs', score: '80%', description: 'Deeply shared family ethics.' },
        { id: 'marriage', title: 'Marriage Prospects', score: '85%', description: 'Highly auspicious planetary alignment.' },
        { id: 'harmony', title: 'Long-term Harmony', score: '78%', description: 'Exceptional longevity.' },
      ],
      manglikAnalysis: {
        person1Manglik: false,
        person2Manglik: false,
        isManglikDoshaCancelled: true,
        summary: 'No Manglik Dosha affliction present in this union.',
      },
    };

    // Marathi
    const locMr = i18n.localizeMatchmaking(rawMatch, 'mr');
    assert.ok(locMr.person1.moonSign.includes('कर्क'));
    assert.strictEqual(locMr.person1.nakshatra, 'पुष्य');
    assert.ok(locMr.person2.moonSign.includes('वृषभ'));
    assert.strictEqual(locMr.person2.nakshatra, 'रोहिणी');
    assert.ok(locMr.overall.verdict.includes('उत्तम जोडी'));
    assert.ok(locMr.overall.verdictDescription.includes('नैसर्गिक सुसंवाद'));
    assert.strictEqual(locMr.highlights[0].title, 'भावनिक जिव्हाळा');
    assert.ok(locMr.highlights[0].description.includes('उत्कृष्ट भावनिक समजूतदारपणा'));
    assert.strictEqual(locMr.highlights[1].title, 'मूल्ये आणि श्रद्धा');
    assert.ok(locMr.manglikAnalysis.summary.includes('मांगलिक दोषाचा कोणताही अनिष्ट प्रभाव नाही'));
    assert.ok(locMr.manglikAnalysis.status.includes('दोषरहित'));

    // Gujarati
    const locGu = i18n.localizeMatchmaking(rawMatch, 'gu');
    assert.ok(locGu.person1.moonSign.includes('કર્ક'));
    assert.ok(locGu.person2.moonSign.includes('વૃષભ'));
    assert.ok(locGu.overall.verdict.includes('શ્રેષ્ઠ મિલન') || locGu.overall.verdict.includes('ઉત્તમ મિલન'));
    assert.strictEqual(locGu.highlights[0].title, 'લાગણીશીલ જોડાણ');
    assert.ok(locGu.manglikAnalysis.summary.includes('માંગલિક દોષનો કોઈ અનિષ્ટ પ્રભાવ નથી'));
  });

  test('30. Localize Numerology Calculation & Profile in-place (?lang=mr and ?lang=gu) translates titles, planets, archetypes', () => {
    const rawCalc = {
      profile: { fullName: 'Arjun Sharma', dob: '1999-07-29' },
      birthNumber: {
        compound: 29,
        root: 2,
        title: 'Birth Number (Mulank / Psychic Number)',
        planetaryRuler: 'Moon',
        summary: 'Governs self-perception, natural instincts, and subconscious emotional patterns.',
      },
      destinyNumber: {
        compound: 47,
        root: 2,
        title: 'Destiny Number (Bhagyank / Life Path)',
        planetaryRuler: 'Moon',
        summary: 'You are sensitive, tactful, and diplomatic.',
      },
      nameNumber: {
        compound: 24,
        root: 6,
        title: 'Name Number (Namank)',
        planetaryRuler: 'Venus',
        summary: 'Governs public expression.',
      },
      quickActions: [
        { id: 'detailedAnalysis', title: 'Detailed Analysis', route: 'NumerologyDestinyDetail' },
        { id: 'calculationBreakdown', title: 'Calculation Breakdown', route: 'NumerologyCalculationBreakdown' },
      ],
    };

    // Marathi
    const locMr = i18n.localizeNumerology(rawCalc, 'mr');
    assert.ok(locMr.birthNumber.title.includes('मूलांक'));
    assert.ok(locMr.birthNumber.planetaryRuler.includes('चंद्र'));
    assert.ok(locMr.birthNumber.archetype.includes('शांतीदूत'));
    assert.ok(locMr.destinyNumber.title.includes('भाग्यांक'));
    assert.ok(locMr.destinyNumber.planetaryRuler.includes('चंद्र'));
    assert.ok(locMr.nameNumber.title.includes('नामांक'));
    assert.ok(locMr.nameNumber.planetaryRuler.includes('शुक्र'));
    assert.ok(locMr.quickActions[0].title.includes('सविस्तर विश्लेषण'));
    assert.ok(locMr.quickActions[1].title.includes('गणना तपशील'));

    // Gujarati
    const locGu = i18n.localizeNumerology(rawCalc, 'gu');
    assert.ok(locGu.birthNumber.title.includes('મૂળાંક'));
    assert.ok(locGu.birthNumber.planetaryRuler.includes('ચંદ્ર'));
    assert.ok(locGu.destinyNumber.title.includes('ભાગ્યાંક'));
    assert.ok(locGu.nameNumber.title.includes('નામાંક'));
    assert.ok(locGu.nameNumber.planetaryRuler.includes('શુક્ર'));
    assert.ok(locGu.quickActions[0].title.includes('વિગતવાર વિશ્લેષણ'));
    assert.ok(locGu.quickActions[1].title.includes('ગણતરી વિગતો'));
  });

  test('31. Localize Numerology Kundali Alignment (?lang=mr and ?lang=gu) translates headline, alignment cards, signs and planets', () => {
    const rawAlignment = {
      destinyNumber: 2,
      numerologyPlanet: 'Moon (Chandra)',
      kundaliSign: 'Cancer (Karka)',
      kundaliHouse: 4,
      moonStrength: 'Swakshetra (Own Sign) / High Dignity',
      headline: 'Your Destiny Number (2) is influenced by the Moon, which is also strong in your Kundali (Cancer placement).',
      alignmentCards: [
        {
          id: 'planetaryAlignment',
          title: 'Planetary Alignment',
          value: 'Moon (Numerology) ↔ Moon (Kundali)',
          relationship: 'Direct Harmonic Resonance',
        },
        {
          id: 'combinedInfluence',
          title: 'Combined Influence',
          value: 'Enhances intuition, emotional balance and relationship harmony.',
          description: 'The synchronicity between your Bhagyank 2 and natal Moon placement bestows profound empathy.',
        },
        {
          id: 'bhavaSynthesis',
          title: 'Rashi & Bhava Synthesis',
          value: '4th Bhava resonance',
          description: 'Governed by Chandra Deva, your life trajectory aligns with 4th Bhava security.',
        },
      ],
    };

    // Marathi
    const locMr = i18n.localizeNumerology(rawAlignment, 'mr');
    assert.ok(locMr.numerologyPlanet.includes('चंद्र'));
    assert.ok(locMr.kundaliSign.includes('कर्क'));
    assert.ok(locMr.moonStrength.includes('स्वराशी'));
    assert.ok(locMr.headline.includes('भाग्यांक (२)'));
    assert.ok(locMr.headline.includes('चंद्र'));
    assert.strictEqual(locMr.alignmentCards[0].title, 'ग्रह समन्वय');
    assert.strictEqual(locMr.alignmentCards[0].relationship, 'थेट सुसंवादी अनुनाद');
    assert.strictEqual(locMr.alignmentCards[1].title, 'संयुक्त प्रभाव');
    assert.ok(locMr.alignmentCards[1].value.includes('अंतर्ज्ञान, भावनिक संतुलन'));
    assert.strictEqual(locMr.alignmentCards[2].title, 'राशी व भाव समन्वय');
    assert.ok(locMr.alignmentCards[2].value.includes('भावाचा अनुनाद'));

    // Gujarati
    const locGu = i18n.localizeNumerology(rawAlignment, 'gu');
    assert.ok(locGu.numerologyPlanet.includes('ચંદ્ર'));
    assert.ok(locGu.kundaliSign.includes('કર્ક'));
    assert.strictEqual(locGu.alignmentCards[0].title, 'ગ્રહ સુમેળ');
    assert.strictEqual(locGu.alignmentCards[1].title, 'સંયુક્ત પ્રભાવ');
  });

  test('32. Localize Numerology Compatibility (?lang=mr and ?lang=gu) translates harmony rating, verdict, strengths and growth areas', () => {
    const rawCompat = {
      yourName: 'Arjun Sharma',
      partnerName: 'Kavya Mehta',
      compatibilityScore: 84,
      verdict: 'A harmonious and supportive match with long-term potential.',
      harmonyRating: 'Very High',
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

    // Marathi
    const locMr = i18n.localizeNumerology(rawCompat, 'mr');
    assert.ok(locMr.harmonyRating.includes('अति उच्च'));
    assert.ok(locMr.verdict.includes('दीर्घकालीन क्षमतेसह'));
    assert.ok(locMr.strengths[0].includes('नैसर्गिक भावनिक जिव्हाळा'));
    assert.ok(locMr.strengths[1].includes('समान कलात्मक अभिरुची'));
    assert.ok(locMr.growthAreas[0].includes('न बोललेल्या अपेक्षा'));

    // Gujarati
    const locGu = i18n.localizeNumerology(rawCompat, 'gu');
    assert.ok(locGu.harmonyRating.includes('અતિ ઉચ્ચ'));
    assert.ok(locGu.verdict.includes('લાંબા ગાળાની સંભાવના'));
    assert.ok(locGu.strengths[0].includes('કુદરતી લાગણીશીલ આત્મીયતા'));
    assert.ok(locGu.growthAreas[0].includes('અપેક્ષાઓ ખુલ્લા મને'));
  });

  test('33. Localize Daily Guidance Lucky Elements (?lang=mr and ?lang=gu) translates colorName, direction, and gemstone', () => {
    const rawGuidance = {
      timeframe: 'Today',
      dayName: 'Tuesday',
      luckyElements: {
        colorName: 'Saffron',
        direction: 'East',
        gemstone: 'Emerald',
        luckyNumber: 5,
      },
      domains: {
        career: { title: 'Career', description: 'Good progress' },
      },
    };

    // Marathi
    const locMr = i18n.localizeGuidance(rawGuidance, 'mr');
    assert.strictEqual(locMr.luckyElements.colorName, 'भगवा');
    assert.strictEqual(locMr.luckyElements.direction, 'पूर्व');
    assert.ok(locMr.luckyElements.gemstone.includes('पाचू'));

    // Gujarati
    const locGu = i18n.localizeGuidance(rawGuidance, 'gu');
    assert.strictEqual(locGu.luckyElements.colorName, 'કેસરી');
    assert.strictEqual(locGu.luckyElements.direction, 'પૂર્વ');
    assert.ok(locGu.luckyElements.gemstone.includes('પન્ના'));
  });

  test('34. Localize Reports Catalog (?lang=mr and ?lang=gu) translates catalog item titles and descriptions', () => {
    const rawCatalog = [
      { id: 'kundali', title: 'Full Kundali Report', description: 'Complete analysis of your birth chart with detailed insights.', iconKey: 'report_kundali' },
      { id: 'career', title: 'Career Report', description: 'Opportunities, growth periods and guidance for your profession.', iconKey: 'report_career' },
      { id: 'marriage', title: 'Marriage & Relationship Report', description: 'Compatibility, timing and guidance for a happy relationship.', iconKey: 'report_marriage' },
    ];

    // Marathi
    const locMr = i18n.localizeReportCatalog(rawCatalog, 'mr');
    assert.strictEqual(locMr[0].title, 'संपूर्ण कुंडली अहवाल');
    assert.ok(locMr[0].description.includes('जन्मपत्रिकेचे संपूर्ण विश्लेषण'));
    assert.strictEqual(locMr[1].title, 'करिअर व व्यवसाय अहवाल');
    assert.strictEqual(locMr[2].title, 'विवाह व नातेसंबंध अहवाल');

    // Gujarati
    const locGu = i18n.localizeReportCatalog(rawCatalog, 'gu');
    assert.strictEqual(locGu[0].title, 'સંપૂર્ણ કુંડળી રિપોર્ટ');
    assert.strictEqual(locGu[1].title, 'કારકિર્દી રિપોર્ટ');
    assert.strictEqual(locGu[2].title, 'લગ્ન અને સંબંધ રિપોર્ટ');

    // Message translation check
    assert.strictEqual(i18n.t('Report catalog fetched successfully', 'mr'), 'अहवाल कॅटलॉग यशस्वीरीत्या प्राप्त झाला');
    assert.strictEqual(i18n.t('Report catalog fetched successfully', 'gu'), 'રિપોર્ટ કેટલોગ સફળતાપૂર્વક પ્રાપ્ત થયો');
  });

  test('35. Kundali Overview localizes houses (signName, signSanskrit, planets), chart ayanamsa, panchang ayanamsa across 12 languages', () => {
    const rawOverview = {
      summary: {
        rashi: { english: 'Scorpio', sanskrit: 'Vrischika', lord: 'Mars' },
        lagna: { english: 'Aries', sanskrit: 'Mesha', lord: 'Mars' },
      },
      chart: {
        chartLabel: 'D1 Rashi Chart (Whole-Sign)',
        ayanamsa: 'Lahiri',
        houses: [
          { houseNumber: 1, signNumber: 1, signName: 'Aries', signSanskrit: 'Mesha', planets: ['Sun', 'Mercury'], signLord: 'Mars' },
          { houseNumber: 8, signNumber: 8, signName: 'Scorpio', signSanskrit: 'Vrischika', planets: ['Mars'], signLord: 'Mars' },
        ],
      },
      panchang: {
        ayanamsa: { name: 'Lahiri' },
      },
      calculation: {
        ayanamsa: 'Lahiri',
      },
    };

    const langs = ['mr', 'hi', 'gu', 'bn', 'ta', 'te', 'kn', 'ml', 'pa', 'or', 'as', 'ur'];
    for (const lang of langs) {
      const loc = i18n.localizeKundali(rawOverview, lang);
      assert.ok(loc.chart.ayanamsa.includes('Lahiri'));
      assert.notStrictEqual(loc.chart.ayanamsa, 'Lahiri', `chart.ayanamsa should be localized in ${lang}`);
      assert.notStrictEqual(loc.panchang.ayanamsa.name, 'Lahiri', `panchang.ayanamsa should be localized in ${lang}`);
      assert.notStrictEqual(loc.calculation.ayanamsa, 'Lahiri', `calculation.ayanamsa should be localized in ${lang}`);
      assert.notStrictEqual(loc.chart.houses[0].signSanskrit, 'Mesha', `signSanskrit should be localized in ${lang}`);
      assert.notStrictEqual(loc.chart.houses[0].planets[0], 'Sun', `planets should be localized in ${lang}`);
    }
  });

  test('36. Kundali Bhavas interpretation (summary, positiveFactors, challengeFactors) localizes across 12 languages', () => {
    const rawBhavas = {
      bhavas: [
        {
          number: 1,
          title: 'First House',
          sanskritName: 'Tanu Bhava',
          sign: 'Scorpio',
          signLord: 'Mars',
          houseLord: { planet: 'Mars', houseNumber: 9 },
          planetsPresent: ['Mars'],
          interpretation: {
            summary: 'The Self & Personality (Tanu Bhava) is situated in Scorpio and governed by Mars. Its lord is positioned in the 9th House.',
            positiveFactors: ['Planetary presence: Mars', 'Sustained through lord Mars'],
            challengeFactors: ['Under Parashari aspect from natural malefics'],
          },
        },
      ],
    };

    const langs = ['mr', 'hi', 'gu', 'bn', 'ta', 'te', 'kn', 'ml', 'pa', 'or', 'as', 'ur'];
    for (const lang of langs) {
      const loc = i18n.localizeKundali(rawBhavas, lang);
      const interp = loc.bhavas[0].interpretation;
      assert.ok(interp.summary, `Summary should exist for ${lang}`);
      assert.notStrictEqual(interp.summary, rawBhavas.bhavas[0].interpretation.summary, `Summary should be translated for ${lang}`);
      assert.ok(interp.positiveFactors[0], `positiveFactors should exist for ${lang}`);
      assert.ok(interp.positiveFactors[1], `sustained lord should exist for ${lang}`);
      assert.ok(interp.challengeFactors[0], `challengeFactors should exist for ${lang}`);
    }
  });

  test('37. Kundali Bhavas nodeInterpretations (positivePossibilities, potentialChallenges, divisionalReference, methodologyNote) localizes across 12 languages', () => {
    const rawNodeBhava = {
      bhavas: [
        {
          number: 4,
          title: 'Fourth House',
          sanskritName: 'Sukha Bhava',
          sign: 'Aquarius',
          signLord: 'Saturn',
          nodeInterpretations: [
            {
              planet: 'Ketu',
              houseNumber: 4,
              methodology: 'Parashari',
              positivePossibilities: [
                'Strong natural inclination toward meditation, self-inquiry, and emotional detachment',
              ],
              potentialChallenges: [
                'Feelings of restlessness, emotional isolation, or difficulty finding contentment at home',
              ],
              chartContext: {
                sign: 'Aquarius',
                dispositor: 'Saturn',
                divisionalReference: 'Confirm with D9 (Navamsha) and D10 (Dashamsha) charts before forming definitive conclusions.',
                methodologyNote: 'Strictly based on Parashari principles (distinct from Lal Kitab rules).',
              },
            },
          ],
        },
      ],
    };

    const langs = ['mr', 'hi', 'gu', 'bn', 'ta', 'te', 'kn', 'ml', 'pa', 'or', 'as', 'ur'];
    for (const lang of langs) {
      const loc = i18n.localizeKundali(rawNodeBhava, lang);
      const node = loc.bhavas[0].nodeInterpretations[0];
      assert.ok(node.positivePossibilities.length > 0);
      assert.ok(node.potentialChallenges.length > 0);
      assert.notStrictEqual(node.chartContext.divisionalReference, rawNodeBhava.bhavas[0].nodeInterpretations[0].chartContext.divisionalReference, `divisionalReference should be translated for ${lang}`);
      assert.notStrictEqual(node.chartContext.methodologyNote, rawNodeBhava.bhavas[0].nodeInterpretations[0].chartContext.methodologyNote, `methodologyNote should be translated for ${lang}`);
    }
  });

  test('38. Kundali Yogas localizes sourceReference, sourceReferences, planets, badgeType, and methodology', () => {
    const rawYogas = {
      methodology: 'Parashari',
      ayanamsa: 'Lahiri',
      yogas: [
        {
          id: 'gajakesari-yoga',
          title: 'Gajakesari Yoga',
          badgeType: 'benefic',
          badge: 'benefic',
          methodology: 'Parashari',
          planets: ['Jupiter', 'Moon'],
          planetsInvolved: ['Jupiter', 'Moon'],
          sourceReference: 'Brihat Parashara Hora Shastra',
          sourceReferences: ['Brihat Parashara Hora Shastra', 'Saravali'],
        },
      ],
    };

    const locMr = i18n.localizeKundali(rawYogas, 'mr');
    assert.strictEqual(locMr.yogas[0].badgeType, 'शुभ योग (Benefic)');
    assert.strictEqual(locMr.yogas[0].methodology, 'पराशरी');
    assert.ok(locMr.yogas[0].planets[0].includes('गुरू'));
    assert.ok(locMr.yogas[0].sourceReference.includes('बृहत् पराशर होरा शास्त्र'));
    assert.ok(locMr.yogas[0].sourceReferences[1].includes('सारावली'));

    const locGu = i18n.localizeKundali(rawYogas, 'gu');
    assert.strictEqual(locGu.yogas[0].badgeType, 'શુભ યોગ (Benefic)');
    assert.strictEqual(locGu.yogas[0].methodology, 'પારાશરી');
    assert.ok(locGu.yogas[0].planets[0].includes('ગુરુ'));
    assert.ok(locGu.yogas[0].sourceReference.includes('બૃહત્ પારાશર હોરા શાસ્ત્ર'));
  });

  test('39. Kundali Transits localizes signSanskrit in lagnaTransitChart, moonTransitChart, and transitingPlanets', () => {
    const rawTransits = {
      lagnaTransitChart: {
        houses: [
          { houseNumber: 1, signName: 'Scorpio', signSanskrit: 'Vrischika', planets: ['Sun'] },
        ],
      },
      moonTransitChart: {
        houses: [
          { houseNumber: 1, signName: 'Aries', signSanskrit: 'Mesha', planets: ['Mars'] },
        ],
      },
      transitingPlanets: [
        { id: 'jupiter', name: 'Jupiter', sign: 'Taurus', signSanskrit: 'Vrishabha' },
      ],
    };

    const locMr = i18n.localizeKundali(rawTransits, 'mr');
    assert.strictEqual(locMr.lagnaTransitChart.houses[0].signSanskrit, 'वृश्चिक (Vrischika)');
    assert.strictEqual(locMr.moonTransitChart.houses[0].signSanskrit, 'मेष (Mesha)');
    assert.strictEqual(locMr.transitingPlanets[0].signSanskrit, 'वृषभ (Vrishabha)');

    const locTa = i18n.localizeKundali(rawTransits, 'ta');
    assert.strictEqual(locTa.lagnaTransitChart.houses[0].signSanskrit, 'விருச்சிகம் (Vrischika)');
    assert.strictEqual(locTa.moonTransitChart.houses[0].signSanskrit, 'மேஷம் (Mesha)');
    assert.strictEqual(locTa.transitingPlanets[0].signSanskrit, 'ரிஷபம் (Vrishabha)');
  });

  test('40. Kundali Ashtakavarga localizes sign across sarvashtakavarga and bhinnaAshtakavarga', () => {
    const rawAshtakavarga = {
      sarvashtakavarga: {
        totalBindus: 337,
        signBindus: [
          { signNumber: 1, sign: 'Aries', bindus: 28 },
          { signNumber: 8, sign: 'Scorpio', bindus: 34 },
        ],
      },
      bhinnaAshtakavarga: [
        {
          planet: 'Sun',
          signBindus: [
            { signNumber: 1, sign: 'Aries', bindus: 4 },
          ],
        },
      ],
    };

    const locMr = i18n.localizeKundali(rawAshtakavarga, 'mr');
    assert.ok(locMr.sarvashtakavarga.signBindus[0].sign.includes('मेष'));
    assert.ok(locMr.sarvashtakavarga.signBindus[1].sign.includes('वृश्चिक'));
    assert.ok(locMr.bhinnaAshtakavarga[0].signBindus[0].sign.includes('मेष'));

    const locGu = i18n.localizeKundali(rawAshtakavarga, 'gu');
    assert.ok(locGu.sarvashtakavarga.signBindus[0].sign.includes('મેષ'));
    assert.ok(locGu.sarvashtakavarga.signBindus[1].sign.includes('વૃશ્ચિક'));
  });

  test('41. Kundali Doshas localizes checkedFrom and ruleDetails reference', () => {
    const rawDoshas = {
      manglik: {
        isPresent: true,
        checkedFrom: ['LAGNA', 'MOON', 'VENUS'],
        ruleDetails: [
          { reference: 'LAGNA', marsHouse: 1, isAfflicted: true, description: 'Mars in House 1' },
          { reference: 'MOON', marsHouse: 7, isAfflicted: true, description: 'Mars in House 7' },
        ],
      },
    };

    const locMr = i18n.localizeKundali(rawDoshas, 'mr');
    assert.strictEqual(locMr.manglik.checkedFrom[0], 'लग्न (Lagna)');
    assert.strictEqual(locMr.manglik.checkedFrom[1], 'चंद्र (Chandra)');
    assert.strictEqual(locMr.manglik.checkedFrom[2], 'शुक्र (Shukra)');
    assert.strictEqual(locMr.manglik.ruleDetails[0].reference, 'लग्न (Lagna)');
    assert.strictEqual(locMr.manglik.ruleDetails[1].reference, 'चंद्र (Chandra)');

    const locGu = i18n.localizeKundali(rawDoshas, 'gu');
    assert.strictEqual(locGu.manglik.checkedFrom[0], 'લગ્ન (Lagna)');
    assert.strictEqual(locGu.manglik.checkedFrom[1], 'ચંદ્ર (Chandra)');
  });

  test('42. Kundali Recommendations localizes mantra, lifeStone name and regionalName, and rudraksha mantra', () => {
    const rawRecs = {
      rudraksha: {
        recommendedMukhi: 1,
        name: '1 Mukhi Rudraksha',
        rulingPlanet: 'Sun',
        mantra: 'Om Hreem Namah',
      },
      gemstones: {
        lifeStone: {
          name: 'Yellow Sapphire',
          regionalName: 'Pukhraj',
          planet: 'Jupiter',
          mantra: 'Om Graam Greem Graum Sah Gurave Namah',
        },
      },
    };

    const locMr = i18n.localizeKundali(rawRecs, 'mr');
    assert.strictEqual(locMr.rudraksha.name, '१-मुखी रुद्राक्ष');
    assert.strictEqual(locMr.rudraksha.mantra, 'ॐ ह्रीं नमः');
    assert.strictEqual(locMr.gemstones.lifeStone.name, 'पुष्कराज (Yellow Sapphire)');
    assert.strictEqual(locMr.gemstones.lifeStone.regionalName, 'पुष्कराज');
    assert.strictEqual(locMr.gemstones.lifeStone.mantra, 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः');

    const locGu = i18n.localizeKundali(rawRecs, 'gu');
    assert.strictEqual(locGu.rudraksha.name, '૧-મુખી રુદ્રાક્ષ');
    assert.strictEqual(locGu.rudraksha.mantra, 'ૐ હ્રીં નમઃ');
    assert.strictEqual(locGu.gemstones.lifeStone.name, 'પોખરાજ (Yellow Sapphire)');
    assert.strictEqual(locGu.gemstones.lifeStone.regionalName, 'પોખરાજ');
    assert.strictEqual(locGu.gemstones.lifeStone.mantra, 'ૐ ગ્રાં ગ્રીં ગ્રોં સઃ ગુરવે નમઃ');
  });

  test('43. Matchmaking details localizes detailedAspects details, ashtakootaGunas koota, and overallRecommendation title', () => {
    const rawMatchDetails = {
      detailedAspects: [
        {
          id: 'emotional',
          title: 'Emotional Compatibility',
          score: '100%',
          description: 'Deep mutual feeling',
          details: 'Bhakoot score of 7/7 and Moon planetary rapport reflect emotional harmony and natural support.',
        },
        {
          id: 'harmony',
          title: 'Long-term Harmony',
          score: '100%',
          description: 'Long-term stability',
          details: 'Nadi score of 8/8 (Aadi & Madhya) alongside Tara score of 3/3 points assures long-term vitality.',
        },
      ],
      ashtakootaGunas: [
        { koota: 'Varna', maxPoints: 1, obtained: 1, description: 'Spiritual compatibility and ego harmony' },
        { koota: 'Nadi', maxPoints: 8, obtained: 8, description: 'Genetic compatibility' },
      ],
      overallRecommendation: {
        title: 'Overall Recommendation',
        verdict: 'Highly Auspicious Match',
        summary: 'This union demonstrates a 78% match (28 out of 36 Gunas).',
      },
    };

    const locMr = i18n.localizeMatchmaking(rawMatchDetails, 'mr');
    assert.ok(locMr.detailedAspects[0].details.includes('भकूट गुण'));
    assert.ok(locMr.detailedAspects[1].details.includes('नाडी गुण'));
    assert.ok(locMr.ashtakootaGunas[0].koota.includes('वर्ण'));
    assert.ok(locMr.ashtakootaGunas[1].koota.includes('नाडी'));
    assert.strictEqual(locMr.overallRecommendation.title, 'सर्वसमावेशक शिफारस (Overall Recommendation)');

    const locGu = i18n.localizeMatchmaking(rawMatchDetails, 'gu');
    assert.ok(locGu.detailedAspects[0].details.includes('ભકૂટ ગુણ'));
    assert.ok(locGu.detailedAspects[1].details.includes('નાડી ગુણ'));
    assert.ok(locGu.ashtakootaGunas[0].koota.includes('વર્ણ'));
    assert.ok(locGu.ashtakootaGunas[1].koota.includes('નાડી'));
    assert.strictEqual(locGu.overallRecommendation.title, 'સમગ્ર ભલામણ (Overall Recommendation)');
  });

  test('44. Reports catalog localizes { reports: [...] } across all 12 languages', () => {
    const reportService = require('../src/services/report.service');
    const rawCatalog = reportService.getCatalog();
    assert.ok(Array.isArray(rawCatalog.reports));

    const mrCatalog = i18n.localizeReportCatalog(rawCatalog.reports, 'mr');
    assert.strictEqual(mrCatalog[0].title, 'संपूर्ण कुंडली अहवाल');
    assert.ok(mrCatalog[0].description.includes('तुमच्या जन्मपत्रिकेचे संपूर्ण विश्लेषण'));

    const hiCatalog = i18n.localizeReportCatalog(rawCatalog.reports, 'hi');
    assert.strictEqual(hiCatalog[0].title, 'संपूर्ण कुंडली रिपोर्ट');

    const guCatalog = i18n.localizeReportCatalog(rawCatalog.reports, 'gu');
    assert.strictEqual(guCatalog[0].title, 'સંપૂર્ણ કુંડળી રિપોર્ટ');

    const taCatalog = i18n.localizeReportCatalog(rawCatalog.reports, 'ta');
    assert.strictEqual(taCatalog[0].title, 'முழு ஜாதக அறிக்கை');
  });

  test('45. /numerology/personal-cycles localizes personalYear, personalMonth, personalDay, and multiYearForecast across languages', () => {
    const numerologyService = require('../src/services/numerology.service');
    const rawCycles = numerologyService.getPersonalCyclesForecast('1995-10-24', 2026);

    const mrCycles = i18n.localizeNumerology(rawCycles, 'mr');
    assert.ok(mrCycles.personalYear.theme.includes('आर्थिक यश') || mrCycles.personalYear.theme.includes('सक्षमीकरणाचे वर्ष'));
    assert.ok(Array.isArray(mrCycles.personalYear.focusAreas));
    assert.ok(mrCycles.personalYear.focusAreas[0].includes('करिअरमधील') || mrCycles.personalYear.focusAreas[0].includes('प्रशासकीय'));
    assert.ok(mrCycles.personalMonth.theme.includes('सुरुवात') || mrCycles.personalMonth.theme.includes('पहिली पावले'));
    assert.ok(mrCycles.personalDay.theme && typeof mrCycles.personalDay.theme === 'string' && mrCycles.personalDay.theme.length > 5);
    assert.strictEqual(mrCycles.personalDay.label, 'आज');
    assert.ok(mrCycles.multiYearForecast[0].theme.includes('जबाबदारी') || mrCycles.multiYearForecast[0].theme.includes('नातेसंबंध'));

    const bnCycles = i18n.localizeNumerology(rawCycles, 'bn');
    assert.ok(bnCycles.personalYear.theme.includes('বস্তুগত'));
    assert.strictEqual(bnCycles.personalDay.label, 'আজ');
  });

  test('46. /numerology/destiny/:number localizes title across languages', () => {
    const numerologyService = require('../src/services/numerology.service');
    const rawDestiny = numerologyService.getDestinyDeepAnalysis(2);
    assert.strictEqual(rawDestiny.title, 'Destiny Number (Life Path)');

    const mrDestiny = i18n.localizeNumerology(rawDestiny, 'mr');
    assert.strictEqual(mrDestiny.title, 'भाग्यांक (Destiny Number)');
    assert.strictEqual(mrDestiny.archetype, 'शांतीदूत व मुत्सद्दी (The Peacemaker & Diplomat)');

    const hiDestiny = i18n.localizeNumerology(rawDestiny, 'hi');
    assert.strictEqual(hiDestiny.title, 'भाग्यांक (Destiny Number)');

    const teDestiny = i18n.localizeNumerology(rawDestiny, 'te');
    assert.strictEqual(teDestiny.title, 'భాగ్యాంకం (Destiny Number)');
  });

  test('47. /numerology/core-numbers localizes title, category, and summary for all numbers', () => {
    const numerologyService = require('../src/services/numerology.service');
    const rawCore = numerologyService.getCoreNumbersSummary({ dob: '1995-10-24', fullName: 'Aarav Mehta' });

    const mrCore = i18n.localizeNumerology(rawCore, 'mr');
    assert.strictEqual(mrCore.coreNumbers[0].title, 'मूलांक (Birth Number)');
    assert.strictEqual(mrCore.coreNumbers[0].category, 'मूलांक (Psychic)');
    assert.ok(mrCore.coreNumbers[0].summary.includes('आत्म-धारणा'));

    assert.strictEqual(mrCore.coreNumbers[1].title, 'भाग्यांक (Destiny Number)');
    assert.strictEqual(mrCore.coreNumbers[1].category, 'भाग्यांक (Life Path)');

    assert.strictEqual(mrCore.coreNumbers[2].title, 'नामांक (Name Number)');
    assert.strictEqual(mrCore.coreNumbers[2].category, 'नामांक (Expression)');

    assert.strictEqual(mrCore.coreNumbers[3].title, 'वैयक्तिक वर्ष (Personal Year)');
    assert.strictEqual(mrCore.coreNumbers[3].category, 'वार्षिक चक्र');
    assert.ok(mrCore.coreNumbers[3].summary.includes('आर्थिक यश') || mrCore.coreNumbers[3].summary.includes('सक्षमीकरणाचे वर्ष'));

    assert.strictEqual(mrCore.coreNumbers[4].title, 'वैयक्तिक महिना (Personal Month)');
    assert.strictEqual(mrCore.coreNumbers[4].category, 'मासिक चक्र');
    assert.ok(mrCore.coreNumbers[4].summary.includes('सुरुवात') || mrCore.coreNumbers[4].summary.includes('पहिली पावले'));

    assert.strictEqual(mrCore.coreNumbers[5].title, 'वैयक्तिक दिवस (Personal Day)');
    assert.strictEqual(mrCore.coreNumbers[5].category, 'दैनिक चक्र');
    assert.ok(mrCore.coreNumbers[5].summary && typeof mrCore.coreNumbers[5].summary === 'string' && mrCore.coreNumbers[5].summary.length > 5);
  });

  test('48. /numerology/calculation-breakdown localizes system, systemNote, component, and vedicNote', () => {
    const numerologyService = require('../src/services/numerology.service');
    const rawCalc = numerologyService.getCalculationBreakdown('Aarav Mehta', '1995-10-24');

    const mrCalc = i18n.localizeNumerology(rawCalc, 'mr');
    assert.strictEqual(mrCalc.nameBreakdown.system, 'काल्डियन अंकशास्त्र (Chaldean Numerology)');
    assert.ok(mrCalc.nameBreakdown.systemNote.includes('काल्डियन अंकशास्त्रानुसार'));
    assert.ok(mrCalc.destinyBreakdown.vedicNote.includes('वैदिक संख्या शास्त्रानुसार'));
    assert.strictEqual(mrCalc.destinyBreakdown.steps[0].component, 'जन्माचा दिवस (24)');
    assert.strictEqual(mrCalc.destinyBreakdown.steps[1].component, 'जन्माचा महिना (10)');
    assert.strictEqual(mrCalc.destinyBreakdown.steps[2].component, 'जन्माचे वर्ष (1995)');

    const hiCalc = i18n.localizeNumerology(rawCalc, 'hi');
    assert.strictEqual(hiCalc.nameBreakdown.system, 'काल्डियन अंकशास्त्र (Chaldean Numerology)');
    assert.ok(hiCalc.nameBreakdown.systemNote.includes('काल्डियन अंकशास्त्र के अनुसार'));
    assert.strictEqual(hiCalc.destinyBreakdown.steps[0].component, 'जन्म का दिन (24)');
  });

  test('49. /numerology/compatibility localizes planetarySynergy across languages', () => {
    const numerologyService = require('../src/services/numerology.service');
    const rawCompat = numerologyService.calculateCompatibility(
      { fullName: 'Aarav Mehta', dob: '1995-10-24' },
      { fullName: 'Priya Sharma', dob: '1997-04-15' }
    );
    assert.strictEqual(rawCompat.planetarySynergy, 'Sun (Destiny 1) & Jupiter (Name 3) harmonious interaction');

    const mrCompat = i18n.localizeNumerology(rawCompat, 'mr');
    assert.strictEqual(mrCompat.planetarySynergy, 'सूर्य (Surya) (भाग्यांक 1) आणि गुरू (Guru) (नामांक 3) सुसंवादी प्रभाव');

    const hiCompat = i18n.localizeNumerology(rawCompat, 'hi');
    assert.strictEqual(hiCompat.planetarySynergy, 'सूर्य (Surya) (भाग्यांक 1) और गुरु / बृहस्पति (Guru) (नामांक 3) सामंजस्यपूर्ण प्रभाव');

    const guCompat = i18n.localizeNumerology(rawCompat, 'gu');
    assert.strictEqual(guCompat.planetarySynergy, 'સૂર્ય (Surya) (ભાગ્યાંક 1) અને ગુરુ (Guru) (નામાંક 3) સુમેળભર્યો પ્રભાવ');
  });

  test('50. i18n middleware intercepts { reports: [...] } and /numerology/personal-cycles', () => {
    const i18nMiddleware = require('../src/middlewares/i18n.middleware');
    const reportService = require('../src/services/report.service');
    const numerologyService = require('../src/services/numerology.service');

    // Test 1: { reports: [...] }
    const req1 = { query: { lang: 'mr' }, headers: {}, body: {} };
    let capturedBody1 = null;
    const res1 = {
      setHeader: () => {},
      json: (b) => { capturedBody1 = b; return b; }
    };
    i18nMiddleware(req1, res1, () => {});
    res1.json({
      success: true,
      message: 'Reports catalog fetched',
      data: reportService.getCatalog()
    });
    assert.strictEqual(capturedBody1.language, 'mr');
    assert.strictEqual(capturedBody1.data.reports[0].title, 'संपूर्ण कुंडली अहवाल');

    // Test 2: personal-cycles
    const req2 = { query: { lang: 'mr' }, headers: {}, body: {} };
    let capturedBody2 = null;
    const res2 = {
      setHeader: () => {},
      json: (b) => { capturedBody2 = b; return b; }
    };
    i18nMiddleware(req2, res2, () => {});
    res2.json({
      success: true,
      message: 'Personal cycles fetched',
      data: numerologyService.getPersonalCyclesForecast('1995-10-24', 2026)
    });
    assert.strictEqual(capturedBody2.language, 'mr');
    assert.ok(capturedBody2.data.personalYear.theme.includes('सक्षमीकरणाचे वर्ष') || capturedBody2.data.personalYear.theme.includes('आर्थिक यश'));
    assert.strictEqual(capturedBody2.data.personalDay.label, 'आज');
  });
});

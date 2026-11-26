// Assumption: High-performance in-memory internationalization engine supporting 12 Indian languages + English.
const fs = require('fs');
const path = require('path');
const {
  getLocalizedDestinyDetails,
  getLocalizedDestinyTitle,
  getLocalizedPersonalYearTheme,
  getLocalizedPersonalMonthTheme,
  getLocalizedPersonalDayTheme,
  getLocalizedCoreTitle,
  getLocalizedCoreSummary,
  getLocalizedDayLabel,
  getLocalizedCalculationComponent,
  getLocalizedPlanetarySynergy,
  QUICK_ACTIONS_CONTENT,
  CORE_CATEGORIES,
  KUNDALI_ALIGNMENT_CONTENT,
  COMPATIBILITY_CONTENT,
  CALCULATION_BREAKDOWN_CONTENT,
} = require('./content/numerologyContent');
const {
  getLocalizedMatchmakingRecommendation,
  getLocalizedKootaDescription,
  HIGHLIGHTS_MAP,
  DETAILED_ASPECTS_MAP,
  MANGLIK_ANALYSIS_CONTENT,
  OVERALL_MATCH_CONTENT,
  ASHTAKOOTA_NAMES,
  OVERALL_RECOMMENDATION_TITLES,
  getLocalizedAspectDetails,
} = require('./content/matchmakingContent');
const {
  DASHBOARD_CONTENT,
  localizeTithi,
} = require('./content/dashboardContent');
const {
  GUIDANCE_CONTENT,
  DIRECTIONS_MAP,
  COLORS_MAP,
} = require('./content/guidanceContent');
const {
  REPORT_CONTENT,
} = require('./content/reportContent');
const {
  ELEMENTS_MAP,
  DAYS_MAP,
  TIMEFRAMES_MAP,
  BHAVAS_CONTENT,
  DOSHAS_CONTENT,
  RUDRAKSHA_NAMES,
  DEITIES_MAP,
  METALS_MAP,
  FINGERS_MAP,
  RECOMMENDATIONS_TEXT,
  YOGAS_MAP,
  VARGAS_MAP,
  DASHA_DESCRIPTIONS,
  AYANAMSA_MAP,
  SANSKRIT_RASHIS_MAP,
  SANSKRIT_TO_ENGLISH_RASHI,
  CHECKED_FROM_MAP,
  DOSHA_REFERENCES_MAP,
  YOGA_BADGE_MAP,
  METHODOLOGY_MAP,
  CHART_LABELS_MAP,
  GEMSTONES_CONTENT_MAP,
  RUDRAKSHA_MANTRAS_MAP,
  BHAVA_INTERPRETATION_TEMPLATES,
  resolveLang,
} = require('./content/astrologyContent');
const {
  THEMES_MAP,
  RAHU_INTERPRETATIONS,
  KETU_INTERPRETATIONS,
  NODE_DETAILS_MAP,
  DIVISIONAL_REFERENCE_MAP,
  METHODOLOGY_NOTE_MAP,
  DISCLAIMER_MAP,
  translateAstrologicalText,
} = require('./content/nodeContent');

const localesDir = path.join(__dirname, 'locales');
const locales = {};

// Load all locale files at startup into memory
try {
  const files = fs.readdirSync(localesDir);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const code = path.basename(file, '.json');
      const content = fs.readFileSync(path.join(localesDir, file), 'utf8');
      locales[code] = JSON.parse(content);
    }
  }
} catch (e) {
  console.error('Failed to load i18n locales:', e);
}

const SUPPORTED_CODES = ['en', 'mr', 'hi', 'gu', 'bn', 'ta', 'te', 'kn', 'ml', 'pa', 'or', 'as', 'ur'];

const LANGUAGE_METADATA = SUPPORTED_CODES.map((code) => {
  const loc = locales[code] || {};
  return {
    code,
    name: loc.name || code,
    nativeName: loc.nativeName || code,
    appName: loc.appName || 'Vidhilikhit',
    direction: loc.direction || 'ltr',
    isDefault: code === 'en',
  };
});

const MOON_STRENGTH_MAP = {
  mr: 'स्वराशी / उच्च प्रतिष्ठा (Favorable Placement)',
  hi: 'स्वराशि / उच्च प्रतिष्ठा (Favorable Placement)',
  gu: 'સ્વરાશિ / ઉચ્ચ પ્રતિષ્ઠા (Favorable Placement)',
  bn: 'স্বক্ষেত্র / উচ্চ মর্যাদা (Favorable Placement)',
  ta: 'ஆட்சி / உச்ச நிலை (Favorable Placement)',
  te: 'స్వక్షేత్రం / ఉచ్ఛ స్థితి (Favorable Placement)',
  kn: 'ಸ್ವಕ್ಷೇತ್ರ / ಉಚ್ಚ ಸ್ಥಾನ (Favorable Placement)',
  ml: 'സ്വക്ഷേത്രം / ഉച്ചസ്ഥിതി (Favorable Placement)',
  pa: 'ਸਵੈਰਾਸ਼ੀ / ਉੱਚ ਸਥਿਤੀ (Favorable Placement)',
  or: 'ସ୍ୱରାଶି / ଉଚ୍ଚ ସ୍ଥିତି (Favorable Placement)',
  as: 'স্বক্ষেত্ৰ / উচ্চ স্থিতি (Favorable Placement)',
  ur: 'اپنا برج / اوج کا مقام (Favorable Placement)',
  en: 'Favorable Placement',
};

const NUM_LABEL_MAP = {
  mr: 'अंकशास्त्र',
  hi: 'अंकशास्त्र',
  gu: 'અંકશાસ્ત્ર',
  bn: 'সংখ্যা জ্যোতিষ',
  ta: 'எண்கணிதம்',
  te: 'సంఖ్యాశాస్త్రం',
  kn: 'ಸಂಖ್ಯಾಶಾಸ್ತ್ರ',
  ml: 'സംഖ്യാശാസ്ത്രം',
  pa: 'ਅੰਕ ਵਿਗਿਆਨ',
  or: 'ସଂଖ୍ୟା ଜ୍ୟୋତିଷ',
  as: 'সংখ্যা জ্যোতিষ',
  ur: 'علم الاعداد',
  en: 'Numerology',
};

const KUN_LABEL_MAP = {
  mr: 'कुंडली',
  hi: 'कुंडली',
  gu: 'કુંડળી',
  bn: 'কুণ্ডলী',
  ta: 'ஜாதகம்',
  te: 'కుండలి',
  kn: 'ಕುಂಡಲಿ',
  ml: 'ജാതകം',
  pa: 'ਕੁੰਡਲੀ',
  or: 'କୁଣ୍ଡଳୀ',
  as: 'কুণ্ডলী',
  ur: 'کنڈلی',
  en: 'Kundali',
};

const BHAVA_SUFFIX_MAP = {
  mr: 'भावाचा अनुनाद',
  hi: 'भाव का अनुनाद',
  gu: 'ભાવનો અનુનાદ',
  bn: 'ভাবের অনুরণন',
  ta: 'பாவத்தின் அதிர்வு',
  te: 'భావ అనునాదం',
  kn: 'ಭಾವದ ಅನುರಣನ',
  ml: 'ഭാവത്തിന്റെ പ്രതിധ്വനി',
  pa: 'ਭਾਵ ਦਾ ਗੂੰਜ',
  or: 'ଭାବର ପ୍ରଭାବ',
  as: 'ভাৱৰ অনুৰণন',
  ur: 'گھر کا گونج',
  en: 'Bhava resonance',
};

const MAHADASHA_SUFFIX_MAP = {
  mr: 'महादशा',
  hi: 'महादशा',
  gu: 'મહાદશા',
  bn: 'মহাদশা',
  ta: 'மகாதிசை',
  te: 'మహాదశ',
  kn: 'ಮಹಾದಶೆ',
  ml: 'മഹാദശ',
  pa: 'ਮਹਾਦਸ਼ਾ',
  or: 'ମହାଦଶା',
  as: 'মহাদশ',
  ur: 'مہادشا',
  en: 'Mahadasha',
};

const ANTARDASHA_SUFFIX_MAP = {
  mr: 'अंतर्दशा',
  hi: 'अंतर्दशा',
  gu: 'અંતર્દશા',
  bn: 'অন্তর্দশা',
  ta: 'அந்தர்திசை',
  te: 'అంతర్దశ',
  kn: 'ಅಂತರ್ದಶೆ',
  ml: 'അന്തർദശ',
  pa: 'ਅੰਤਰਦਸ਼ਾ',
  or: 'ଅନ୍ତର୍ଦଶା',
  as: 'অন্তৰ্দশা',
  ur: 'انتردشا',
  en: 'Antardasha',
};

const DOSHA_STATUS_MAP = {
  present: {
    mr: 'उपस्थित',
    hi: 'उपस्थित',
    gu: 'ઉપસ્થિત',
    bn: 'উপস্থিত',
    ta: 'உள்ளது',
    te: 'ఉన్నది',
    kn: 'ಇದೆ',
    ml: 'ഉണ്ട്',
    pa: 'ਮੌਜੂਦ',
    or: 'ଉପସ୍ଥିତ',
    as: 'উপস্থিত',
    ur: 'موجود',
    en: 'PRESENT',
  },
  notPresent: {
    mr: 'नाही',
    hi: 'नहीं',
    gu: 'નથી',
    bn: 'নেই',
    ta: 'இல்லை',
    te: 'లేదు',
    kn: 'ಇಲ್ಲ',
    ml: 'ഇല്ല',
    pa: 'ਨਹੀਂ',
    or: 'ନାହିଁ',
    as: 'নাই',
    ur: 'نہیں',
    en: 'NOT_PRESENT',
  },
};

const SHADBALA_UNIT_MAP = {
  mr: 'विरूपा (Virupa)',
  hi: 'विरूपा (Virupa)',
  gu: 'વિરૂપા (Virupa)',
  bn: 'ভিরূপা (Virupa)',
  ta: 'விருபா (Virupa)',
  te: 'విరూపా (Virupa)',
  kn: 'ವಿರೂಪ (Virupa)',
  ml: 'വിരൂപ (Virupa)',
  pa: 'ਵਿਰੂਪਾ (Virupa)',
  or: 'ବିରୂପା (Virupa)',
  as: 'বিৰূপা (Virupa)',
  ur: 'وروپا (Virupa)',
  en: 'Virupa',
};

const ABHIJIT_MUHURAT_MAP = {
  mr: 'अभिजित मुहूर्त',
  hi: 'अभिजित मुहूर्त',
  gu: 'અભિજિત મુહૂર્ત',
  bn: 'অভিজিৎ মুহূর্ত',
  ta: 'அபிஜித் முகூர்த்தம்',
  te: 'అభిజిత్ ముహూర్తం',
  kn: 'ಅಭಿಜಿತ್ ಮುಹೂರ್ತ',
  ml: 'അഭിജിത്ത് മുഹൂർത്തം',
  pa: 'ਅਭਿਜੀਤ ਮੁਹੂਰਤ',
  or: 'ଅଭିଜିତ ମୁହୂର୍ତ୍ତ',
  as: 'অভিজিৎ মুহূৰ্ত',
  ur: 'ابھجیت مہورت',
  en: 'Abhijit Muhurat',
};

const ENGLISH_TO_SANSKRIT_RASHI = {
  Aries: 'Mesha',
  Taurus: 'Vrishabha',
  Gemini: 'Mithuna',
  Cancer: 'Karka',
  Leo: 'Simha',
  Virgo: 'Kanya',
  Libra: 'Tula',
  Scorpio: 'Vrischika',
  Sagittarius: 'Dhanu',
  Capricorn: 'Makara',
  Aquarius: 'Kumbha',
  Pisces: 'Meena',
};

function normalizeGemstoneKey(raw) {
  if (!raw) return '';
  let str = String(raw).trim();
  str = str.replace(/\s*\([^)]*\)/g, '').trim();
  if (/coral/i.test(str)) return 'Red Coral';
  if (/diamond/i.test(str)) return 'Diamond';
  if (/yellow\s*sapphire/i.test(str)) return 'Yellow Sapphire';
  if (/blue\s*sapphire/i.test(str)) return 'Blue Sapphire';
  if (/ruby/i.test(str)) return 'Ruby';
  if (/pearl/i.test(str)) return 'Pearl';
  if (/emerald/i.test(str)) return 'Emerald';
  if (/hessonite/i.test(str)) return 'Hessonite';
  if (/cat/i.test(str)) return "Cat's Eye";
  return str;
}

function localizeParashariAspect(aspectType, lang = 'en') {
  if (!aspectType || typeof aspectType !== 'string' || lang === 'en') return aspectType;
  const devDigits = (d) => String(d).replace(/\d/g, (c) => ['०','१','२','३','४','५','६','७','८','९'][c]);

  const replacements = {
    mr: (d) => `${devDigits(d)} वी पराशरी दृष्टी`,
    hi: (d) => `${devDigits(d)}वीं पराशरीय दृष्टि`,
    gu: (d) => `${d}મી પારાશરી દ્રષ્ટિ`,
    bn: (d) => `${d}ম পরাশরী দৃষ্টি`,
    ta: (d) => `${d}ஆம் பராசர பார்வை`,
    te: (d) => `${d}వ పరాశరి దృష్టి`,
    kn: (d) => `${d}ನೇ ಪರಾಶರಿ ದೃಷ್ಟಿ`,
    ml: (d) => `${d}-ാം പരാശര ദൃഷ്ടി`,
    pa: (d) => `${d}ਵੀਂ ਪਰਾਸ਼ਰੀ ਦ੍ਰਿਸ਼ਟੀ`,
    or: (d) => `${d}ମ ପରାଶରୀ ଦୃଷ୍ଟି`,
    as: (d) => `${d}ম পৰাশৰী দৃষ্টি`,
    ur: (d) => `${d}ویں پراشری نظر`,
  };

  const replacer = replacements[lang] || replacements['hi'] || replacements['mr'];
  return aspectType.replace(/(\d+)(?:st|nd|rd|th)?\s*Parashari\s*Drishti/gi, (_, d) => replacer(d));
}

function localizeSourceReference(ref, lang = 'en') {
  if (!ref || typeof ref !== 'string' || lang === 'en') return ref;
  if (DOSHA_REFERENCES_MAP[ref]) {
    return resolveLang(DOSHA_REFERENCES_MAP[ref], lang) || ref;
  }

  const refDictionary = {
    'Brihat Parashara Hora Shastra (BPHS) — Chapter on Stri Jataka & Kuja Dosha': {
      mr: 'बृहत् पराशर होरा शास्त्र (BPHS) — स्त्री जातक व कुज दोष अध्याय',
      hi: 'बृहत् पराशर होरा शास्त्र (BPHS) — स्त्री जातक एवं कुज दोष अध्याय',
      gu: 'બૃહત્ પારાશર હોરા શાસ્ત્ર (BPHS) — સ્ત્રી જાતક અને કુજ દોષ અધ્યાય',
      bn: 'বৃহৎ পরাশর হোরা শাস্ত্র (BPHS) — স্ত্রী জাতক ও কুজ দোষ অধ্যায়',
      ta: 'பிருஹத் பராசர ஹோரா சாஸ்திரம் (BPHS) — ஸ்திரீ ஜாதகம் & குஜ தோஷ அத்தியாயம்',
      te: 'బృహత్ పరాశర హోరా శాస్త్రం (BPHS) — స్త్రీ జాతక & కుజ దోష అధ్యాయం',
      kn: 'ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ (BPHS) — ಸ್ತ್ರೀ ಜಾತಕ ಮತ್ತು ಕುಜ ದೋಷ ಅಧ್ಯಾಯ',
      ml: 'ബൃഹത് പരാശര ഹോരാ ശാസ്ത്രം (BPHS) — സ്ത്രീ ജാതകവും കുജ ദോഷവും അധ്യായം',
      pa: 'ਬ੍ਰਿਹਤ ਪਰਾਸ਼ਰ ਹੋਰਾ ਸ਼ਾਸਤਰ (BPHS) — ਇਸਤਰੀ ਜਾਤਕ ਅਤੇ ਕੁਜ ਦੋਸ਼ ਅਧਿਆਏ',
      or: 'ବୃହତ ପରାଶର ହୋରା ଶାସ୍ତ୍ର (BPHS) — ସ୍ତ୍ରୀ ଜାତକ ଓ କୁଜ ଦୋଷ ଅଧ୍ୟାୟ',
      as: 'বৃহৎ পৰাশৰ হোৰা শাস্ত্ৰ (BPHS) — স্ত্ৰী জাতক আৰু কুজ দোষ অধ্যায়',
      ur: 'برہت پراشر ہورا شاستر (BPHS) — باب استری جاتک و کج دوش',
    },
    'Brihat Parashara Hora Shastra (BPHS) — Budhaditya Yoga': {
      mr: 'बृहत् पराशर होरा शास्त्र (BPHS) — बुधादित्य योग',
      hi: 'बृहत् पराशर होरा शास्त्र (BPHS) — बुधादित्य योग',
      gu: 'બૃહત્ પારાશર હોરા શાસ્ત્ર (BPHS) — બુધાદિત્ય યોગ',
      bn: 'বৃহৎ পরাশর হোরা শাস্ত্র (BPHS) — বুধাদিত্য যোগ',
      ta: 'பிருஹத் பராசர ஹோரா சாஸ்திரம் (BPHS) — புதாதித்ய யோகம்',
      te: 'బృహత్ పరాశర హోరా శాస్త్రం (BPHS) — బుధాదిత్య యోగం',
      kn: 'ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ (BPHS) — ಬುಧಾದಿತ್ಯ ಯೋಗ',
      ml: 'ബൃഹത് പരാശര ഹോരാ ശാസ്ത്രം (BPHS) — ബുധാദിത്യ യോഗം',
      pa: 'ਬ੍ਰਿਹਤ ਪਰਾਸ਼ਰ ਹੋਰਾ ਸ਼ਾਸਤਰ (BPHS) — ਬੁੱਧਾਦਿੱਤ ਯੋਗ',
      or: 'ବୃହତ ପରାଶର ହୋରା ଶାସ୍ତ୍ର (BPHS) — ବୁଧାଦିତ୍ୟ ଯୋଗ',
      as: 'বৃহৎ পৰাশৰ হোৰা শাস্ত্ৰ (BPHS) — বুধাদিত্য যোগ',
      ur: 'برہت پراشر ہورا شاستر (BPHS) — بدھادتیہ یوگ',
    },
    'Brihat Parashara Hora Shastra (BPHS) — Ch. 41 (Gaja Kesari Yoga)': {
      mr: 'बृहत् पराशर होरा शास्त्र (BPHS) — अध्याय ४१ (गजकेसरी योग)',
      hi: 'बृहत् पराशर होरा शास्त्र (BPHS) — अध्याय ४१ (गजकेसरी योग)',
      gu: 'બૃહત્ પારાશર હોરા શાસ્ત્ર (BPHS) — અધ્યાય ૪૧ (ગજકેસરી યોગ)',
      bn: 'বৃহৎ পরাশর হোরা শাস্ত্র (BPHS) — অধ্যায় ৪১ (গজকেশরী যোগ)',
      ta: 'பிருஹத் பராசர ஹோரா சாஸ்திரம் (BPHS) — அத்தியாயம் 41 (கஜகேசரி யோகம்)',
      te: 'బృహత్ పరాశర హోరా శాస్త్రం (BPHS) — అధ్యాయం 41 (గజకేసరి యోగం)',
      kn: 'ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ (BPHS) — ಅಧ್ಯಾಯ 41 (ಗಜಕೇಸರಿ ಯೋಗ)',
      ml: 'ബൃഹത് പരാശര ഹോരാ ശാസ്ത്രം (BPHS) — അധ്യായം 41 (ഗജകേസരി യോഗം)',
      pa: 'ਬ੍ਰਿਹਤ ਪਰਾਸ਼ਰ ਹੋਰਾ ਸ਼ਾਸਤਰ (BPHS) — ਅਧਿਆਏ 41 (ਗਜਕੇਸਰੀ ਯੋਗ)',
      or: 'ବୃହତ ପରାଶର ହୋରା ଶାସ୍ତ୍ର (BPHS) — ଅଧ୍ୟାୟ ୪୧ (ଗଜକେଶରୀ ଯୋଗ)',
      as: 'বৃহৎ পৰাশৰ হোৰা শাস্ত্ৰ (BPHS) — অধ্যায় ৪১ (গজকেশৰী যোগ)',
      ur: 'برہت پراشر ہورا شاستر (BPHS) — باب 41 (گج کیسری یوگ)',
    },
    'Brihat Parashara Hora Shastra (BPHS) — Chandra-Mangal Yoga': {
      mr: 'बृहत् पराशर होरा शास्त्र (BPHS) — चंद्र-मंगळ योग',
      hi: 'बृहत् पराशर होरा शास्त्र (BPHS) — चन्द्र-मंगल योग',
      gu: 'બૃહત્ પારાશર હોરા શાસ્ત્ર (BPHS) — ચંદ્ર-મંગળ યોગ',
      bn: 'বৃহৎ পরাশর হোরা শাস্ত্র (BPHS) — চন্দ্র-মঙ্গল যোগ',
      ta: 'பிருஹத் பராசர ஹோரா சாஸ்திரம் (BPHS) — சந்திர-மங்கள யோகம்',
      te: 'బృహత్ పరాశర హోరా శాస్త్రం (BPHS) — చంద్ర-మంగళ యోగం',
      kn: 'ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ (BPHS) — ಚಂದ್ರ-ಮಂಗಳ ಯೋಗ',
      ml: 'ബൃഹത് പരാശര ഹോരാ ശാസ്ത്രം (BPHS) — ചന്ദ്ര-മംഗള യോഗം',
      pa: 'ਬ੍ਰਿਹਤ ਪਰਾਸ਼ਰ ਹੋਰਾ ਸ਼ਾਸਤਰ (BPHS) — ਚੰਦਰ-ਮੰਗਲ ਯੋਗ',
      or: 'ବୃହତ ପରାଶର ହୋରା ଶାସ୍ତ୍ର (BPHS) — ଚନ୍ଦ୍ର-ମଙ୍ଗଳ ଯୋଗ',
      as: 'বৃহৎ পৰাশৰ হোৰা শাস্ত্ৰ (BPHS) — চন্দ্ৰ-মঙ্গল যোগ',
      ur: 'برہت پراشر ہورا شاستر (BPHS) — چندر-منگل یوگ',
    },
    'Brihat Parashara Hora Shastra (BPHS) — Upachaya Malefic Rules': {
      mr: 'बृहत् पराशर होरा शास्त्र (BPHS) — उपचय भाव पापग्रह नियम',
      hi: 'बृहत् पराशर होरा शास्त्र (BPHS) — उपचय भाव क्रूर ग्रह नियम',
      gu: 'બૃહત્ પારાશર હોરા શાસ્ત્ર (BPHS) — ઉપચય ભાવ પાપગ્રહ નિયમ',
      bn: 'বৃহৎ পরাশর হোরা শাস্ত্র (BPHS) — উপচয় পাপগ্রহ নিয়ম',
      ta: 'பிருஹத் பராசர ஹோரா சாஸ்திரம் (BPHS) — உபசய பாப கிரக விதிகள்',
      te: 'బృహత్ పరాశర హోరా శాస్త్రం (BPHS) — ఉపచయ పాప గ్రహ నియమాలు',
      kn: 'ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ (BPHS) — ಉಪಚಯ ಪಾಪಗ್ರಹ ನಿಯಮಗಳು',
      ml: 'ബൃഹത് പരാശര ഹോരാ ശാസ്ത്രം (BPHS) — ഉപചയ പാപഗ്രഹ നിയമങ്ങൾ',
      pa: 'ਬ੍ਰਿਹਤ ਪਰਾਸ਼ਰ ਹੋਰਾ ਸ਼ਾਸਤਰ (BPHS) — ਉਪਚਯ ਪਾਪੀ ਗ੍ਰਹਿ ਨਿਯਮ',
      or: 'ବୃହତ ପରାଶର ହୋରା ଶାସ୍ତ୍ର (BPHS) — ଉପଚୟ ପାପଗ୍ରହ ନିୟମ',
      as: 'বৃহৎ পৰাশৰ হোৰা শাস্ত্ৰ (BPHS) — উপচয় পাপগ্ৰহ নিয়ম',
      ur: 'برہت پراشر ہورا شاستر (BPHS) — اپچے گھروں کے اصول',
    },
    'Modern Jyotish Tradition (Unverified in Classical BPHS)': {
      mr: 'आधुनिक ज्योतिष परंपरा (पारंपारिक BPHS मध्ये अनिर्धारित)',
      hi: 'आधुनिक ज्योतिष परंपरा (शास्त्रीय BPHS में अनिर्धारित)',
      gu: 'આધુનિક જ્યોતિષ પરંપરા (શાસ્ત્રીય BPHS માં અપ્રમાણિત)',
      bn: 'আধুনিক জ্যোতিষ পরম্পরা (শাস্ত্রীয় BPHS-এ অপ্রমাণিত)',
      ta: 'நவீன ஜோதிட மரபு (பாரம்பரிய BPHS-ல் குறிப்பிடப்படாதது)',
      te: 'ఆధునిక జ్యోతిష్య సంప్రదాయం (శాస్త్రీయ BPHS లో లేనిది)',
      kn: 'ಆಧುನಿಕ ಜ್ಯೋತಿಷ್ಯ ಸಂಪ್ರದಾಯ (ಸಾಂಪ್ರದಾಯಿಕ BPHS ನಲ್ಲಿ ಉಲ್ಲೇಖವಿಲ್ಲದ)',
      ml: 'ആധുനിക ജ്യോതിഷ പാരമ്പര്യം (ക്ലാസിക്കൽ BPHS-ൽ സ്ഥിരീകരിക്കാത്തത്)',
      pa: 'ਆਧੁਨਿਕ ਜੋਤਿਸ਼ ਪਰੰਪਰਾ (ਕਲਾਸੀਕਲ BPHS ਵਿੱਚ ਅਪ੍ਰਮਾਣਿਤ)',
      or: 'ଆଧୁନିକ ଜ୍ୟୋତିଷ ପରମ୍ପରା (ଶାସ୍ତ୍ରୀୟ BPHS ରେ ଅପ୍ରମାଣିତ)',
      as: 'আধুনিক জ্যোতিষ পৰম্পৰা (শাস্ত্ৰীয় BPHS-ত অপ্ৰমাণিত)',
      ur: 'جدید علم نجوم کی روایت (کلاسیکی BPHS میں غیر مصدقہ)',
    },
  };

  if (refDictionary[ref]) {
    return resolveLang(refDictionary[ref], lang) || ref;
  }

  const conjMatch = ref.match(/Classical Parashari Conjunction Principles\s*\((.*?)\)/i);
  if (conjMatch) {
    const pair = conjMatch[1];
    const prefixMap = {
      mr: `शास्त्रीय पराशरी युती सिद्धांत (${pair})`,
      hi: `शास्त्रीय पराशरीय युति सिद्धांत (${pair})`,
      gu: `શાસ્ત્રીય પારાશરી યુતિ સિદ્ધાંત (${pair})`,
      bn: `শাস্ত্রীয় পরাশরী সংযোগ নীতি (${pair})`,
      ta: `பாரம்பரிய பராசர இணைவு கோட்பாடுகள் (${pair})`,
      te: `శాస్త్రీయ పరాశరి సంయోగ సూత్రాలు (${pair})`,
      kn: `ಸಾಂಪ್ರದಾಯಿಕ ಪರಾಶರಿ ಯುತಿ ಸಿದ್ಧಾಂತಗಳು (${pair})`,
      ml: `ശാസ്ത്രീയ പരാശര സംയോജന തത്വങ്ങൾ (${pair})`,
      pa: `ਕਲਾਸੀਕਲ ਪਰਾਸ਼ਰੀ ਯੁਤੀ ਸਿਧਾਂਤ (${pair})`,
      or: `ଶାସ୍ତ୍ରୀୟ ପରାଶରୀ ଯୁତି ସିଦ୍ଧାନ୍ତ (${pair})`,
      as: `শাস্ত্ৰীয় পৰাশৰী সংযোগ নীতি (${pair})`,
      ur: `کلاسیکی پراشری قران کے اصول (${pair})`,
    };
    return prefixMap[lang] || prefixMap['hi'] || prefixMap['mr'] || ref;
  }

  return translateAstrologicalText(ref, lang);
}

/**
 * Normalizes user input (query, header, body) into a supported language code.
 * E.g. 'mr-IN' -> 'mr', 'HINDI' -> 'hi', 'gu' -> 'gu'
 */
function normalizeLanguage(input) {
  if (!input || typeof input !== 'string') return 'en';
  const clean = input.trim().toLowerCase();

  // Exact match
  if (SUPPORTED_CODES.includes(clean)) return clean;

  // Split tags e.g. "hi-IN", "mr_IN", "en-US"
  const prefix = clean.split(/[-_,;]/)[0];
  if (SUPPORTED_CODES.includes(prefix)) return prefix;

  // Word matching
  const matchMap = {
    marathi: 'mr',
    hindi: 'hi',
    gujarati: 'gu',
    bengali: 'bn',
    bangla: 'bn',
    tamil: 'ta',
    telugu: 'te',
    kannada: 'kn',
    malayalam: 'ml',
    punjabi: 'pa',
    odia: 'or',
    oriya: 'or',
    assamese: 'as',
    asamiya: 'as',
    urdu: 'ur',
    english: 'en',
  };

  if (matchMap[clean]) return matchMap[clean];

  return 'en';
}

/**
 * Gets locale dictionary for a language code, falling back to English.
 */
function getLocale(lang) {
  const code = normalizeLanguage(lang);
  return locales[code] || locales['en'] || {};
}

const COMMON_MESSAGES = {
  'Report catalog fetched successfully': {
    mr: 'अहवाल कॅटलॉग यशस्वीरीत्या प्राप्त झाला',
    hi: 'रिपोर्ट कैटलॉग सफलतापूर्वक प्राप्त हुआ',
    gu: 'રિપોર્ટ કેટલોગ સફળતાપૂર્વક પ્રાપ્ત થયો',
    bn: 'রিপোর্ট ক্যাটালগ সফলভাবে প্রাপ্ত হয়েছে',
    ta: 'அறிக்கை பட்டியல் வெற்றிகரமாக பெறப்பட்டது',
    te: 'నివేదిక కేటలాగ్ విజయవంతంగా పొందబడింది',
    kn: 'ವರದಿ ಕ್ಯಾಟಲಾಗ್ ಯಶಸ್ವಿಯಾಗಿ ಪಡೆಯಲಾಗಿದೆ',
    ml: 'റിപ്പോർട്ട് കാറ്റലോഗ് വിജയകരമായി ലഭിച്ചു',
    pa: 'ਰਿਪੋਰਟ ਕੈਟਾਲਾਗ ਸਫਲਤਾਪੂਰਵਕ ਪ੍ਰਾਪਤ ਕੀਤਾ ਗਿਆ',
    or: 'ରିପୋର୍ଟ କ୍ୟାଟାଲଗ୍ ସଫଳତାର ସହିତ ପ୍ରାପ୍ତ ହେଲା',
    as: 'ৰিপোৰ্ট কেটালগ সফলভাৱে প্ৰাপ্ত হৈছে',
    ur: 'رپورٹ کیٹلاگ کامیابی کے ساتھ حاصل کر لیا گیا',
  },
  'Profile fetched successfully': {
    mr: 'प्रोफाइल यशस्वीरीत्या प्राप्त झाली',
    hi: 'प्रोफाइल सफलतापूर्वक प्राप्त हुई',
    gu: 'પ્રોફાઇલ સફળતાપૂર્વક પ્રાપ્ત થઈ',
    bn: 'প্রোফাইল সফলভাবে প্রাপ্ত হয়েছে',
    ta: 'சுயவிவரம் வெற்றிகரமாக பெறப்பட்டது',
    te: 'ప్రొఫైల్ విజయవంతంగా పొందబడింది',
    kn: 'ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ಪಡೆಯಲಾಗಿದೆ',
    ml: 'പ്രൊഫൈൽ വിജയകരമായി ലഭിച്ചു',
    pa: 'ਪ੍ਰੋਫਾਈਲ ਸਫਲਤਾਪੂਰਵਕ ਪ੍ਰਾਪਤ ਕੀਤੀ ਗਈ',
    or: 'ପ୍ରୋଫାଇଲ୍ ସଫଳତାର ସହିତ ପ୍ରାପ୍ତ ହେଲା',
    as: 'প্ৰফাইল সফলভাৱে প্ৰাপ্ত হৈছে',
    ur: 'پروفائل کامیابی سے حاصل ہو گئی',
  },
  'Profile updated successfully': {
    mr: 'प्रोफाइल यशस्वीरीत्या अद्ययावत झाली',
    hi: 'प्रोफाइल सफलतापूर्वक अपडेट हुई',
    gu: 'પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ',
    bn: 'প্রোফাইল সফলভাবে আপডেট হয়েছে',
  },
  'User registered successfully': {
    mr: 'वापरकर्ता नोंदणी यशस्वी झाली',
    hi: 'उपयोगकर्ता पंजीकरण सफल रहा',
    gu: 'વપરાશકર્તા નોંધણી સફળ રહી',
    bn: 'ব্যবহারকারী নিবন্ধন সফল হয়েছে',
  },
  'Login successful': {
    mr: 'लॉगिन यशस्वी झाले',
    hi: 'लॉगिन सफल रहा',
    gu: 'લૉગિન સફળ રહ્યું',
    bn: 'লগইন সফল হয়েছে',
  },
};

/**
 * Translates a key or message string into the target language.
 */
function t(key, lang = 'en', params = {}) {
  const code = normalizeLanguage(lang);
  const loc = locales[code] || locales['en'];
  const enLoc = locales['en'];

  let val = null;
  const cleanKey = typeof key === 'string' ? key.trim().replace(/\.$/, '') : key;
  const lookupKey = cleanKey === 'Bhava analysis fetched successfully' ? 'Bhavas fetched successfully' : cleanKey;

  // 1. Direct message lookup
  if (loc.messages && loc.messages[lookupKey]) {
    val = loc.messages[lookupKey];
  } else if (COMMON_MESSAGES[lookupKey] && COMMON_MESSAGES[lookupKey][code]) {
    val = COMMON_MESSAGES[lookupKey][code];
  } else if (enLoc?.messages && enLoc.messages[lookupKey]) {
    val = enLoc.messages[lookupKey];
  }

  // 2. Nested dot notation lookup e.g. 'grahas.Sun'
  if (!val && typeof key === 'string' && key.includes('.')) {
    const parts = key.split('.');
    let curr = loc;
    for (const p of parts) {
      curr = curr ? curr[p] : undefined;
    }
    if (curr) val = curr;
    else {
      let enCurr = enLoc;
      for (const p of parts) {
        enCurr = enCurr ? enCurr[p] : undefined;
      }
      if (enCurr) val = enCurr;
    }
  }

  // 3. Fallback to key itself
  if (!val) val = key;

  // 4. Interpolate parameters: {{param}}
  if (typeof val === 'string' && params && typeof params === 'object') {
    for (const [k, v] of Object.entries(params)) {
      val = val.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    }
  }

  return val;
}

/**
 * Astrological entity lookups
 */
function getPlanetName(planet, lang = 'en') {
  if (!planet) return '';
  const loc = getLocale(lang);
  const base = String(planet).split(/[\s(]/)[0].trim();
  const cleanPlanet = base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
  return loc.grahas?.[cleanPlanet] || loc.grahas?.[planet] || planet;
}

function getRashiName(rashi, lang = 'en') {
  if (!rashi) return '';
  const loc = getLocale(lang);
  const base = String(rashi).split(/[\s(]/)[0].trim();
  let cleanRashi = base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
  if (SANSKRIT_TO_ENGLISH_RASHI[cleanRashi]) {
    cleanRashi = SANSKRIT_TO_ENGLISH_RASHI[cleanRashi];
  }
  return loc.rashis?.[cleanRashi] || loc.rashis?.[rashi] || rashi;
}

function getSanskritRashiName(sanskritName, lang = 'en') {
  if (!sanskritName) return '';
  const base = String(sanskritName).split(/[\s(]/)[0].trim();
  const clean = base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
  const mapEntry = SANSKRIT_RASHIS_MAP[clean];
  if (mapEntry) {
    return resolveLang(mapEntry, lang) || sanskritName;
  }
  const sKey = ENGLISH_TO_SANSKRIT_RASHI[clean];
  if (sKey && SANSKRIT_RASHIS_MAP[sKey]) {
    return resolveLang(SANSKRIT_RASHIS_MAP[sKey], lang) || sanskritName;
  }
  return getRashiName(sanskritName, lang);
}

function getAyanamsaName(ayanamsa, lang = 'en') {
  if (!ayanamsa) return '';
  const clean = String(ayanamsa).trim();
  return (AYANAMSA_MAP[clean] && resolveLang(AYANAMSA_MAP[clean], lang)) || (AYANAMSA_MAP['Lahiri'] && resolveLang(AYANAMSA_MAP['Lahiri'], lang)) || ayanamsa;
}

function getCheckedFromName(key, lang = 'en') {
  if (!key) return '';
  const clean = String(key).trim().toUpperCase();
  if (CHECKED_FROM_MAP[clean]) {
    return resolveLang(CHECKED_FROM_MAP[clean], lang) || key;
  }
  return localizeSourceReference(key, lang);
}

function getMethodologyName(methodology, lang = 'en') {
  if (!methodology) return '';
  return (METHODOLOGY_MAP[methodology] && resolveLang(METHODOLOGY_MAP[methodology], lang)) || (METHODOLOGY_MAP['Parashari'] && resolveLang(METHODOLOGY_MAP['Parashari'], lang)) || methodology;
}

function getYogaBadgeName(badgeType, lang = 'en') {
  if (!badgeType) return '';
  const clean = String(badgeType).toLowerCase();
  const normalizedKey = clean === 'auspicious' ? 'benefic' : (clean === 'inauspicious' ? 'malefic' : clean);
  return (YOGA_BADGE_MAP[normalizedKey] && resolveLang(YOGA_BADGE_MAP[normalizedKey], lang)) || (YOGA_BADGE_MAP[clean] && resolveLang(YOGA_BADGE_MAP[clean], lang)) || badgeType;
}

function getNakshatraName(nakshatra, lang = 'en') {
  if (!nakshatra) return '';
  const loc = getLocale(lang);
  return loc.nakshatras?.[nakshatra] || nakshatra;
}

function getBhavaName(houseNumber, lang = 'en') {
  const loc = getLocale(lang);
  return loc.bhavas?.[String(houseNumber)] || `House ${houseNumber}`;
}

function getAshtakootaName(aspect, lang = 'en') {
  if (!aspect) return '';
  const loc = getLocale(lang);
  if (loc.ashtakoota?.[aspect]) {
    return loc.ashtakoota[aspect];
  }
  if (ASHTAKOOTA_NAMES && ASHTAKOOTA_NAMES[aspect]) {
    return resolveLang(ASHTAKOOTA_NAMES[aspect], lang) || aspect;
  }
  return aspect;
}

function getDoshaName(doshaKey, lang = 'en') {
  const loc = getLocale(lang);
  return loc.doshas?.[doshaKey] || doshaKey;
}

function getArchetypeName(rootNumber, lang = 'en') {
  const loc = getLocale(lang);
  return loc.archetypes?.[String(rootNumber)] || '';
}

function getGemstoneName(gem, lang = 'en') {
  if (!gem) return '';
  const normalized = normalizeGemstoneKey(gem);
  if (GEMSTONES_CONTENT_MAP && GEMSTONES_CONTENT_MAP[normalized]?.name) {
    return resolveLang(GEMSTONES_CONTENT_MAP[normalized].name, lang) || gem;
  }
  const clean = String(gem).trim();
  if (GEMSTONES_CONTENT_MAP && GEMSTONES_CONTENT_MAP[clean]?.name) {
    return resolveLang(GEMSTONES_CONTENT_MAP[clean].name, lang) || gem;
  }
  const loc = getLocale(lang);
  return loc.gemstones?.[normalized] || loc.gemstones?.[clean] || gem;
}

function getGemstoneRegionalName(gem, lang = 'en') {
  if (!gem) return '';
  const normalized = normalizeGemstoneKey(gem);
  if (GEMSTONES_CONTENT_MAP && GEMSTONES_CONTENT_MAP[normalized]?.regionalName) {
    return resolveLang(GEMSTONES_CONTENT_MAP[normalized].regionalName, lang) || gem;
  }
  const clean = String(gem).trim();
  if (GEMSTONES_CONTENT_MAP && GEMSTONES_CONTENT_MAP[clean]?.regionalName) {
    return resolveLang(GEMSTONES_CONTENT_MAP[clean].regionalName, lang) || gem;
  }
  return gem;
}

function getGemstoneMantra(gem, lang = 'en') {
  if (!gem) return '';
  const normalized = normalizeGemstoneKey(gem);
  if (GEMSTONES_CONTENT_MAP && GEMSTONES_CONTENT_MAP[normalized]?.mantra) {
    return resolveLang(GEMSTONES_CONTENT_MAP[normalized].mantra, lang) || '';
  }
  const clean = String(gem).trim();
  if (GEMSTONES_CONTENT_MAP && GEMSTONES_CONTENT_MAP[clean]?.mantra) {
    return resolveLang(GEMSTONES_CONTENT_MAP[clean].mantra, lang) || '';
  }
  return '';
}

function getRudrakshaMantra(mukhi, lang = 'en') {
  const m = Number(mukhi) || 1;
  if (RUDRAKSHA_MANTRAS_MAP && RUDRAKSHA_MANTRAS_MAP[m]) {
    return resolveLang(RUDRAKSHA_MANTRAS_MAP[m], lang) || '';
  }
  return '';
}

function getElementName(element, lang = 'en') {
  if (!element) return '';
  return resolveLang(ELEMENTS_MAP[element], lang) || element;
}

function getDayName(day, lang = 'en') {
  if (!day) return '';
  return resolveLang(DAYS_MAP[day], lang) || day;
}

function getTimeframeName(timeframe, lang = 'en') {
  if (!timeframe) return '';
  return resolveLang(TIMEFRAMES_MAP[timeframe], lang) || timeframe;
}

function getDignityName(dignity, lang = 'en') {
  if (!dignity) return '';
  const loc = getLocale(lang);
  return loc.dignities?.[dignity] || dignity;
}

function getMetalName(metal, lang = 'en') {
  if (!metal) return '';
  return resolveLang(METALS_MAP[metal], lang) || metal;
}

function getFingerName(finger, lang = 'en') {
  if (!finger) return '';
  return resolveLang(FINGERS_MAP[finger], lang) || finger;
}

function getDeityName(deity, lang = 'en') {
  if (!deity) return '';
  return resolveLang(DEITIES_MAP[deity], lang) || deity;
}

/**
 * Localizes Numerology Profile & Calculations Data
 */
function localizeNumerology(data, lang = 'en') {
  if (!data || lang === 'en') return data;
  const loc = getLocale(lang);

  const localized = JSON.parse(JSON.stringify(data));

  // Add localized meta
  localized.localizedLanguage = {
    code: loc.code,
    name: loc.name,
    nativeName: loc.nativeName,
    appName: loc.appName,
  };

  // Root-level metadata fields (e.g. GET /kundali/overview, /kundali/bhavas, /kundali/grahas)
  if (localized.ayanamsa && typeof localized.ayanamsa === 'string') {
    localized.ayanamsa = getAyanamsaName(localized.ayanamsa, lang);
    localized.localizedAyanamsa = localized.ayanamsa;
  }
  if (localized.methodology && typeof localized.methodology === 'string') {
    localized.methodology = getMethodologyName(localized.methodology, lang);
    localized.localizedMethodology = localized.methodology;
  }
  if (localized.nodeCalculationMode && typeof localized.nodeCalculationMode === 'string') {
    localized.localizedNodeCalculationMode = localized.nodeCalculationMode;
  }

  // 1. Localize Birth Number / Destiny Number / Name Number if present (in-place + additive)
  if (localized.birthNumber && typeof localized.birthNumber === 'object') {
    const locTitle = loc.numerology?.mulank || 'Mulank';
    const locPlanet = getPlanetName(localized.birthNumber.planetaryRuler, lang);
    const locArchetype = getArchetypeName(localized.birthNumber.root, lang);
    const locSummary = getLocalizedCoreSummary('birth', lang, localized.birthNumber.summary);

    localized.birthNumber.title = locTitle;
    localized.birthNumber.planetaryRuler = locPlanet;
    if (locArchetype) localized.birthNumber.archetype = locArchetype;
    if (locSummary) localized.birthNumber.summary = locSummary;
    localized.birthNumber.localizedTitle = locTitle;
    localized.birthNumber.localizedPlanet = locPlanet;
    localized.birthNumber.localizedArchetype = locArchetype;
  }
  if (localized.destinyNumber && typeof localized.destinyNumber === 'object') {
    const locTitle = loc.numerology?.bhagyank || 'Bhagyank';
    const locPlanet = getPlanetName(localized.destinyNumber.planetaryRuler, lang);
    const locArchetype = getArchetypeName(localized.destinyNumber.root, lang);
    const locSummary = getLocalizedCoreSummary('destiny', lang, localized.destinyNumber.summary);

    localized.destinyNumber.title = locTitle;
    localized.destinyNumber.planetaryRuler = locPlanet;
    if (locArchetype) localized.destinyNumber.archetype = locArchetype;
    if (locSummary) localized.destinyNumber.summary = locSummary;
    localized.destinyNumber.localizedTitle = locTitle;
    localized.destinyNumber.localizedPlanet = locPlanet;
    localized.destinyNumber.localizedArchetype = locArchetype;
  }
  if (localized.nameNumber && typeof localized.nameNumber === 'object') {
    const locTitle = loc.numerology?.namank || 'Namank';
    const locPlanet = getPlanetName(localized.nameNumber.planetaryRuler, lang);
    const locSummary = getLocalizedCoreSummary('name', lang, localized.nameNumber.summary);

    localized.nameNumber.title = locTitle;
    localized.nameNumber.planetaryRuler = locPlanet;
    if (locSummary) localized.nameNumber.summary = locSummary;
    localized.nameNumber.localizedTitle = locTitle;
    localized.nameNumber.localizedPlanet = locPlanet;
  }

  // 2. Localize Golden Trio labels if present
  if (localized.goldenTrio) {
    if (localized.goldenTrio.mulank && typeof localized.goldenTrio.mulank === 'object') {
      const locTitle = loc.numerology?.mulank || 'Mulank';
      const locPlanet = getPlanetName(localized.goldenTrio.mulank.planet, lang);
      const locArchetype = getArchetypeName(localized.goldenTrio.mulank.number, lang);
      localized.goldenTrio.mulank.title = locTitle;
      localized.goldenTrio.mulank.planet = locPlanet;
      if (locArchetype) localized.goldenTrio.mulank.archetype = locArchetype;
      localized.goldenTrio.mulank.localizedTitle = locTitle;
      localized.goldenTrio.mulank.localizedPlanet = locPlanet;
      localized.goldenTrio.mulank.localizedArchetype = locArchetype;
    }
    if (localized.goldenTrio.bhagyank && typeof localized.goldenTrio.bhagyank === 'object') {
      const locTitle = loc.numerology?.bhagyank || 'Bhagyank';
      const locPlanet = getPlanetName(localized.goldenTrio.bhagyank.planet, lang);
      const locArchetype = getArchetypeName(localized.goldenTrio.bhagyank.number, lang);
      localized.goldenTrio.bhagyank.title = locTitle;
      localized.goldenTrio.bhagyank.planet = locPlanet;
      if (locArchetype) localized.goldenTrio.bhagyank.archetype = locArchetype;
      localized.goldenTrio.bhagyank.localizedTitle = locTitle;
      localized.goldenTrio.bhagyank.localizedPlanet = locPlanet;
      localized.goldenTrio.bhagyank.localizedArchetype = locArchetype;
    }
    if (localized.goldenTrio.namank && typeof localized.goldenTrio.namank === 'object') {
      const locTitle = loc.numerology?.namank || 'Namank';
      const locPlanet = getPlanetName(localized.goldenTrio.namank.planet, lang);
      localized.goldenTrio.namank.title = locTitle;
      localized.goldenTrio.namank.planet = locPlanet;
      localized.goldenTrio.namank.localizedTitle = locTitle;
      localized.goldenTrio.namank.localizedPlanet = locPlanet;
    }
  }

  // 3. Localize core numbers if present
  if (localized.coreNumbers && Array.isArray(localized.coreNumbers)) {
    localized.coreNumbers = localized.coreNumbers.map((cn) => {
      const locTitle = getLocalizedCoreTitle(cn.id, lang, loc.numerology?.[cn.id] || cn.title || cn.name);
      const locPlanet = getPlanetName(cn.planet, lang);
      let locSummary = cn.summary;
      if (cn.id === 'personalYear') {
        const py = getLocalizedPersonalYearTheme(cn.root, lang, { theme: cn.summary });
        locSummary = py?.theme || cn.summary;
      } else if (cn.id === 'personalMonth') {
        locSummary = getLocalizedPersonalMonthTheme(cn.root, lang, cn.summary);
      } else if (cn.id === 'personalDay') {
        locSummary = getLocalizedPersonalDayTheme(cn.root, lang, cn.summary);
      } else {
        locSummary = getLocalizedCoreSummary(cn.id, lang, cn.summary);
      }
      const locCategory = (CORE_CATEGORIES[cn.category] && resolveLang(CORE_CATEGORIES[cn.category], lang)) || cn.category;
      return {
        ...cn,
        title: locTitle,
        category: locCategory,
        localizedName: locTitle,
        localizedPlanet: locPlanet,
        summary: locSummary,
      };
    });
  }

  // 4. Localize quickActions if present (GET /numerology/profile)
  if (Array.isArray(localized.quickActions)) {
    localized.quickActions = localized.quickActions.map((qa) => {
      const trans = QUICK_ACTIONS_CONTENT[qa.id] && resolveLang(QUICK_ACTIONS_CONTENT[qa.id], lang);
      return {
        ...qa,
        title: trans || qa.title,
      };
    });
  }

  // 5. Deep localized destiny analysis if number and summary exist
  const dNumber = localized.number || (typeof localized.destinyNumber === 'number' ? localized.destinyNumber : null);
  if (dNumber && localized.summary) {
    if (localized.title) {
      localized.title = getLocalizedDestinyTitle(lang, localized.title);
    }
    const deep = getLocalizedDestinyDetails(dNumber, lang, localized);
    localized.archetype = deep.archetype;
    localized.summary = deep.summary;
    localized.attributes = deep.attributes;
    if (localized.attributes?.planetaryRuler) {
      localized.attributes.planetaryRuler = getPlanetName(localized.attributes.planetaryRuler, lang);
    }
    if (localized.attributes?.gemstone) {
      localized.attributes.gemstone = getGemstoneName(localized.attributes.gemstone, lang);
    }
    localized.strengths = deep.strengths;
    localized.challenges = deep.challenges;
    if (deep.kundaliSynergy) {
      localized.kundaliSynergy = deep.kundaliSynergy;
    }
  }

  // 6. Localize personal cycles (nested or top-level)
  if (localized.personalCycles) {
    if (localized.personalCycles.personalYear) {
      localized.personalCycles.personalYear = getLocalizedPersonalYearTheme(
        localized.personalCycles.personalYear.number || localized.personalCycles.personalYear.year,
        lang,
        localized.personalCycles.personalYear
      );
    }
    if (localized.personalCycles.personalMonth) {
      localized.personalCycles.personalMonth.theme = getLocalizedPersonalMonthTheme(
        localized.personalCycles.personalMonth.number,
        lang,
        localized.personalCycles.personalMonth.theme
      );
    }
    if (localized.personalCycles.personalDay) {
      localized.personalCycles.personalDay.theme = getLocalizedPersonalDayTheme(
        localized.personalCycles.personalDay.number,
        lang,
        localized.personalCycles.personalDay.theme
      );
      localized.personalCycles.personalDay.label = getLocalizedDayLabel(lang);
    }
    if (Array.isArray(localized.personalCycles.multiYearForecast)) {
      localized.personalCycles.multiYearForecast = localized.personalCycles.multiYearForecast.map((item) => {
        const py = getLocalizedPersonalYearTheme(item.number, lang, item);
        return {
          ...item,
          theme: py?.theme || item.theme,
        };
      });
    }
  }

  // Top-level personal cycle fields (GET /numerology/personal-cycles)
  if (localized.personalYear && typeof localized.personalYear === 'object') {
    localized.personalYear = getLocalizedPersonalYearTheme(
      localized.personalYear.number || localized.personalYear.year,
      lang,
      localized.personalYear
    );
  }
  if (localized.personalMonth && typeof localized.personalMonth === 'object') {
    localized.personalMonth.theme = getLocalizedPersonalMonthTheme(
      localized.personalMonth.number,
      lang,
      localized.personalMonth.theme
    );
  }
  if (localized.personalDay && typeof localized.personalDay === 'object') {
    localized.personalDay.theme = getLocalizedPersonalDayTheme(
      localized.personalDay.number,
      lang,
      localized.personalDay.theme
    );
    localized.personalDay.label = getLocalizedDayLabel(lang);
  }
  if (Array.isArray(localized.multiYearForecast)) {
    localized.multiYearForecast = localized.multiYearForecast.map((item) => {
      const py = getLocalizedPersonalYearTheme(item.number, lang, item);
      return {
        ...item,
        theme: py?.theme || item.theme,
      };
    });
  }

  // 7. Localize Kundali Alignment if present (GET /numerology/kundali-alignment)
  if (localized.alignmentCards || localized.numerologyPlanet) {
    if (localized.numerologyPlanet) {
      localized.numerologyPlanet = getPlanetName(localized.numerologyPlanet, lang);
    }
    if (localized.kundaliSign) {
      localized.kundaliSign = getRashiName(localized.kundaliSign, lang);
    }
    if (localized.moonStrength) {
      localized.moonStrength = resolveLang(MOON_STRENGTH_MAP, lang) || localized.moonStrength;
    }
    if (localized.headline) {
      const tmpl = resolveLang(KUNDALI_ALIGNMENT_CONTENT.headlineTmpl, lang);
      if (tmpl) {
        const devDigits = (d) => String(d).replace(/\d/g, (c) => ['०','१','२','३','४','५','६','७','८','९'][c]);
        const dNum = (lang === 'mr' || lang === 'hi') ? devDigits(localized.destinyNumber || '') : String(localized.destinyNumber || '');
        localized.headline = tmpl
          .replace('{{destiny}}', dNum)
          .replace('{{planet}}', localized.numerologyPlanet || '')
          .replace('{{sign}}', localized.kundaliSign || '');
      }
    }
    if (Array.isArray(localized.alignmentCards)) {
      localized.alignmentCards = localized.alignmentCards.map((card) => {
        const cContent = KUNDALI_ALIGNMENT_CONTENT.alignmentCards[card.id];
        if (!cContent) return card;
        const title = cContent.title ? resolveLang(cContent.title, lang) : card.title;
        const rel = cContent.relationship ? resolveLang(cContent.relationship, lang) : card.relationship;
        let desc = card.description;
        if (cContent.description) {
          const descTmpl = resolveLang(cContent.description, lang);
          if (descTmpl) {
            const devDigits = (d) => String(d).replace(/\d/g, (c) => ['०','१','२','३','४','५','६','७','८','९'][c]);
            const dNum = (lang === 'mr' || lang === 'hi') ? devDigits(localized.destinyNumber || '') : String(localized.destinyNumber || '');
            const hNum = (lang === 'mr' || lang === 'hi') ? devDigits(localized.kundaliHouse || 4) : String(localized.kundaliHouse || 4);
            desc = descTmpl
              .replace(/{{destiny}}/g, dNum)
              .replace(/{{planet}}/g, localized.numerologyPlanet || '')
              .replace(/{{house}}/g, hNum);
          }
        }
        let val = card.value;
        if (cContent.value) {
          val = resolveLang(cContent.value, lang) || val;
        } else if (card.id === 'planetaryAlignment') {
          const numLabel = resolveLang(NUM_LABEL_MAP, lang) || 'Numerology';
          const kunLabel = resolveLang(KUN_LABEL_MAP, lang) || 'Kundali';
          val = `${localized.numerologyPlanet} (${numLabel}) ↔ ${localized.numerologyPlanet} (${kunLabel})`;
        } else if (card.id === 'bhavaSynthesis') {
          const devDigits = (d) => String(d).replace(/\d/g, (c) => ['०','१','२','३','४','५','६','७','८','९'][c]);
          const hNum = (lang === 'mr' || lang === 'hi') ? devDigits(localized.kundaliHouse || 4) : String(localized.kundaliHouse || 4);
          const bhavaSuffix = resolveLang(BHAVA_SUFFIX_MAP, lang) || 'Bhava resonance';
          val = `${hNum} ${bhavaSuffix}`;
        }
        return {
          ...card,
          title: title || card.title,
          value: val || card.value,
          relationship: rel || card.relationship,
          description: desc || card.description,
        };
      });
    }
  }

  // 8. Localize Compatibility if present (POST /numerology/compatibility)
  if (localized.planetarySynergy) {
    localized.planetarySynergy = getLocalizedPlanetarySynergy(localized.planetarySynergy, lang, getPlanetName);
  }
  if (localized.compatibilityScore !== undefined) {
    if (localized.harmonyRating) {
      const rawRating = localized.harmonyRating;
      if (COMPATIBILITY_CONTENT.harmonyRating[rawRating]) {
        localized.harmonyRating = resolveLang(COMPATIBILITY_CONTENT.harmonyRating[rawRating], lang);
      }
    }
    const score = Number(localized.compatibilityScore);
    if (score >= 82) localized.verdict = resolveLang(COMPATIBILITY_CONTENT.verdicts.veryHigh, lang);
    else if (score >= 74) localized.verdict = resolveLang(COMPATIBILITY_CONTENT.verdicts.high, lang);
    else if (score >= 60) localized.verdict = resolveLang(COMPATIBILITY_CONTENT.verdicts.moderate, lang);
    else localized.verdict = resolveLang(COMPATIBILITY_CONTENT.verdicts.challenging, lang);

    if (Array.isArray(localized.strengths)) {
      localized.strengths = localized.strengths.map((str) => {
        return (COMPATIBILITY_CONTENT.strengths[str] && resolveLang(COMPATIBILITY_CONTENT.strengths[str], lang)) || str;
      });
    }
    if (Array.isArray(localized.growthAreas)) {
      localized.growthAreas = localized.growthAreas.map((ga) => {
        return (COMPATIBILITY_CONTENT.growthAreas[ga] && resolveLang(COMPATIBILITY_CONTENT.growthAreas[ga], lang)) || ga;
      });
    }
  }

  // 9. Localize Calculation Breakdown if present (GET /numerology/calculation-breakdown)
  if (localized.nameBreakdown) {
    if (localized.nameBreakdown.system) {
      localized.nameBreakdown.system = resolveLang(CALCULATION_BREAKDOWN_CONTENT.systemName, lang) || localized.nameBreakdown.system;
    }
    if (localized.nameBreakdown.systemNote) {
      localized.nameBreakdown.systemNote = resolveLang(CALCULATION_BREAKDOWN_CONTENT.systemNote, lang) || localized.nameBreakdown.systemNote;
    }
  }
  if (localized.destinyBreakdown) {
    if (localized.destinyBreakdown.vedicNote) {
      localized.destinyBreakdown.vedicNote = resolveLang(CALCULATION_BREAKDOWN_CONTENT.vedicNote, lang) || localized.destinyBreakdown.vedicNote;
    }
    if (Array.isArray(localized.destinyBreakdown.steps)) {
      localized.destinyBreakdown.steps = localized.destinyBreakdown.steps.map((st) => ({
        ...st,
        component: getLocalizedCalculationComponent(st.component, lang),
      }));
    }
  }
  if (localized.calculationBreakdown) {
    if (localized.calculationBreakdown.system) {
      localized.calculationBreakdown.system = resolveLang(CALCULATION_BREAKDOWN_CONTENT.systemName, lang) || localized.calculationBreakdown.system;
    }
    if (localized.calculationBreakdown.systemNote) {
      localized.calculationBreakdown.systemNote = resolveLang(CALCULATION_BREAKDOWN_CONTENT.systemNote, lang) || localized.calculationBreakdown.systemNote;
    }
    if (localized.calculationBreakdown.vedicNote) {
      localized.calculationBreakdown.vedicNote = resolveLang(CALCULATION_BREAKDOWN_CONTENT.vedicNote, lang) || localized.calculationBreakdown.vedicNote;
    }
    if (Array.isArray(localized.calculationBreakdown.components)) {
      localized.calculationBreakdown.components = localized.calculationBreakdown.components.map((c) => ({
        ...c,
        component: getLocalizedCalculationComponent(c.component, lang),
        vedicNote: resolveLang(CALCULATION_BREAKDOWN_CONTENT.vedicNote, lang) || c.vedicNote,
      }));
    }
  }

  return localized;
}

const SANSKRIT_BHAVA_NAMES = {
  1: 'तनु भाव',
  2: 'धन भाव',
  3: 'सहज भाव',
  4: 'सुख भाव',
  5: 'पुत्र भाव',
  6: 'अरि भाव',
  7: 'युवती भाव',
  8: 'रंध्र भाव',
  9: 'धर्म भाव',
  10: 'कर्म भाव',
  11: 'लाभ भाव',
  12: 'व्यय भाव',
};

/**
 * Localizes a single Rahu or Ketu contextual interpretation record
 */
function localizeNodeRecord(node, lang = 'en') {
  if (!node || typeof node !== 'object' || lang === 'en') return node;

  const planet = node.planet || (node.id === 'rahu' ? 'Rahu' : 'Ketu');
  const hNum = node.houseNumber || 1;
  const isRahu = String(planet).toLowerCase().includes('rahu');

  const interpretationsMap = isRahu ? RAHU_INTERPRETATIONS : KETU_INTERPRETATIONS;
  const entry = interpretationsMap ? interpretationsMap[hNum] : null;

  const locPlanet = getPlanetName(planet, lang);
  const locBhavaName = BHAVAS_CONTENT[hNum] ? resolveLang(BHAVAS_CONTENT[hNum].title, lang) : node.bhavaName;

  const locThemes = Array.isArray(node.generalLifeThemes)
    ? node.generalLifeThemes.map((th) => resolveLang(THEMES_MAP[th], lang) || th)
    : node.generalLifeThemes;

  const meaning = entry?.meaning ? resolveLang(entry.meaning, lang) : translateAstrologicalText(node.traditionalMeaning, lang);

  let positives = entry?.positives?.[lang];
  if (!positives && entry?.positives) {
    positives = resolveLang(entry.positives, lang);
  }
  if ((!positives || positives === node.positivePossibilities) && Array.isArray(node.positivePossibilities)) {
    positives = node.positivePossibilities.map((p) => translateAstrologicalText(p, lang));
  } else if (Array.isArray(positives)) {
    positives = positives.map((p) => translateAstrologicalText(p, lang));
  }

  let challenges = entry?.challenges?.[lang];
  if (!challenges && entry?.challenges) {
    challenges = resolveLang(entry.challenges, lang);
  }
  if ((!challenges || challenges === node.potentialChallenges) && Array.isArray(node.potentialChallenges)) {
    challenges = node.potentialChallenges.map((c) => translateAstrologicalText(c, lang));
  } else if (Array.isArray(challenges)) {
    challenges = challenges.map((c) => translateAstrologicalText(c, lang));
  }

  const disclaimer = resolveLang(DISCLAIMER_MAP, lang) || node.disclaimer;
  const methodology = getMethodologyName(node.methodology || 'Parashari', lang);

  // Localize deep fields from NODE_DETAILS_MAP or translateAstrologicalText
  const nodeKey = isRahu ? 'Rahu' : 'Ketu';
  const details = (NODE_DETAILS_MAP[nodeKey] && NODE_DETAILS_MAP[nodeKey][hNum]) || {};

  const psychologicalBehaviouralThemes = details.psychologicalBehaviouralThemes
    ? resolveLang(details.psychologicalBehaviouralThemes, lang)
    : (node.psychologicalBehaviouralThemes ? translateAstrologicalText(node.psychologicalBehaviouralThemes, lang) : undefined);

  const relationshipWithBhavaLord = details.relationshipWithBhavaLord
    ? resolveLang(details.relationshipWithBhavaLord, lang)
    : (node.relationshipWithBhavaLord ? translateAstrologicalText(node.relationshipWithBhavaLord, lang) : undefined);

  const relevantRashiInfluence = details.relevantRashiInfluence
    ? resolveLang(details.relevantRashiInfluence, lang)
    : (node.relevantRashiInfluence ? translateAstrologicalText(node.relevantRashiInfluence, lang) : undefined);

  const nakshatraAndLordInfluence = details.nakshatraAndLordInfluence
    ? resolveLang(details.nakshatraAndLordInfluence, lang)
    : (node.nakshatraAndLordInfluence ? translateAstrologicalText(node.nakshatraAndLordInfluence, lang) : undefined);

  const dispositorCondition = details.dispositorCondition
    ? resolveLang(details.dispositorCondition, lang)
    : (node.dispositorCondition ? translateAstrologicalText(node.dispositorCondition, lang) : undefined);

  const aspectsAndConjunctions = details.aspectsAndConjunctions
    ? resolveLang(details.aspectsAndConjunctions, lang)
    : (node.aspectsAndConjunctions ? translateAstrologicalText(node.aspectsAndConjunctions, lang) : undefined);

  const dashaAndAntardashaConditions = details.dashaAndAntardashaConditions
    ? resolveLang(details.dashaAndAntardashaConditions, lang)
    : (node.dashaAndAntardashaConditions ? translateAstrologicalText(node.dashaAndAntardashaConditions, lang) : undefined);

  const transitConditions = details.transitConditions
    ? resolveLang(details.transitConditions, lang)
    : (node.transitConditions ? translateAstrologicalText(node.transitConditions, lang) : undefined);

  const supportingAndContradictoryFactors = details.supportingAndContradictoryFactors
    ? resolveLang(details.supportingAndContradictoryFactors, lang)
    : (node.supportingAndContradictoryFactors ? translateAstrologicalText(node.supportingAndContradictoryFactors, lang) : undefined);

  let strengthModifiers = node.strengthModifiers;
  if (details.strengthModifiers) {
    strengthModifiers = {
      strongerWhen: resolveLang(details.strengthModifiers.strongerWhen, lang) || (node.strengthModifiers?.strongerWhen ? translateAstrologicalText(node.strengthModifiers.strongerWhen, lang) : undefined),
      weakerOrStrainedWhen: resolveLang(details.strengthModifiers.weakerOrStrainedWhen, lang) || (node.strengthModifiers?.weakerOrStrainedWhen ? translateAstrologicalText(node.strengthModifiers.weakerOrStrainedWhen, lang) : undefined),
    };
  } else if (strengthModifiers && typeof strengthModifiers === 'object') {
    strengthModifiers = {
      strongerWhen: translateAstrologicalText(strengthModifiers.strongerWhen, lang),
      weakerOrStrainedWhen: translateAstrologicalText(strengthModifiers.weakerOrStrainedWhen, lang),
    };
  }

  let sourceReferences = details.sourceReferences || node.sourceReferences;
  if (Array.isArray(sourceReferences)) {
    sourceReferences = sourceReferences.map((ref) => translateAstrologicalText(ref, lang));
  }

  // Localize chartContext if present
  let chartContext = node.chartContext;
  if (chartContext && typeof chartContext === 'object') {
    chartContext = {
      ...chartContext,
      sign: getRashiName(chartContext.sign, lang),
      dispositor: typeof chartContext.dispositor === 'object' && chartContext.dispositor !== null
        ? {
            ...chartContext.dispositor,
            planet: getPlanetName(chartContext.dispositor.planet, lang),
            sign: chartContext.dispositor.sign ? getRashiName(chartContext.dispositor.sign, lang) : null,
            dignity: getDignityName(chartContext.dispositor.dignity, lang),
          }
        : (typeof chartContext.dispositor === 'string' ? getPlanetName(chartContext.dispositor, lang) : chartContext.dispositor),
      nakshatra: typeof chartContext.nakshatra === 'object' && chartContext.nakshatra !== null
        ? {
            ...chartContext.nakshatra,
            name: getNakshatraName(chartContext.nakshatra.name, lang),
            lord: getPlanetName(chartContext.nakshatra.lord, lang),
            lordDignity: getDignityName(chartContext.nakshatra.lordDignity, lang),
          }
        : (typeof chartContext.nakshatra === 'string' ? getNakshatraName(chartContext.nakshatra, lang) : chartContext.nakshatra),
      conjunctions: Array.isArray(chartContext.conjunctions)
        ? chartContext.conjunctions.map((c) => ({
            ...c,
            planet: getPlanetName(c.planet || c.name || c, lang),
            dignity: c.dignity ? getDignityName(c.dignity, lang) : c.dignity,
          }))
        : chartContext.conjunctions,
      parashariAspectsReceived: Array.isArray(chartContext.parashariAspectsReceived)
        ? chartContext.parashariAspectsReceived.map((a) => ({
            ...a,
            planet: getPlanetName(a.planet, lang),
            aspectType: localizeParashariAspect(a.aspectType, lang),
          }))
        : chartContext.parashariAspectsReceived,
      divisionalReference: resolveLang(DIVISIONAL_REFERENCE_MAP, lang) || chartContext.divisionalReference,
      methodologyNote: resolveLang(METHODOLOGY_NOTE_MAP, lang) || chartContext.methodologyNote,
    };
  }

  let interpretation = node.interpretation;
  if (interpretation && typeof interpretation === 'object') {
    interpretation = {
      ...interpretation,
      meaning: meaning || (interpretation.meaning ? translateAstrologicalText(interpretation.meaning, lang) : undefined),
      positives: positives || (Array.isArray(interpretation.positives) ? interpretation.positives.map((p) => translateAstrologicalText(p, lang)) : undefined),
      challenges: challenges || (Array.isArray(interpretation.challenges) ? interpretation.challenges.map((c) => translateAstrologicalText(c, lang)) : undefined),
    };
  }

  let nodeInterpretations = node.nodeInterpretations;
  if (nodeInterpretations && typeof nodeInterpretations === 'object' && !Array.isArray(nodeInterpretations)) {
    nodeInterpretations = {
      ...nodeInterpretations,
      psychologicalBehaviouralThemes: psychologicalBehaviouralThemes || (nodeInterpretations.psychologicalBehaviouralThemes ? translateAstrologicalText(nodeInterpretations.psychologicalBehaviouralThemes, lang) : undefined),
      relationshipWithBhavaLord: relationshipWithBhavaLord || (nodeInterpretations.relationshipWithBhavaLord ? translateAstrologicalText(nodeInterpretations.relationshipWithBhavaLord, lang) : undefined),
      relevantRashiInfluence: relevantRashiInfluence || (nodeInterpretations.relevantRashiInfluence ? translateAstrologicalText(nodeInterpretations.relevantRashiInfluence, lang) : undefined),
      nakshatraAndLordInfluence: nakshatraAndLordInfluence || (nodeInterpretations.nakshatraAndLordInfluence ? translateAstrologicalText(nodeInterpretations.nakshatraAndLordInfluence, lang) : undefined),
      dispositorCondition: dispositorCondition || (nodeInterpretations.dispositorCondition ? translateAstrologicalText(nodeInterpretations.dispositorCondition, lang) : undefined),
      aspectsAndConjunctions: aspectsAndConjunctions || (nodeInterpretations.aspectsAndConjunctions ? translateAstrologicalText(nodeInterpretations.aspectsAndConjunctions, lang) : undefined),
      dashaAndAntardashaConditions: dashaAndAntardashaConditions || (nodeInterpretations.dashaAndAntardashaConditions ? translateAstrologicalText(nodeInterpretations.dashaAndAntardashaConditions, lang) : undefined),
      transitConditions: transitConditions || (nodeInterpretations.transitConditions ? translateAstrologicalText(nodeInterpretations.transitConditions, lang) : undefined),
      supportingAndContradictoryFactors: supportingAndContradictoryFactors || (nodeInterpretations.supportingAndContradictoryFactors ? translateAstrologicalText(nodeInterpretations.supportingAndContradictoryFactors, lang) : undefined),
      divisionalReference: resolveLang(DIVISIONAL_REFERENCE_MAP, lang) || (nodeInterpretations.divisionalReference ? translateAstrologicalText(nodeInterpretations.divisionalReference, lang) : undefined),
      methodologyNote: resolveLang(METHODOLOGY_NOTE_MAP, lang) || (nodeInterpretations.methodologyNote ? translateAstrologicalText(nodeInterpretations.methodologyNote, lang) : undefined),
    };
  }

  return {
    ...node,
    planet: locPlanet,
    bhavaName: locBhavaName,
    methodology,
    traditionalMeaning: meaning || node.traditionalMeaning,
    generalLifeThemes: locThemes || node.generalLifeThemes,
    positivePossibilities: positives || node.positivePossibilities,
    potentialChallenges: challenges || node.potentialChallenges,
    psychologicalBehaviouralThemes: psychologicalBehaviouralThemes || node.psychologicalBehaviouralThemes,
    relationshipWithBhavaLord: relationshipWithBhavaLord || node.relationshipWithBhavaLord,
    relevantRashiInfluence: relevantRashiInfluence || node.relevantRashiInfluence,
    nakshatraAndLordInfluence: nakshatraAndLordInfluence || node.nakshatraAndLordInfluence,
    dispositorCondition: dispositorCondition || node.dispositorCondition,
    aspectsAndConjunctions: aspectsAndConjunctions || node.aspectsAndConjunctions,
    dashaAndAntardashaConditions: dashaAndAntardashaConditions || node.dashaAndAntardashaConditions,
    transitConditions: transitConditions || node.transitConditions,
    supportingAndContradictoryFactors: supportingAndContradictoryFactors || node.supportingAndContradictoryFactors,
    strengthModifiers: strengthModifiers || node.strengthModifiers,
    sourceReferences: sourceReferences || node.sourceReferences,
    disclaimer,
    chartContext,
    interpretation: interpretation || node.interpretation,
    nodeInterpretations: nodeInterpretations || node.nodeInterpretations,
  };
}

/**
 * Localizes Kundali / Grahas / Bhavas / Dasha / Yogas / Doshas / Recommendations data
 * Localizes primary display properties in-place while keeping machine IDs intact.
 */
function localizeKundali(data, lang = 'en') {
  if (!data || lang === 'en') return data;
  const loc = getLocale(lang);

  const localized = JSON.parse(JSON.stringify(data));
  localized.localizedLanguage = {
    code: loc.code,
    name: loc.name,
    nativeName: loc.nativeName,
    appName: loc.appName,
  };

  // Root-level metadata fields (e.g. GET /kundali/overview, /kundali/bhavas, /kundali/grahas)
  if (localized.ayanamsa && typeof localized.ayanamsa === 'string') {
    localized.ayanamsa = getAyanamsaName(localized.ayanamsa, lang);
    localized.localizedAyanamsa = localized.ayanamsa;
  }
  if (localized.methodology && typeof localized.methodology === 'string') {
    localized.methodology = getMethodologyName(localized.methodology, lang);
    localized.localizedMethodology = localized.methodology;
  }
  if (localized.nodeCalculationMode && typeof localized.nodeCalculationMode === 'string') {
    localized.localizedNodeCalculationMode = localized.nodeCalculationMode;
  }

  // 1. Grahas array (GET /kundali/grahas)
  if (Array.isArray(localized.grahas)) {
    localized.grahas = localized.grahas.map((g) => {
      const locPlanet = getPlanetName(g.planet || g.name, lang);
      const locSign = getRashiName(g.sign || g.rashiName, lang);
      const locNak = getNakshatraName(g.nakshatra, lang);
      const locDignity = getDignityName(g.dignity, lang);
      const locSignLord = getPlanetName(g.signLord, lang);
      const locNakLord = getPlanetName(g.nakshatraLord, lang);
      const locHouseName = getBhavaName(g.houseNumber || g.house, lang);

      return {
        ...g,
        planet: locPlanet,
        name: locPlanet,
        sign: locSign,
        rashiName: locSign,
        dignity: locDignity,
        nakshatra: locNak,
        signLord: locSignLord,
        nakshatraLord: locNakLord,
        // Additive backward-compatible keys
        localizedPlanet: locPlanet,
        localizedSign: locSign,
        localizedNakshatra: locNak,
        localizedHouseName: locHouseName,
        localizedSignLord: locSignLord,
        localizedNakshatraLord: locNakLord,
        localizedDignity: locDignity,
      };
    });
  }

  // 2. Summary & Overview (GET /kundali/overview)
  if (localized.summary) {
    if (localized.summary.rashi) {
      localized.summary.rashi.english = getRashiName(localized.summary.rashi.english, lang);
      localized.summary.rashi.sanskrit = getSanskritRashiName(localized.summary.rashi.sanskrit, lang);
      localized.summary.rashi.lord = getPlanetName(localized.summary.rashi.lord, lang);
      localized.summary.rashi.element = getElementName(localized.summary.rashi.element, lang);
    }
    if (localized.summary.nakshatra) {
      localized.summary.nakshatra.name = getNakshatraName(localized.summary.nakshatra.name, lang);
      localized.summary.nakshatra.lord = getPlanetName(localized.summary.nakshatra.lord, lang);
      localized.summary.nakshatra.deity = getDeityName(localized.summary.nakshatra.deity, lang);
    }
    if (localized.summary.lagna) {
      localized.summary.lagna.english = getRashiName(localized.summary.lagna.english, lang);
      localized.summary.lagna.sanskrit = getSanskritRashiName(localized.summary.lagna.sanskrit, lang);
      localized.summary.lagna.lord = getPlanetName(localized.summary.lagna.lord, lang);
    }
  }

  // Chart inside overview
  if (localized.chart) {
    localized.chart.chartLabel = CHART_LABELS_MAP[lang] || CHART_LABELS_MAP['hi'] || localized.chart.chartLabel;
    if (localized.chart.ayanamsa) {
      localized.chart.ayanamsa = getAyanamsaName(localized.chart.ayanamsa, lang);
      localized.chart.localizedAyanamsa = localized.chart.ayanamsa;
    }

    if (Array.isArray(localized.chart.houses)) {
      localized.chart.houses = localized.chart.houses.map((h) => ({
        ...h,
        sign: getRashiName(h.sign || h.signName, lang),
        signName: getRashiName(h.signName || h.sign, lang),
        signSanskrit: getSanskritRashiName(h.signSanskrit, lang),
        signLord: getPlanetName(h.signLord, lang),
        rashi: getRashiName(h.rashi || h.sign, lang),
        planets: Array.isArray(h.planets) ? h.planets.map((p) => getPlanetName(p, lang)) : h.planets,
        grahas: Array.isArray(h.grahas)
          ? h.grahas.map((gh) => ({
              ...gh,
              planet: getPlanetName(gh.planet || gh.name, lang),
              name: getPlanetName(gh.name || gh.planet, lang),
              sign: getRashiName(gh.sign, lang),
            }))
          : h.grahas,
      }));
    }
  }

  if (localized.panchang && localized.panchang.ayanamsa) {
    if (typeof localized.panchang.ayanamsa === 'object') {
      localized.panchang.ayanamsa.name = getAyanamsaName(localized.panchang.ayanamsa.name, lang);
    } else if (typeof localized.panchang.ayanamsa === 'string') {
      localized.panchang.ayanamsa = getAyanamsaName(localized.panchang.ayanamsa, lang);
    }
  }

  if (localized.calculation && localized.calculation.ayanamsa) {
    localized.calculation.ayanamsa = getAyanamsaName(localized.calculation.ayanamsa, lang);
  }

  // 3. Bhavas array (GET /kundali/bhavas)
  if (Array.isArray(localized.bhavas)) {
    localized.bhavas = localized.bhavas.map((b) => {
      const hNum = b.number || b.houseNumber || b.house || 1;
      const bhContent = BHAVAS_CONTENT[hNum];
      const locSign = getRashiName(b.sign || b.rashi, lang);
      const locLord = getPlanetName(b.signLord || b.lord, lang);

      const title = bhContent ? resolveLang(bhContent.title, lang) : b.title;
      const name = bhContent ? resolveLang(bhContent.name, lang) : b.name;
      const desc = bhContent ? resolveLang(bhContent.desc, lang) : b.description;
      const sanskritName = SANSKRIT_BHAVA_NAMES[hNum] || b.sanskritName;

      // Localize houseLord
      let houseLord = b.houseLord;
      if (houseLord && typeof houseLord === 'object') {
        houseLord = {
          ...houseLord,
          planet: getPlanetName(houseLord.planet, lang),
          sign: getRashiName(houseLord.sign, lang),
        };
      }

      // Localize planetsPresent
      let planetsPresent = b.planetsPresent;
      if (Array.isArray(planetsPresent)) {
        planetsPresent = planetsPresent.map((p) => getPlanetName(p, lang));
      }

      // Localize aspects
      let aspects = b.aspects;
      if (Array.isArray(aspects)) {
        aspects = aspects.map((a) => ({
          ...a,
          planet: getPlanetName(a.planet, lang),
          aspectType: localizeParashariAspect(a.aspectType, lang),
        }));
      }

      // Localize interpretation
      let interpretation = b.interpretation;
      if (interpretation && typeof interpretation === 'object') {
        const lordName = houseLord?.planet || locLord;
        const hLordNum = houseLord?.houseNumber || hNum;

        const summaryTitle = title.includes(sanskritName) ? title : `${title} (${sanskritName})`;
        const devDigits = (d) => String(d).replace(/\d/g, (c) => ['०','१','२','३','४','५','६','७','८','९'][c]);

        const sumTmpl = resolveLang(BHAVA_INTERPRETATION_TEMPLATES.summary, lang);
        let summary = sumTmpl
          .replace(/{{summaryTitle}}/g, summaryTitle)
          .replace(/{{sign}}/g, locSign)
          .replace(/{{lord}}/g, lordName)
          .replace(/{{houseNum}}/g, devDigits(hLordNum));

        let positiveFactors = interpretation.positiveFactors;
        if (Array.isArray(positiveFactors)) {
          const presTmpl = resolveLang(BHAVA_INTERPRETATION_TEMPLATES.presence, lang);
          const sustTmpl = resolveLang(BHAVA_INTERPRETATION_TEMPLATES.sustained, lang);
          positiveFactors = positiveFactors.map((pf) => {
            if (pf.includes('Planetary presence:')) {
              const pl = pf.replace('Planetary presence:', '').trim().split(',').map((s) => getPlanetName(s.trim(), lang)).join(', ');
              return presTmpl.replace('{{planets}}', pl);
            }
            if (pf.includes('Sustained through lord')) {
              return sustTmpl.replace('{{lord}}', lordName);
            }
            return translateAstrologicalText(pf, lang);
          });
        }

        let challengeFactors = interpretation.challengeFactors;
        if (Array.isArray(challengeFactors)) {
          const maleficStatement = resolveLang(BHAVA_INTERPRETATION_TEMPLATES.maleficAspect, lang);
          challengeFactors = challengeFactors.map((cf) => {
            if (cf.includes('Under Parashari aspect from natural malefics')) {
              return maleficStatement;
            }
            return translateAstrologicalText(cf, lang);
          });
        }

        interpretation = {
          ...interpretation,
          summary,
          positiveFactors,
          challengeFactors,
        };
      }

      // Localize nodeInterpretations if present in this house (e.g. Ketu in House 4, Rahu in House 10)
      let nodeInterpretations = b.nodeInterpretations;
      if (Array.isArray(nodeInterpretations)) {
        nodeInterpretations = nodeInterpretations.map((node) => localizeNodeRecord(node, lang));
      }

      return {
        ...b,
        sign: locSign,
        rashi: locSign,
        signLord: locLord,
        lord: locLord,
        title: title || b.title,
        name: name || b.name,
        sanskritName: sanskritName || b.sanskritName,
        description: desc || b.description,
        houseLord,
        planetsPresent,
        aspects,
        interpretation,
        nodeInterpretations,
        localizedBhavaName: getBhavaName(hNum, lang),
        localizedSign: locSign,
        localizedSignLord: locLord,
      };
    });
  }

  // 4. Vimshottari Dasha (GET /kundali/dasha)
  if (localized.currentMahadasha) {
    const p = localized.currentMahadasha.planet;
    const locP = getPlanetName(p, lang);
    const suffix = resolveLang(MAHADASHA_SUFFIX_MAP, lang) || 'Mahadasha';
    localized.currentMahadasha.planet = locP;
    localized.currentMahadasha.title = `${locP} ${suffix}`;
    localized.currentMahadasha.description = resolveLang(DASHA_DESCRIPTIONS[p], lang) || localized.currentMahadasha.description;
  }
  if (localized.currentAntardasha) {
    const p = localized.currentAntardasha.planet;
    const locP = getPlanetName(p, lang);
    const suffix = resolveLang(ANTARDASHA_SUFFIX_MAP, lang) || 'Antardasha';
    localized.currentAntardasha.planet = locP;
    localized.currentAntardasha.title = `${locP} ${suffix}`;
    localized.currentAntardasha.description = resolveLang(DASHA_DESCRIPTIONS[p], lang) || localized.currentAntardasha.description;
  }
  if (Array.isArray(localized.upcomingAntardashas)) {
    localized.upcomingAntardashas = localized.upcomingAntardashas.map((ua) => {
      const locP = getPlanetName(ua.planet, lang);
      const suffix = resolveLang(ANTARDASHA_SUFFIX_MAP, lang) || 'Antardasha';
      return {
        ...ua,
        planet: locP,
        title: `${locP} ${suffix}`,
        description: resolveLang(DASHA_DESCRIPTIONS[ua.planet], lang) || ua.description,
      };
    });
  }
  if (Array.isArray(localized.mahadashas)) {
    localized.mahadashas = localized.mahadashas.map((m) => ({
      ...m,
      planet: getPlanetName(m.planet, lang),
      antardashas: Array.isArray(m.antardashas)
        ? m.antardashas.map((sp) => ({
            ...sp,
            planet: getPlanetName(sp.planet, lang),
          }))
        : m.antardashas,
    }));
  }
  if (localized.timeline) {
    if (localized.timeline.birthNakshatra) {
      localized.timeline.birthNakshatra = getNakshatraName(localized.timeline.birthNakshatra, lang);
    }
    if (localized.timeline.birthNakshatraLord) {
      localized.timeline.birthNakshatraLord = getPlanetName(localized.timeline.birthNakshatraLord, lang);
    }
    if (localized.timeline.balanceAtBirth && localized.timeline.balanceAtBirth.planet) {
      localized.timeline.balanceAtBirth.planet = getPlanetName(localized.timeline.balanceAtBirth.planet, lang);
    }
  }

  // 5. Yogas (GET /kundali/yogas)
  if (Array.isArray(localized.yogas)) {
    if (localized.methodology) {
      localized.methodology = getMethodologyName(localized.methodology, lang);
    }
    if (localized.ayanamsa) {
      localized.ayanamsa = getAyanamsaName(localized.ayanamsa, lang);
    }
    localized.yogas = localized.yogas.map((y) => {
      const yogaKey = y.id || (y.title ? y.title.toLowerCase().replace(/\s+/g, '-') : '');
      const yogaEntry = YOGAS_MAP[yogaKey];
      const title = yogaEntry ? resolveLang(yogaEntry.title, lang) : y.title;
      const desc = yogaEntry ? resolveLang(yogaEntry.desc, lang) : y.description;

      const badgeTypeRaw = y.badgeType || y.badge || 'present';
      const badgeType = getYogaBadgeName(badgeTypeRaw, lang);
      const badge = getYogaBadgeName(badgeTypeRaw, lang);
      const methodology = getMethodologyName(y.methodology || 'Parashari', lang);

      const planets = Array.isArray(y.planets)
        ? y.planets.map((p) => getPlanetName(p, lang))
        : y.planets;
      const planetsInvolved = Array.isArray(y.planetsInvolved)
        ? y.planetsInvolved.map((p) => getPlanetName(p, lang))
        : planets;

      let sourceReference = y.sourceReference;
      if (sourceReference) {
        sourceReference = localizeSourceReference(sourceReference, lang);
      }
      let sourceReferences = y.sourceReferences;
      if (Array.isArray(sourceReferences)) {
        sourceReferences = sourceReferences.map((ref) => localizeSourceReference(ref, lang));
      }

      const conditions = Array.isArray(y.conditions)
        ? y.conditions.map((c) => ({
            ...c,
            description: desc || c.description,
            evidence: c.evidence && typeof c.evidence === 'object'
              ? {
                  ...c.evidence,
                  planets: Array.isArray(c.evidence.planets)
                    ? c.evidence.planets.map((p) => getPlanetName(p, lang))
                    : c.evidence.planets,
                }
              : c.evidence,
          }))
        : y.conditions;

      const interpretation = y.interpretation
        ? {
            ...y.interpretation,
            summary: desc || y.interpretation.summary,
            positiveIndications: desc ? [desc] : y.interpretation.positiveIndications,
          }
        : y.interpretation;

      let evidence = y.evidence;
      if (evidence && typeof evidence === 'object') {
        evidence = {
          ...evidence,
          planets: Array.isArray(evidence.planets)
            ? evidence.planets.map((p) => getPlanetName(p, lang))
            : evidence.planets,
        };
      }

      const sign = y.sign ? getRashiName(y.sign, lang) : y.sign;

      return {
        ...y,
        title: title || y.title,
        description: desc || y.description,
        badge,
        badgeType,
        methodology,
        sign,
        planets,
        planetsInvolved,
        evidence: evidence || y.evidence,
        sourceReference,
        sourceReferences,
        conditions,
        interpretation,
      };
    });
  }

  // 6. Doshas (GET /kundali/doshas)
  if (localized.manglik) {
    localized.manglik.name = getDoshaName('manglik', lang);
    localized.manglik.localizedName = getDoshaName('manglik', lang);
    localized.manglik.statusLabel = localized.manglik.isPresent
      ? resolveLang(DOSHA_STATUS_MAP.present, lang)
      : resolveLang(DOSHA_STATUS_MAP.notPresent, lang);
    localized.manglik.explanation = localized.manglik.isPresent
      ? resolveLang(DOSHAS_CONTENT.manglik.present, lang)
      : resolveLang(DOSHAS_CONTENT.manglik.notPresent, lang);

    if (Array.isArray(localized.manglik.checkedFrom)) {
      localized.manglik.checkedFrom = localized.manglik.checkedFrom.map((cf) => getCheckedFromName(cf, lang));
    }

    if (Array.isArray(localized.manglik.ruleDetails)) {
      localized.manglik.ruleDetails = localized.manglik.ruleDetails.map((r) => {
        const tmpl = DOSHAS_CONTENT.manglik.ruleDesc[r.reference]
          ? resolveLang(DOSHAS_CONTENT.manglik.ruleDesc[r.reference], lang)
          : null;
        return {
          ...r,
          reference: getCheckedFromName(r.reference, lang),
          localizedReference: getCheckedFromName(r.reference, lang),
          description: tmpl ? tmpl.replace('{{house}}', r.marsHouse) : r.description,
        };
      });
    }
  }

  if (localized.kalsarpa) {
    localized.kalsarpa.name = getDoshaName('kalsarpa', lang);
    localized.kalsarpa.localizedName = getDoshaName('kalsarpa', lang);
    localized.kalsarpa.statusLabel = localized.kalsarpa.isPresent
      ? resolveLang(DOSHA_STATUS_MAP.present, lang)
      : resolveLang(DOSHA_STATUS_MAP.notPresent, lang);
    localized.kalsarpa.explanation = localized.kalsarpa.isPresent
      ? resolveLang(DOSHAS_CONTENT.kalsarpa.present, lang)
      : resolveLang(DOSHAS_CONTENT.kalsarpa.notPresent, lang);
  }

  if (localized.sadeSati) {
    localized.sadeSati.name = getDoshaName('sadeSati', lang);
    localized.sadeSati.localizedName = getDoshaName('sadeSati', lang);
    if (localized.sadeSati.phase && DOSHAS_CONTENT.sadeSati.phases[localized.sadeSati.phase]) {
      localized.sadeSati.phase = resolveLang(DOSHAS_CONTENT.sadeSati.phases[localized.sadeSati.phase], lang);
    }
    if (localized.sadeSati.saturnTransitSign) {
      localized.sadeSati.saturnTransitSign = getRashiName(localized.sadeSati.saturnTransitSign, lang);
    }
    if (localized.sadeSati.moonSign) {
      localized.sadeSati.moonSign = getRashiName(localized.sadeSati.moonSign, lang);
    }
    if (localized.sadeSati.isActive) {
      if (localized.sadeSati.phase && localized.sadeSati.phase.includes('1st')) {
        localized.sadeSati.explanation = resolveLang(DOSHAS_CONTENT.sadeSati.explanations.rising, lang);
      } else if (localized.sadeSati.phase && localized.sadeSati.phase.includes('3rd')) {
        localized.sadeSati.explanation = resolveLang(DOSHAS_CONTENT.sadeSati.explanations.setting, lang);
      } else {
        localized.sadeSati.explanation = resolveLang(DOSHAS_CONTENT.sadeSati.explanations.peak, lang);
      }
    } else {
      localized.sadeSati.explanation = resolveLang(DOSHAS_CONTENT.sadeSati.explanations.notActive, lang);
    }
  }

  if (Array.isArray(localized.doshas)) {
    localized.doshas = localized.doshas.map((d) => {
      let checkedFrom = d.checkedFrom;
      if (Array.isArray(checkedFrom)) {
        checkedFrom = checkedFrom.map((cf) => getCheckedFromName(cf, lang));
      } else if (typeof checkedFrom === 'string') {
        checkedFrom = getCheckedFromName(checkedFrom, lang);
      }
      let statusLabel = d.statusLabel;
      if (statusLabel) {
        statusLabel = resolveLang(DOSHA_STATUS_MAP[statusLabel.toLowerCase().includes('not') ? 'notPresent' : 'present'], lang) || statusLabel;
      }
      let ruleDetails = d.ruleDetails;
      if (Array.isArray(ruleDetails)) {
        ruleDetails = ruleDetails.map((r) => ({
          ...r,
          reference: getCheckedFromName(r.reference, lang),
          localizedReference: getCheckedFromName(r.reference, lang),
        }));
      } else if (ruleDetails && typeof ruleDetails === 'object') {
        ruleDetails = {
          ...ruleDetails,
          reference: getCheckedFromName(ruleDetails.reference, lang),
          localizedReference: getCheckedFromName(ruleDetails.reference, lang),
        };
      }
      return {
        ...d,
        name: getDoshaName(d.id || d.name, lang),
        checkedFrom,
        statusLabel,
        ruleDetails,
      };
    });
  }

  // 7. Recommendations (GET /kundali/recommendations)
  if (localized.rudraksha) {
    const mukhi = localized.rudraksha.recommendedMukhi || 1;
    localized.rudraksha.name = (RUDRAKSHA_NAMES[mukhi] && resolveLang(RUDRAKSHA_NAMES[mukhi], lang)) || localized.rudraksha.name;
    localized.rudraksha.rulingPlanet = getPlanetName(localized.rudraksha.rulingPlanet, lang);
    localized.rudraksha.associatedDeity = getDeityName(localized.rudraksha.associatedDeity, lang);
    localized.rudraksha.reason = resolveLang(RECOMMENDATIONS_TEXT.rudrakshaReason, lang) || localized.rudraksha.reason;
    localized.rudraksha.benefits = resolveLang(RECOMMENDATIONS_TEXT.benefits, lang) || localized.rudraksha.benefits;
    localized.rudraksha.howToWear = resolveLang(RECOMMENDATIONS_TEXT.howToWear, lang) || localized.rudraksha.howToWear;
    localized.rudraksha.precautions = resolveLang(RECOMMENDATIONS_TEXT.precautions, lang) || localized.rudraksha.precautions;
    localized.rudraksha.mantra = getRudrakshaMantra(mukhi, lang) || localized.rudraksha.mantra;
    localized.rudraksha.disclaimer = resolveLang(RECOMMENDATIONS_TEXT.disclaimer, lang) || localized.rudraksha.disclaimer;
  }

  if (localized.gemstones) {
    for (const key of ['lifeStone', 'luckyStone', 'fortuneStone']) {
      const stone = localized.gemstones[key];
      if (stone) {
        const rawName = stone.name;
        stone.name = getGemstoneName(rawName, lang);
        stone.regionalName = getGemstoneRegionalName(rawName, lang) || stone.regionalName;
        stone.mantra = getGemstoneMantra(rawName, lang) || stone.mantra;
        stone.planet = getPlanetName(stone.planet, lang);
        if (stone.howToWear) {
          stone.howToWear.metal = getMetalName(stone.howToWear.metal, lang);
          stone.howToWear.finger = getFingerName(stone.howToWear.finger, lang);
        }
      }
    }
  }

  // 8. Strengths & Shadbala (GET /kundali/strengths)
  if (localized.shadbala) {
    if (Array.isArray(localized.shadbala.planets)) {
      localized.shadbala.planets = localized.shadbala.planets.map((p) => ({
        ...p,
        planet: getPlanetName(p.planet, lang),
        localizedPlanet: getPlanetName(p.planet, lang),
      }));
    }
    localized.shadbala.localizedUnit = resolveLang(SHADBALA_UNIT_MAP, lang) || 'Virupa';
  }
  if (localized.bhavbala) {
    if (Array.isArray(localized.bhavbala.houses)) {
      localized.bhavbala.houses = localized.bhavbala.houses.map((h) => ({
        ...h,
        localizedHouse: getBhavaName(h.house, lang),
      }));
    }
  }

  if (Array.isArray(localized.planets)) {
    localized.planets = localized.planets.map((p) => ({
      ...p,
      planet: getPlanetName(p.planet, lang),
      sign: p.sign ? getRashiName(p.sign, lang) : p.sign,
    }));
  }
  if (Array.isArray(localized.cusps)) {
    localized.cusps = localized.cusps.map((c) => ({
      ...c,
      sign: getRashiName(c.sign, lang),
      signLord: getPlanetName(c.signLord, lang),
    }));
  }

  // 9. Ashtakavarga
  if (localized.sarvashtakavarga) {
    if (Array.isArray(localized.sarvashtakavarga.signBindus)) {
      localized.sarvashtakavarga.signBindus = localized.sarvashtakavarga.signBindus.map((s) => ({
        ...s,
        sign: getRashiName(s.sign, lang),
        localizedSign: getRashiName(s.sign, lang),
      }));
    } else if (Array.isArray(localized.sarvashtakavarga)) {
      localized.sarvashtakavarga = localized.sarvashtakavarga.map((s) => ({
        ...s,
        sign: getRashiName(s.sign, lang),
        localizedSign: getRashiName(s.sign, lang),
      }));
    }
  }
  if (Array.isArray(localized.bhinnaAshtakavarga)) {
    localized.bhinnaAshtakavarga = localized.bhinnaAshtakavarga.map((b) => ({
      ...b,
      planet: getPlanetName(b.planet, lang),
      signBindus: Array.isArray(b.signBindus)
        ? b.signBindus.map((s) => ({
            ...s,
            sign: getRashiName(s.sign, lang),
            localizedSign: getRashiName(s.sign, lang),
          }))
        : b.signBindus,
    }));
  }

  // 10. Vargas (GET /kundali/vargas)
  if (Array.isArray(localized.vargas)) {
    localized.vargas = localized.vargas.map((v) => {
      const vEntry = VARGAS_MAP[v.code];
      const title = vEntry ? resolveLang(vEntry.title, lang) : v.title;
      const description = vEntry ? resolveLang(vEntry.desc, lang) : v.description;
      let chartData = v.chartData;
      if (chartData && typeof chartData === 'object') {
        chartData = {
          ...chartData,
          ascendantSign: chartData.ascendantSign ? getRashiName(chartData.ascendantSign, lang) : chartData.ascendantSign,
          houses: Array.isArray(chartData.houses)
            ? chartData.houses.map((h) => ({
                ...h,
                sign: getRashiName(h.sign, lang),
                signLord: getPlanetName(h.signLord, lang),
              }))
            : chartData.houses,
        };
      }
      return {
        ...v,
        title: title || v.title,
        description: description || v.description,
        rashiName: v.rashiName ? getRashiName(v.rashiName, lang) : v.rashiName,
        chartData,
      };
    });
  }

  // 11. Transits / Gochar (GET /kundali/transits)
  if (localized.lagnaTransitChart && Array.isArray(localized.lagnaTransitChart.houses)) {
    localized.lagnaTransitChart.houses = localized.lagnaTransitChart.houses.map((h) => ({
      ...h,
      signName: getRashiName(h.signName, lang),
      signSanskrit: getSanskritRashiName(h.signSanskrit || h.signName, lang),
      planets: Array.isArray(h.planets) ? h.planets.map((p) => getPlanetName(p, lang)) : h.planets,
    }));
  }
  if (localized.moonTransitChart && Array.isArray(localized.moonTransitChart.houses)) {
    localized.moonTransitChart.houses = localized.moonTransitChart.houses.map((h) => ({
      ...h,
      signName: getRashiName(h.signName, lang),
      signSanskrit: getSanskritRashiName(h.signSanskrit || h.signName, lang),
      planets: Array.isArray(h.planets) ? h.planets.map((p) => getPlanetName(p, lang)) : h.planets,
    }));
  }
  if (Array.isArray(localized.transitingPlanets)) {
    localized.transitingPlanets = localized.transitingPlanets.map((tp) => ({
      ...tp,
      name: getPlanetName(tp.name || tp.id, lang),
      sign: getRashiName(tp.sign, lang),
      signSanskrit: getSanskritRashiName(tp.signSanskrit || tp.sign, lang),
    }));
  }

  // 12. KP Astrology (GET /kundali/kp)
  if (localized.bhavChalitChart && Array.isArray(localized.bhavChalitChart.houses)) {
    localized.bhavChalitChart.houses = localized.bhavChalitChart.houses.map((h) => ({
      ...h,
      sign: getRashiName(h.sign, lang),
      signLord: getPlanetName(h.signLord, lang),
    }));
  }
  if (localized.rulingPlanets && typeof localized.rulingPlanets === 'object') {
    const rp = localized.rulingPlanets;
    localized.rulingPlanets = {
      ...rp,
      ascSignLord: getPlanetName(rp.ascSignLord, lang),
      ascStarLord: getPlanetName(rp.ascStarLord, lang),
      ascSubLord: getPlanetName(rp.ascSubLord, lang),
      moonSignLord: getPlanetName(rp.moonSignLord, lang),
      moonStarLord: getPlanetName(rp.moonStarLord, lang),
      moonSubLord: getPlanetName(rp.moonSubLord, lang),
      dayLord: getPlanetName(rp.dayLord, lang),
    };
  }
  if (Array.isArray(localized.kpPlanets)) {
    localized.kpPlanets = localized.kpPlanets.map((p) => ({
      ...p,
      planet: getPlanetName(p.planet, lang),
      sign: getRashiName(p.sign, lang),
      signLord: getPlanetName(p.signLord, lang),
      star: getNakshatraName(p.star, lang),
      starLord: getPlanetName(p.starLord, lang),
      subLord: getPlanetName(p.subLord, lang),
    }));
  }
  if (Array.isArray(localized.kpCusps)) {
    localized.kpCusps = localized.kpCusps.map((c) => ({
      ...c,
      sign: getRashiName(c.sign, lang),
      signLord: getPlanetName(c.signLord, lang),
      star: getNakshatraName(c.star, lang),
      starLord: getPlanetName(c.starLord, lang),
      subLord: getPlanetName(c.subLord, lang),
    }));
  }

  // 11. Rahu-Ketu Bhava Analysis (GET /kundali/bhavas)
  if (localized.rahuKetuAnalysis && typeof localized.rahuKetuAnalysis === 'object') {
    const rk = localized.rahuKetuAnalysis;
    const methodology = getMethodologyName(rk.methodology || 'Parashari', lang);
    const disclaimer = resolveLang(DISCLAIMER_MAP, lang) || rk.disclaimer;

    localized.rahuKetuAnalysis = {
      ...rk,
      methodology,
      disclaimer,
      rahu: rk.rahu ? localizeNodeRecord({ planet: 'Rahu', ...rk.rahu }, lang) : null,
      ketu: rk.ketu ? localizeNodeRecord({ planet: 'Ketu', ...rk.ketu }, lang) : null,
    };
  }

  return localized;
}

/**
 * Localizes Matchmaking / Ashtakoota data
 */
function localizeMatchmaking(data, lang = 'en') {
  if (!data || lang === 'en') return data;
  const loc = getLocale(lang);

  const localized = JSON.parse(JSON.stringify(data));
  localized.localizedLanguage = {
    code: loc.code,
    name: loc.name,
    nativeName: loc.nativeName,
    appName: loc.appName,
  };

  // Root-level metadata fields (e.g. GET /kundali/overview, /kundali/bhavas, /kundali/grahas)
  if (localized.ayanamsa && typeof localized.ayanamsa === 'string') {
    localized.ayanamsa = getAyanamsaName(localized.ayanamsa, lang);
    localized.localizedAyanamsa = localized.ayanamsa;
  }
  if (localized.methodology && typeof localized.methodology === 'string') {
    localized.methodology = getMethodologyName(localized.methodology, lang);
    localized.localizedMethodology = localized.methodology;
  }
  if (localized.nodeCalculationMode && typeof localized.nodeCalculationMode === 'string') {
    localized.localizedNodeCalculationMode = localized.nodeCalculationMode;
  }

  // 1. Localize person1 and person2
  for (const pKey of ['person1', 'person2']) {
    if (localized[pKey] && typeof localized[pKey] === 'object') {
      const p = localized[pKey];
      localized[pKey] = {
        ...p,
        moonSign: p.moonSign ? getRashiName(p.moonSign, lang) : p.moonSign,
        nakshatra: p.nakshatra ? getNakshatraName(p.nakshatra, lang) : p.nakshatra,
        rashi: p.rashi ? getRashiName(p.rashi, lang) : p.rashi,
        rashiLord: p.rashiLord ? getPlanetName(p.rashiLord, lang) : p.rashiLord,
        nakshatraLord: p.nakshatraLord ? getPlanetName(p.nakshatraLord, lang) : p.nakshatraLord,
      };
    }
  }

  // 2. Localize overall score and verdict
  if (localized.overall && typeof localized.overall === 'object') {
    const ov = localized.overall;
    const score = ov.gunasObtained !== undefined ? ov.gunasObtained : (parseFloat(ov.percentage) * 36 / 100 || 28);
    const verdictKey = score >= 25 ? 'highVerdict' : (score >= 18 ? 'moderateVerdict' : 'lowVerdict');
    const descKey = score >= 25 ? 'highDesc' : (score >= 18 ? 'moderateDesc' : 'lowDesc');

    localized.overall = {
      ...ov,
      verdict: resolveLang(OVERALL_MATCH_CONTENT[verdictKey], lang) || ov.verdict,
      verdictDescription: resolveLang(OVERALL_MATCH_CONTENT[descKey], lang) || ov.verdictDescription,
    };
  }

  // 3. Localize highlights array
  if (Array.isArray(localized.highlights)) {
    localized.highlights = localized.highlights.map((h) => {
      const hContent = HIGHLIGHTS_MAP[h.id];
      if (!hContent) return h;
      const scoreNum = parseFloat(h.score) || 75;
      const level = scoreNum >= 75 ? 'high' : (scoreNum >= 50 ? 'moderate' : 'low');
      const title = resolveLang(hContent.title, lang) || h.title;
      const desc = resolveLang(hContent[level], lang) || h.description;
      return {
        ...h,
        title,
        description: desc,
      };
    });
  }

  // 4. Localize manglikAnalysis
  if (localized.manglikAnalysis && typeof localized.manglikAnalysis === 'object') {
    const ma = localized.manglikAnalysis;
    const isCancelled = ma.isManglikDoshaCancelled !== undefined
      ? ma.isManglikDoshaCancelled
      : (ma.person1Manglik === ma.person2Manglik);
    const summaryKey = isCancelled ? 'cancelledSummary' : 'afflictedSummary';
    const statusKey = isCancelled ? 'cancelledStatus' : 'afflictedStatus';

    localized.manglikAnalysis = {
      ...ma,
      summary: resolveLang(MANGLIK_ANALYSIS_CONTENT[summaryKey], lang) || ma.summary,
      status: resolveLang(MANGLIK_ANALYSIS_CONTENT[statusKey], lang) || ma.status,
    };
  }

  // 5. Localize detailedAspects array
  if (Array.isArray(localized.detailedAspects)) {
    localized.detailedAspects = localized.detailedAspects.map((da) => {
      const aContent = HIGHLIGHTS_MAP[da.id] || DETAILED_ASPECTS_MAP[da.id];
      const scoreNum = parseFloat(da.score) || 70;
      const level = scoreNum >= 70 ? 'high' : 'low';
      const title = (aContent && resolveLang(aContent.title, lang)) || da.title;
      const desc = (aContent && aContent[level] && resolveLang(aContent[level], lang)) || da.description;
      const details = getLocalizedAspectDetails(da.id, da.details, lang);
      return {
        ...da,
        title,
        description: desc,
        details,
      };
    });
  }

  // 6. Localize ashtakoota gunas array
  if (Array.isArray(localized.ashtakootaGunas)) {
    localized.ashtakootaGunas = localized.ashtakootaGunas.map((g) => {
      const kootaKey = g.koota || g.guna || g.category;
      const locKoota = getAshtakootaName(kootaKey, lang);
      return {
        ...g,
        koota: locKoota,
        category: locKoota,
        localizedCategory: locKoota,
        description: getLocalizedKootaDescription(kootaKey, lang, g.description),
      };
    });
  }

  // 7. Localize overallRecommendation
  if (localized.overallRecommendation) {
    const score = localized.overall?.gunasObtained || localized.overall?.score || localized.overallScore || 28;
    localized.overallRecommendation = getLocalizedMatchmakingRecommendation(
      score,
      lang,
      localized.overallRecommendation
    );
  }

  return localized;
}

/**
 * Localizes Home Dashboard (kundaliCard, dailyPanchangSnippet, vidhilikhitBotBanner)
 */
function localizeDashboard(data, lang = 'en') {
  if (!data || lang === 'en') return data;
  const loc = getLocale(lang);
  const dashContent = DASHBOARD_CONTENT[lang] || DASHBOARD_CONTENT['hi'] || DASHBOARD_CONTENT['mr'];

  const localized = JSON.parse(JSON.stringify(data));
  localized.localizedLanguage = {
    code: loc.code,
    name: loc.name,
    nativeName: loc.nativeName,
    appName: loc.appName,
  };

  // Root-level metadata fields (e.g. GET /kundali/overview, /kundali/bhavas, /kundali/grahas)
  if (localized.ayanamsa && typeof localized.ayanamsa === 'string') {
    localized.ayanamsa = getAyanamsaName(localized.ayanamsa, lang);
    localized.localizedAyanamsa = localized.ayanamsa;
  }
  if (localized.methodology && typeof localized.methodology === 'string') {
    localized.methodology = getMethodologyName(localized.methodology, lang);
    localized.localizedMethodology = localized.methodology;
  }
  if (localized.nodeCalculationMode && typeof localized.nodeCalculationMode === 'string') {
    localized.localizedNodeCalculationMode = localized.nodeCalculationMode;
  }

  // 1. kundaliCard
  if (localized.kundaliCard) {
    if (dashContent?.kundaliCard) {
      localized.kundaliCard.title = dashContent.kundaliCard.title || localized.kundaliCard.title;
      localized.kundaliCard.subtitle = dashContent.kundaliCard.subtitle || localized.kundaliCard.subtitle;
    }
    // Rashi (e.g. "Leo (Simha)")
    if (localized.kundaliCard.rashi) {
      const match = localized.kundaliCard.rashi.match(/^([A-Za-z]+)/);
      if (match) {
        localized.kundaliCard.rashi = getRashiName(match[1], lang);
      }
    }
    // Lagna (e.g. "Scorpio (Vrischika)")
    if (localized.kundaliCard.lagna) {
      const match = localized.kundaliCard.lagna.match(/^([A-Za-z]+)/);
      if (match) {
        localized.kundaliCard.lagna = getRashiName(match[1], lang);
      }
    }
  }

  // 2. dailyPanchangSnippet
  if (localized.dailyPanchangSnippet) {
    if (localized.dailyPanchangSnippet.tithi) {
      localized.dailyPanchangSnippet.tithi = localizeTithi(localized.dailyPanchangSnippet.tithi, lang);
    }
    if (localized.dailyPanchangSnippet.nakshatra) {
      localized.dailyPanchangSnippet.nakshatra = getNakshatraName(localized.dailyPanchangSnippet.nakshatra, lang);
    }
    if (localized.dailyPanchangSnippet.auspiciousTime && dashContent?.dailyPanchang?.auspiciousLabel) {
      localized.dailyPanchangSnippet.auspiciousTime = localized.dailyPanchangSnippet.auspiciousTime.replace(
        /Abhijit/gi,
        dashContent.dailyPanchang.auspiciousLabel
      );
    }
  }

  // 3. vidhilikhitBotBanner
  if (localized.vidhilikhitBotBanner && dashContent?.vidhilikhitBotBanner) {
    localized.vidhilikhitBotBanner.title = dashContent.vidhilikhitBotBanner.title;
    localized.vidhilikhitBotBanner.subtitle = dashContent.vidhilikhitBotBanner.subtitle;
    localized.vidhilikhitBotBanner.promptSuggestion = dashContent.vidhilikhitBotBanner.promptSuggestion;
  }

  return localized;
}

/**
 * Localizes Daily Guidance & Panchang
 */
function localizeGuidance(data, lang = 'en') {
  if (!data || lang === 'en') return data;
  const loc = getLocale(lang);
  const guideContent = GUIDANCE_CONTENT[lang] || GUIDANCE_CONTENT['hi'] || GUIDANCE_CONTENT['mr'];

  const localized = JSON.parse(JSON.stringify(data));
  localized.localizedLanguage = {
    code: loc.code,
    name: loc.name,
    nativeName: loc.nativeName,
    appName: loc.appName,
  };

  // Root-level metadata fields (e.g. GET /kundali/overview, /kundali/bhavas, /kundali/grahas)
  if (localized.ayanamsa && typeof localized.ayanamsa === 'string') {
    localized.ayanamsa = getAyanamsaName(localized.ayanamsa, lang);
    localized.localizedAyanamsa = localized.ayanamsa;
  }
  if (localized.methodology && typeof localized.methodology === 'string') {
    localized.methodology = getMethodologyName(localized.methodology, lang);
    localized.localizedMethodology = localized.methodology;
  }
  if (localized.nodeCalculationMode && typeof localized.nodeCalculationMode === 'string') {
    localized.localizedNodeCalculationMode = localized.nodeCalculationMode;
  }

  // Timeframe and Day Name
  if (localized.timeframe) {
    localized.timeframe = getTimeframeName(localized.timeframe, lang);
  }
  if (localized.dayName) {
    localized.dayName = getDayName(localized.dayName, lang);
  }

  // Panchang
  if (localized.panchang) {
    if (localized.panchang.tithi) {
      localized.panchang.tithi = localizeTithi(localized.panchang.tithi, lang);
    }
    if (localized.panchang.nakshatra) {
      localized.panchang.nakshatra = getNakshatraName(localized.panchang.nakshatra, lang);
    }
    if (localized.panchang.abhijitMuhurat) {
      const muhuratLabel = resolveLang(ABHIJIT_MUHURAT_MAP, lang) || 'Abhijit';
      localized.panchang.abhijitMuhurat = localized.panchang.abhijitMuhurat.replace(/Abhijit/gi, muhuratLabel);
    }
  }

  // Overall guidance
  if (localized.overall && guideContent?.overall) {
    localized.overall.title = guideContent.overall.title || localized.overall.title;
    localized.overall.description = guideContent.overall.description || localized.overall.description;
  }

  // Domains
  if (localized.domains && guideContent?.domains) {
    for (const key of ['career', 'finance', 'relationships', 'health']) {
      if (localized.domains[key] && guideContent.domains[key]) {
        localized.domains[key].title = guideContent.domains[key].title;
        localized.domains[key].description = guideContent.domains[key].description;
      }
    }
  }

  // Lucky elements
  if (localized.luckyElements) {
    if (localized.luckyElements.direction) {
      const dirEntry = DIRECTIONS_MAP[localized.luckyElements.direction];
      if (dirEntry) {
        localized.luckyElements.direction = resolveLang(dirEntry, lang) || localized.luckyElements.direction;
      } else if (guideContent?.directions?.[localized.luckyElements.direction]) {
        localized.luckyElements.direction = guideContent.directions[localized.luckyElements.direction];
      }
    }
    if (localized.luckyElements.colorName) {
      const colEntry = COLORS_MAP[localized.luckyElements.colorName];
      if (colEntry) {
        localized.luckyElements.colorName = resolveLang(colEntry, lang) || localized.luckyElements.colorName;
      } else if (guideContent?.colors?.[localized.luckyElements.colorName]) {
        localized.luckyElements.colorName = guideContent.colors[localized.luckyElements.colorName];
      }
    }
    if (localized.luckyElements.gemstone) {
      localized.luckyElements.gemstone = getGemstoneName(localized.luckyElements.gemstone, lang);
    }
  }

  // Affirmation
  if (localized.affirmation && guideContent?.affirmation) {
    localized.affirmation.title = guideContent.affirmation.title;
    localized.affirmation.quote = guideContent.affirmation.quote;
  }

  return localized;
}

/**
 * Localizes Report Catalog array (Flow 7 & Kundali Reports)
 */
function localizeReportCatalog(catalog, lang = 'en') {
  if (!Array.isArray(catalog) || lang === 'en') return catalog;
  return catalog.map((item) => {
    const rContent = REPORT_CONTENT[item.id];
    if (!rContent) return item;
    return {
      ...item,
      title: resolveLang(rContent.title, lang) || item.title,
      description: resolveLang(rContent.description, lang) || item.description,
    };
  });
}

module.exports = {
  SUPPORTED_CODES,
  LANGUAGE_METADATA,
  normalizeLanguage,
  getLocale,
  t,
  getPlanetName,
  getRashiName,
  getNakshatraName,
  getBhavaName,
  getAshtakootaName,
  getDoshaName,
  getArchetypeName,
  getGemstoneName,
  getElementName,
  getDayName,
  getTimeframeName,
  getDignityName,
  getMetalName,
  getFingerName,
  getDeityName,
  localizeNumerology,
  localizeKundali,
  localizeNodeRecord,
  localizeMatchmaking,
  localizeDashboard,
  localizeGuidance,
  localizeReportCatalog,
  getLocalizedDestinyTitle,
  getLocalizedCoreTitle,
  getLocalizedPersonalMonthTheme,
  getLocalizedPersonalDayTheme,
  getLocalizedDayLabel,
  getLocalizedCalculationComponent,
  getLocalizedPlanetarySynergy,
};

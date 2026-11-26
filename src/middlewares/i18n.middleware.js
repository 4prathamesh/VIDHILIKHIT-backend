// Assumption: i18n middleware intercepts requests, extracts target language, and auto-localizes responses.
const {
  normalizeLanguage,
  t,
  localizeNumerology,
  localizeKundali,
  localizeMatchmaking,
  localizeDashboard,
  localizeGuidance,
  localizeReportCatalog,
} = require('../i18n');

function i18nMiddleware(req, res, next) {
  // 1. Detect language from query, header, or body
  const queryLang = req.query?.lang || req.query?.language;
  const headerLang = req.headers?.['x-language'] || req.headers?.['accept-language'];
  const bodyLang = req.body?.language || req.body?.lang;

  const rawLang = queryLang || headerLang || bodyLang || 'en';
  const lang = normalizeLanguage(rawLang);

  req.lang = lang;
  req.t = (key, params) => t(key, lang, params);

  // Set HTTP response header
  res.setHeader('Content-Language', lang);

  // 2. Wrap res.json to auto-localize response payload
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    if (body && typeof body === 'object') {
      // Translate top-level response message if available
      if (body.message && typeof body.message === 'string') {
        body.message = req.t(body.message);
      }

      // If a non-English language is requested and data exists, localize domain entities
      if (lang !== 'en' && body.data) {
        try {
          // Handle Array responses (e.g. Reports Catalog or Vargas)
          if (Array.isArray(body.data)) {
            if (body.data.length > 0 && body.data[0]?.iconKey?.startsWith('report_')) {
              body.data = localizeReportCatalog(body.data, lang);
            } else if (body.data.length > 0 && body.data[0]?.code?.startsWith('D')) {
              body.data = localizeKundali({ vargas: body.data }, lang).vargas;
            }
          } else if (typeof body.data === 'object') {
            // Check for Reports catalog wrapper { reports: [...] }
            if (Array.isArray(body.data.reports)) {
              body.data.reports = localizeReportCatalog(body.data.reports, lang);
            }

            // Dashboard responses
            else if (
              body.data.kundaliCard ||
              body.data.dailyPanchangSnippet ||
              body.data.vidhilikhitBotBanner
            ) {
              body.data = localizeDashboard(body.data, lang);
            }

            // Daily Guidance responses
            else if (
              body.data.domains ||
              body.data.luckyElements ||
              body.data.affirmation ||
              (body.data.panchang && body.data.timeframe) ||
              (body.data.overall && body.data.panchang)
            ) {
              body.data = localizeGuidance(body.data, lang);
            }

            // Matchmaking responses
            else if (
              body.data.ashtakootaGunas ||
              body.data.overallRecommendation ||
              body.data.manglikAnalysis ||
              body.data.detailedAspects ||
              (body.data.person1 && body.data.person2)
            ) {
              body.data = localizeMatchmaking(body.data, lang);
            }

            // Numerology responses
            else if (
              body.data.goldenTrio ||
              body.data.birthNumber ||
              body.data.coreNumbers ||
              body.data.driverNumber ||
              body.data.destinyNumber ||
              body.data.archetype ||
              (body.data.number && body.data.summary) ||
              body.data.personalCycles ||
              body.data.personalYear ||
              body.data.personalMonth ||
              body.data.personalDay ||
              body.data.selectedYear ||
              body.data.multiYearForecast ||
              body.data.alignmentCards ||
              body.data.compatibilityScore !== undefined ||
              body.data.nameBreakdown ||
              body.data.destinyBreakdown
            ) {
              body.data = localizeNumerology(body.data, lang);
            }

            // Kundali responses (overview, grahas, bhavas, dasha, yogas, doshas, recommendations, strengths, etc.)
            else if (
              body.data.grahas ||
              body.data.bhavas ||
              body.data.lagna ||
              body.data.overview ||
              body.data.summary ||
              body.data.chart ||
              body.data.currentMahadasha ||
              body.data.timeline ||
              body.data.yogas ||
              body.data.totalYogasDetected ||
              body.data.manglik ||
              body.data.kalsarpa ||
              body.data.sadeSati ||
              body.data.rudraksha ||
              body.data.gemstones ||
              body.data.vargas ||
              body.data.sarvashtakavarga ||
              body.data.bhinnaAshtakavarga ||
              body.data.cusps ||
              body.data.shadbala ||
              body.data.bhavbala ||
              body.data.planets ||
              body.data.lagnaTransitChart ||
              body.data.moonTransitChart ||
              body.data.transitingPlanets ||
              body.data.bhavChalitChart ||
              body.data.rulingPlanets ||
              body.data.kpPlanets ||
              body.data.kpCusps ||
              body.data.rahuKetuAnalysis
            ) {
              body.data = localizeKundali(body.data, lang);
            }
          }

          // Add language tag in response envelope for frontend awareness
          body.language = lang;
        } catch (e) {
          // Silently proceed with original data if localization error occurs
          console.error('Error during response localization:', e);
        }
      }
    }

    return originalJson(body);
  };

  next();
}

module.exports = i18nMiddleware;

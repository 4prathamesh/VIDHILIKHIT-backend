// Controller for Internationalization metadata & translations
const { LANGUAGE_METADATA, getLocale, normalizeLanguage } = require('../i18n');
const { success } = require('../utils/response');

class I18nController {
  getLanguages(req, res, next) {
    try {
      return success(
        res,
        {
          total: LANGUAGE_METADATA.length,
          default: 'en',
          languages: LANGUAGE_METADATA,
        },
        'Supported languages fetched successfully',
        200
      );
    } catch (err) {
      next(err);
    }
  }

  getTranslations(req, res, next) {
    try {
      const targetLang = req.query.lang || req.query.language || req.lang || 'en';
      const normalized = normalizeLanguage(targetLang);
      const dict = getLocale(normalized);

      return success(
        res,
        {
          language: normalized,
          meta: {
            name: dict.name,
            nativeName: dict.nativeName,
            appName: dict.appName,
            direction: dict.direction,
          },
          grahas: dict.grahas,
          rashis: dict.rashis,
          nakshatras: dict.nakshatras,
          bhavas: dict.bhavas,
          ashtakoota: dict.ashtakoota,
          doshas: dict.doshas,
          dignities: dict.dignities,
          numerology: dict.numerology,
          archetypes: dict.archetypes,
          gemstones: dict.gemstones,
          messages: dict.messages,
        },
        'Translations fetched successfully',
        200
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new I18nController();

// Routes for i18n
const express = require('express');
const i18nController = require('../controllers/i18n.controller');

const router = express.Router();

router.get('/languages', (req, res, next) => i18nController.getLanguages(req, res, next));
router.get('/translations', (req, res, next) => i18nController.getTranslations(req, res, next));

module.exports = router;

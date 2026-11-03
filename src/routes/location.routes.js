// Assumption: /locations routes provide public autocomplete for onboarding and modal pickers.
const express = require('express');
const locationController = require('../controllers/location.controller');

const router = express.Router();

/**
 * @route   GET /api/v1/locations/autocomplete
 * @desc    Search location predictions with coordinates and timezone
 * @access  Public
 */
router.get('/autocomplete', (req, res) => locationController.autocomplete(req, res));

module.exports = router;


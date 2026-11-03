// Assumption: /profiles routes handle family profiles and switching under authentication.
const express = require('express');
const profileController = require('../controllers/profile.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createProfileSchema, updateProfileSchema } = require('../validations/profile.validation');

const router = express.Router();

// All profile endpoints require Bearer JWT authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/profiles
 * @desc    Get all family profiles for current user
 * @access  Private
 */
router.get('/', profileController.getProfiles);

/**
 * @route   POST /api/v1/profiles/:id/activate
 * @desc    Switch active profile
 * @access  Private
 */
router.post('/:id/activate', profileController.activateProfile);

/**
 * @route   POST /api/v1/profiles
 * @desc    Add new family profile
 * @access  Private
 */
router.post('/', validate(createProfileSchema), profileController.addProfile);

/**
 * @route   PUT /api/v1/profiles/:id
 * @desc    Update family profile details
 * @access  Private
 */
router.put('/:id', validate(updateProfileSchema), profileController.updateProfile);

module.exports = router;


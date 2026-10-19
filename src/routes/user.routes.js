const express = require('express');
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateProfileSchema } = require('../validations/user.validation');

const router = express.Router();

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get currently logged-in user's profile and birth details
 * @access  Private (Bearer JWT)
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user full name, gender, dob, tob (3-option model), pob
 * @access  Private (Bearer JWT)
 */
router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);

module.exports = router;


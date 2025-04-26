// routes/travelPreferenceRoutes.js
const express = require('express');
const router = express.Router();
const travelPreferenceController = require('../controllers/travelpreferencesController');
const authenticate = require('../middlewares/authMiddleware'); // Assuming you have auth middleware
const protect = require('../middlewares/authMiddleware');
router.use(protect);
// Create new travel preference
router.post('/', travelPreferenceController.createTravelPreference);

// Get all user travel preferences
router.get('/', travelPreferenceController.getUserTravelPreferences);

// Get specific travel preference
router.get('/:id', travelPreferenceController.getTravelPreferenceById);

// Delete travel preference
router.delete('/:id', travelPreferenceController.deleteTravelPreference);

module.exports = router;

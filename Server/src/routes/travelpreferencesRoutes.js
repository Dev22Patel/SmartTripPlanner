// routes/travelPreferenceRoutes.js
const express = require('express');
const router = express.Router();
const travelPreferenceController = require('../controllers/travelpreferencesController');
const authenticate = require('../middlewares/authMiddleware'); // Assuming you have auth middleware
const protect = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Create new travel preference
router.post('/',protect, travelPreferenceController.createTravelPreference);

// Get all user travel preferences
router.get('/',protect, travelPreferenceController.getUserTravelPreferences);

// Get specific travel preference
router.get('/:id', travelPreferenceController.getTravelPreferenceById);

// Delete travel preference
router.delete('/:id', travelPreferenceController.deleteTravelPreference);

module.exports = router;

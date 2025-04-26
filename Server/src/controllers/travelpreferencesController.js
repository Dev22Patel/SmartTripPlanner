const TravelPreference = require('../models/userPreferencs');
const User = require('../models/user');
// Create new travel preference
exports.createTravelPreference = async (req, res) => {
  try {

    console.log("hiii inside controller post");
    const userId = req.user.id; // Get user ID from the request object
    const { preferences, predictionResult } = req.body;

    // Create new travel preference
    const newTravelPreference = new TravelPreference({
      userId,
      preferences,
      predictionResult
    });

    await User.findByIdAndUpdate(userId, { isFirstLogin: false });
    await newTravelPreference.save();

    return res.status(201).json({
      success: true,
      message: 'Travel preference created successfully',
      data: newTravelPreference
    });
  } catch (error) {
    console.error('Error creating travel preference:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's travel preferences
exports.getUserTravelPreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    const travelPreferences = await TravelPreference.find({ userId })
      .sort({ createdAt: -1 }); // Most recent first

    return res.status(200).json({
      success: true,
      count: travelPreferences.length,
      data: travelPreferences
    });
  } catch (error) {
    console.error('Error fetching travel preferences:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get specific preference by ID
exports.getTravelPreferenceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const travelPreference = await TravelPreference.findOne({
      _id: id,
      userId
    });

    if (!travelPreference) {
      return res.status(404).json({
        success: false,
        message: 'Travel preference not found or unauthorized'
      });
    }

    return res.status(200).json({
      success: true,
      data: travelPreference
    });
  } catch (error) {
    console.error('Error fetching travel preference:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete travel preference
exports.deleteTravelPreference = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await TravelPreference.findOneAndDelete({
      _id: id,
      userId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Travel preference not found or unauthorized'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Travel preference deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting travel preference:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

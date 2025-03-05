// models/TravelPreference.js
const mongoose = require('mongoose');

const travelPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preferences: {
    locationType: {
      type: String,
      enum: ['india', 'worldwide'],
      required: true
    },
    destinationType: {
      type: [String],
      default: []
    },
    budget: {
      type: String,
      default: ''
    },
    duration: {
      type: String,
      default: ''
    },
    activities: {
      type: [String],
      default: []
    }
  },
  predictionResult: {
    predicted_destination: {
      type: String,
      default: null
    },
    confidence_score: {
      type: Number,
      default: null
    },
    alternative_destinations: [{
      destination: String,
      confidence: Number
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
travelPreferenceSchema.index({ userId: 1 });

module.exports = mongoose.model('TravelPreference', travelPreferenceSchema);

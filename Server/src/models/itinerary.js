// models/Itinerary.js
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  time: String,
  description: String,
  location: String,
  cost: String,
  category: {
    type: String,
    enum: ['food', 'attraction', 'transport', 'accommodation', 'other','entertainment','shopping'],
    default: 'other'
  },
  imageUrl: String
});

const DaySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  description: String,
  activities: [ActivitySchema]
});

const ItinerarySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  destination: {
    type: String,
    required: true
  },
  days: [DaySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);

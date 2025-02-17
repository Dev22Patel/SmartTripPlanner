const mongoose = require("mongoose");

const UserPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true }, // Reference to User model
  preferences: {
    destinationType: { type: String, required: true }, // Example: "Beaches & Adventure"
    budget: { type: String, required: true, enum: ["Low", "Medium", "High"] }, // Budget category
    duration: { type: String, required: true }, // Example: "6-8 days"
    activities: { type: [String], required: true }, // Example: ["Scuba Diving", "Snorkeling"]
  }
}, { timestamps: true }); // Adds createdAt & updatedAt fields

// Export the model
module.exports = mongoose.model("UserPreference", UserPreferenceSchema);

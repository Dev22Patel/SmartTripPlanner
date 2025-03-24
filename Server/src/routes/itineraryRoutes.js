const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { updateItinerary } = require("../controllers/itineraryController");

router.put("/:id", protect, updateItinerary);

module.exports = router;
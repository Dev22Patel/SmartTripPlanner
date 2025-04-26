const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { updateItinerary,deleteItinerary } = require("../controllers/itineraryController");

router.put("/:id", protect, updateItinerary);
router.delete("/:id", protect, deleteItinerary);
module.exports = router;

const express = require("express");
const router = express.Router();
const { getRecommendations  } = require("../controllers/desti-recommendationController");

router.get("/", getRecommendations);

module.exports = router;

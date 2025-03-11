const express = require("express");
const router = express.Router();
const User = require("../models/user");
const protect = require('../middlewares/authMiddleware'); 

router.get("/", protect, async (req, res) => {
    try {
        console.log("Decoded User:", req.user); // Debugging
        
        const user = await User.findOne({ email: req.user.email }).select("-password"); // Find by email
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;

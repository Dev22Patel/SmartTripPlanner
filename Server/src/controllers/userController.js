const User = require("../models/user");

// Fetch user details
const getUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete user account
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await User.deleteOne({ email: req.user.email });
        res.json({ message: "User account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user's profile picture URL
        user.image = req.file.path; // Cloudinary returns the file URL in `path`
        await user.save();
        console.log(user);
        res.json({ message: "Profile picture updated successfully", picture: user.picture });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getUser,
    deleteUser,
    uploadProfilePicture,
};
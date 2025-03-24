const User = require("../models/user");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
        if (user.image) {
            const oldImageUrl = user.image;
            const parts = oldImageUrl.split("/"); // Split URL by '/'
            const filename = parts.pop(); // Get 'qxlk7xxugqkspontghb2.png'
            const publicId = `profile_pictures/${filename.split(".")[0]}`; // Remove '.png'

            // Delete old image from Cloudinary
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted old image: ${publicId}`);
        }

        // Update user's profile picture URL
        user.image = req.file.path; // Cloudinary returns the file URL in `path`
        await user.save();
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
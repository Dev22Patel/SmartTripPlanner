const User = require("../models/user");
const Itinerary = require("../models/itinerary");

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

        // Fetch itineraries linked to the user
        const itineraries = await Itinerary.find({ userId: user._id });

        res.json({
            user,
            itineraries
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update user profile
const updateUser = async (req, res) => {
    try {
        const { firstname, lastname, email } = req.body;

        // Find user by email from auth middleware
        const user = await User.findOne({ email: req.user.email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if new email already exists for another user
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        // Update fields if provided
        if (firstname) user.firstname = firstname;
        if (lastname) user.lastname = lastname;
        if (email) user.email = email;

        await user.save();

        // Return updated user without password
        const updatedUser = await User.findById(user._id).select("-password");

        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Profile update error:", error);
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

        // Delete user's itineraries
        await Itinerary.deleteMany({ userId: user._id });

        // Delete user
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

        // Check if we have a file upload
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Delete old image from Cloudinary if it exists
        if (user.image) {
            try {
                // Extract public_id from the URL
                const oldImageUrl = user.image;
                const parts = oldImageUrl.split("/");
                const filenameWithExtension = parts[parts.length - 1];
                const filename = filenameWithExtension.split(".")[0];
                const publicId = `profile_pictures/${filename}`;

                // Delete old image from Cloudinary
                await cloudinary.uploader.destroy(publicId);
                console.log(`Deleted old image: ${publicId}`);
            } catch (error) {
                console.error("Error deleting old image:", error);
                // Continue even if deletion fails
            }
        }

        // Update user's profile picture URL
        user.image = req.file.path; // Cloudinary URL from multer-storage-cloudinary
        await user.save();

        res.json({
            message: "Profile picture updated successfully",
            picture: user.image
        });
    } catch (error) {
        console.error("Profile picture upload error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getUser,
    updateUser,
    deleteUser,
    uploadProfilePicture,
};

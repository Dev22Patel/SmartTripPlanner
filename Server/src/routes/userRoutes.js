const express = require("express");
const router = express.Router();
const {
    getUser,
    updateUser,
    deleteUser,
    uploadProfilePicture
} = require("../controllers/userController");
const protect = require("../middlewares/authMiddleware");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const dotenv = require("dotenv");
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "profile_pictures", // Folder name in Cloudinary
        allowed_formats: ["jpg", "jpeg", "png"], // Allowed file formats
        transformation: [
            { width: 500, height: 500, crop: "limit" }, // Resize image to max 500x500
            { quality: "auto" } // Auto-optimize quality
        ]
    },
});

// Configure multer with size limits
const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB file size limit
    }
});

// Routes
router.get("/", protect, getUser); // Fetch user details
router.put("/", protect, updateUser); // Update user profile
router.delete("/", protect, deleteUser); // Delete user account
router.post("/upload", protect, upload.single("profilePicture"), uploadProfilePicture); // Upload profile picture

module.exports = router;

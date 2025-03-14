const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: `${user.firstname} ${user.lastname}`,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// Signup Controller
exports.signup = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstname, lastname, email, password: hashedPassword });
    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        email: newUser.email,
        name: `${newUser.firstname} ${newUser.lastname}`
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login Controller
// Login Controller
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      // Find the user and select all necessary fields explicitly
      const user = await User.findOne({ email }).select('+firstname +lastname +email +password');
      if (!user) return res.status(404).json({ message: "User not found" });

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return res.status(401).json({ message: "Invalid credentials" });

      // Make sure all needed user data is available for token generation
      console.log("Login user data:", {
        _id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname
      });

      const token = generateToken(user);
      console.log("Generated token during login");

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: `${user.firstname} ${user.lastname}`
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

const jwt = require("jsonwebtoken");
require("dotenv").config();

const protect = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("inside protect");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  console.log("inside protect 2");
  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT token
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    console.log("Verified user:", verified);
    return next();
  } catch (jwtError) {
    console.log("JWT verification failed:", jwtError.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = protect;

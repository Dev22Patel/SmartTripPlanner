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
    // Make sure the JWT_SECRET exactly matches what was used to sign the token
    console.log("Token received:", token);
    console.log("JWT_SECRET being used:", process.env.JWT_SECRET || "DevKing");
    const JWT_SECRET = "DevKing" // fallback to the secret if env var not set
    // hamna production ma nathi so using hardcoded secret
    // but in production change kari dejo to "process.env.JWT_SECRET"

    console.log("Using JWT_SECRET for verification");

    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    console.log("Verified user:", verified);
    return next();
  } catch (jwtError) {
    console.log("JWT verification failed:", jwtError.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = protect;

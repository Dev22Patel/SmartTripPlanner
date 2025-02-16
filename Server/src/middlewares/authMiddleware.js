const jwt = require("jsonwebtoken");
require("dotenv").config();

const protect = (req, res, next) => {

  // extract JWT token from the request headers
  const token = req.header("Authorization").split(' ')[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    //make a new key "user" in req object and assign decoded payload
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = protect;

const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = {
  generateToken,
  verifyToken
};

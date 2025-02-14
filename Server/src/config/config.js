const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  environment: process.env.NODE_ENV || 'development',
  jwtExpiresIn: '1d'
};

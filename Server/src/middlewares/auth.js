const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { ApiError } = require('../utils/errors');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'Not authorized to access this route');
    }

    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new ApiError(401, 'User not found');
    }

    next();
  } catch (error) {
    next(new ApiError(401, 'Not authorized to access this route'));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to perform this action');
    }
    next();
  };
};

module.exports = { protect, authorize };

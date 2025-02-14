const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');
const limiter = require('./middleware/rateLimiter');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;

const app = require('./app');
const config = require('./config/config');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

// Connect to Database
connectDB();

const server = app.listen(config.port, () => {
  logger.info(`Server running in ${config.environment} mode on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

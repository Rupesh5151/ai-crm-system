/**
 * Server Entry Point
 * Starts the Express application with database connection
 */
import app from './app';
import { connectDatabase } from './config/database';
import { PORT, NODE_ENV } from './config/env';
import logger from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`=================================`);
      logger.info(`Server running in ${NODE_ENV} mode`);
      logger.info(`Port: ${PORT}`);
      logger.info(`API URL: http://localhost:${PORT}/api/v1`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);
      logger.info(`API Docs: http://localhost:${PORT}/api-docs`);
      logger.info(`=================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error('UNHANDLED REJECTION! Shutting down...');
      logger.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      logger.error('UNCAUGHT EXCEPTION! Shutting down...');
      logger.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown on SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


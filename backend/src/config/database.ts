/**
 * MongoDB Connection Manager
 * Handles connection with retry logic and event listeners
 */
import mongoose from 'mongoose';
import { MONGODB_URI, NODE_ENV } from './env';
import logger from '../utils/logger';

const MAX_RETRIES = 5;
let retryCount = 0;

export const connectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState >= 1) {
      logger.info('Database already connected');
      return;
    }

    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    retryCount = 0;
  } catch (error) {
    retryCount++;
    logger.error(`Database connection attempt ${retryCount} failed:`, error);

    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      logger.info(`Retrying in ${delay}ms...`);
      setTimeout(connectDatabase, delay);
    } else {
      logger.error('Max database retries reached. Exiting...');
      process.exit(1);
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT received. Closing database connection...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing database connection...');
  await disconnectDatabase();
  process.exit(0);
});

// Mongoose debug mode in development
if (NODE_ENV === 'development') {
  mongoose.set('debug', (collectionName: string, method: string, query: unknown) => {
    logger.debug(`Mongoose: ${collectionName}.${method}`, { query });
  });
}


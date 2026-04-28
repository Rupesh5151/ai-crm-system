/**
 * Global Error Handler Middleware
 * Catches all errors and returns standardized responses
 */
import { Request, Response, NextFunction } from 'express';
import { errorResponse, ApiError } from '../utils/response';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values((err as any).errors)
      .map((e: any) => e.message)
      .join(', ');
  }

  // Handle Mongoose duplicate key errors
  if ((err as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyValue)[0];
    message = `${field} already exists`;
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${(err as any).path}: ${(err as any).value}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error (don't log 404s or validation errors in production)
  if (statusCode >= 500) {
    logger.error('Server Error:', err);
  } else {
    logger.warn(`Client Error ${statusCode}:`, err.message);
  }

  return errorResponse(res, message, statusCode);
};

/**
 * 404 Not Found handler
 */
export const notFound = (req: Request, res: Response) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};


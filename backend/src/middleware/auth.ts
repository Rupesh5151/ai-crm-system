/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { JwtPayload, AuthenticatedRequest } from '../types';
import { errorResponse } from '../utils/response';
import logger from '../utils/logger';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'Access denied. No token provided.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      errorResponse(res, 'Access denied. Invalid token format.', 401);
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Attach user to request
    (req as AuthenticatedRequest).user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      errorResponse(res, 'Token expired. Please login again.', 401);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      errorResponse(res, 'Invalid token. Please login again.', 401);
      return;
    }
    logger.error('Auth middleware error:', error);
    errorResponse(res, 'Authentication failed.', 401);
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      errorResponse(res, 'Not authenticated.', 401);
      return;
    }

    if (!roles.includes(user.role)) {
      errorResponse(res, 'Not authorized to access this resource.', 403);
      return;
    }

    next();
  };
};

// Optional auth - attaches user if token exists, doesn't fail if not
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      (req as AuthenticatedRequest).user = decoded;
    }
    
    next();
  } catch {
    // Silently continue without user
    next();
  }
};

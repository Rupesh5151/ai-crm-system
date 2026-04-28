/**
 * Request Validation Middleware
 * Uses Zod schemas to validate request body, query, and params
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/response';
import logger from '../utils/logger';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        errorResponse(res, 'Validation failed', 400, messages);
        return;
      }
      logger.error('Validation error:', error);
      errorResponse(res, 'Validation failed', 400);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        errorResponse(res, 'Query validation failed', 400, messages);
        return;
      }
      errorResponse(res, 'Query validation failed', 400);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        errorResponse(res, 'Params validation failed', 400, messages);
        return;
      }
      errorResponse(res, 'Params validation failed', 400);
    }
  };
};


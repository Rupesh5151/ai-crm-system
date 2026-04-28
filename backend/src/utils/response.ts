/**
 * Standardized API Response Helpers
 */
import { Response } from 'express';

interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export const successResponse = (
  res: Response,
  data: unknown,
  metaOrMessage?: ResponseMeta | string,
  messageOrStatus?: string | number,
  statusCode: number = 200
) => {
  // Handle overload: (res, data, meta, message, statusCode)
  let meta: ResponseMeta | undefined;
  let message: string | undefined;

  if (metaOrMessage && typeof metaOrMessage === 'object') {
    meta = metaOrMessage;
    if (typeof messageOrStatus === 'string') {
      message = messageOrStatus;
    } else if (typeof messageOrStatus === 'number') {
      statusCode = messageOrStatus;
    }
  } else if (typeof metaOrMessage === 'string') {
    message = metaOrMessage;
    if (typeof messageOrStatus === 'number') {
      statusCode = messageOrStatus;
    }
  }

  const response: any = {
    success: true,
    data,
    message,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const paginatedResponse = (
  res: Response,
  data: unknown[],
  meta: ResponseMeta,
  message?: string
) => {
  return res.status(200).json({
    success: true,
    data,
    meta,
    message,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : error,
  });
};

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}


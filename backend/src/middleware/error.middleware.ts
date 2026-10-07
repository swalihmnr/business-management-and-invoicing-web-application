import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Global Error Handling Middleware
 *
 * Catch-all for any error passed to next(err).
 * Returns consistent error payload:
 * {
 *   "success": false,
 *   "message": "...",
 *   "errors": [...]
 * }
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  } else {
    // Unexpected error - log details internally
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled Exception');
    if (env.NODE_ENV === 'development') {
      message = err.message || message;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 ? { errors } : {}),
    ...(env.NODE_ENV === 'development' && !(err instanceof ApiError)
      ? { stack: err.stack }
      : {}),
  });
};

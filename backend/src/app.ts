import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { ApiError } from './utils/ApiError';
import { ApiResponse } from './utils/ApiResponse';

export const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in dev
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json(
    ApiResponse.success('System is healthy and operational', {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    })
  );
});

// Handle 404 for unknown endpoints
app.use((req: Request, _res: Response, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl}`));
});

// Centralized error handling
app.use(errorHandler);

export default app;

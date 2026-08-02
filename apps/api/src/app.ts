import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { loggerMiddleware } from './middlewares/logger.middleware';
import { globalRateLimiter } from './middlewares/rate-limit.middleware';
import { env } from './config/env.config';
import { globalErrorHandler } from './middlewares/error.middleware';
import { NotFoundError } from './errors/AppErrors';
import { swaggerSpec } from './swagger/swagger.config';
import v1Routes from './api/v1';

const app = express();
app.set('trust proxy', 1); // Required for express-rate-limit behind Render/Cloudflare

// Security Middlewares
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

const allowedOrigins = env.CORS_ORIGINS.split(',').map((o: string) => o.trim());
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin || 
        allowedOrigins.includes(origin) || 
        allowedOrigins.includes('*') ||
        origin.endsWith('.netlify.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        callback(null, true);
      } else {
        console.error(`[CORS BLOCK] Blocked request from unauthorized origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Utility Middlewares
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging & Rate Limiting
app.use(loggerMiddleware);
app.use(globalRateLimiter);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Anex Salon API is running. See /api-docs for documentation.' });
});
app.use('/api/v1', v1Routes);

// 404 Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;

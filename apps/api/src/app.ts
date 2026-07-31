import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { loggerMiddleware } from './middlewares/logger.middleware';
import { globalRateLimiter } from './middlewares/rate-limit.middleware';
import { globalErrorHandler } from './middlewares/error.middleware';
import { NotFoundError } from './errors/AppErrors';
import { swaggerSpec } from './swagger/swagger.config';
import v1Routes from './api/v1';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
    ],
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
app.use('/api/v1', v1Routes);

// 404 Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
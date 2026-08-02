import { Request, Response, NextFunction } from 'express';
import { BaseAppError } from '../errors/BaseAppError';
import { errorResponse } from '@anex/shared';
import pino from 'pino';

const logger = pino();

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const traceId = (req as any)?.id || (req.headers && req.headers['x-request-id']);

  if (err instanceof BaseAppError) {
    if (!err.isOperational) {
      logger.error(err);
    }
    res.status(err.statusCode).json(errorResponse(err.message, err.errors, traceId));
    return;
  }

  // Handle Prisma Database Errors gracefully
  if (err?.name?.includes('Prisma') || err?.code?.startsWith('P')) {
    logger.error(err, 'Database Exception');
    const isDev = process.env.NODE_ENV !== 'production';
    const message = isDev && err?.message ? `Database Error: ${err.message}` : 'Database Connection Error';
    res.status(500).json(errorResponse(message, undefined, traceId));
    return;
  }

  // Unhandled Errors
  logger.error(err, 'Unhandled Exception');
  const isDev = process.env.NODE_ENV !== 'production';
  const message = isDev && err?.message ? err.message : 'Internal Server Error';
  res.status(500).json(errorResponse(message, undefined, traceId));
};

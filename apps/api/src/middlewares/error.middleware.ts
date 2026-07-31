import { Request, Response, NextFunction } from 'express';
import { BaseAppError } from '../errors/BaseAppError';
import { errorResponse } from '@anex/shared';
import pino from 'pino';

const logger = pino();

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof BaseAppError) {
    if (!err.isOperational) {
      logger.error(err);
    }
    const traceId = (req as any).id;
    res.status(err.statusCode).json(errorResponse(err.message, err.errors, traceId));
    return;
  }

  // Unhandled Errors
  logger.error(err, 'Unhandled Exception');
  const traceId = (req as any).id;
  res.status(500).json(errorResponse('Internal Server Error', undefined, traceId));
};

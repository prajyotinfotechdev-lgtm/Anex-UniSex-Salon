import { Request, Response } from 'express';
import { successResponse } from '@anex/shared';
import { prisma } from '../../../database/prisma.client';
import { env } from '../../../config/env.config';

export const healthCheck = (req: Request, res: Response) => {
  res.json(successResponse('API is healthy'));
};

export const readyCheck = async (req: Request, res: Response) => {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.json(successResponse('API is ready'));
  } catch (error) {
    res.status(503).json({ success: false, message: 'Service Unavailable' });
  }
};

export const versionCheck = (req: Request, res: Response) => {
  res.json(successResponse('API Version', { version: '1.0.0' }));
};

export const statusCheck = async (req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'error';
  }

  res.json(
    successResponse('API Status', {
      version: '1.0.0',
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      database: dbStatus,
      serverTime: new Date().toISOString(),
    })
  );
};

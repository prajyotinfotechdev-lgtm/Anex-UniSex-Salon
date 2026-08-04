import { Request, Response, NextFunction } from 'express';
import { verifyCustomerAccessToken } from './jwt.util';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const requireCustomerDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Token not found' });
      return;
    }

    try {
      // 1. Try to verify as a standard JWT first
      const payload = verifyCustomerAccessToken(token);
      (req as any).customer = payload;
      next();
    } catch (jwtError) {
      // 2. Fallback: treat as raw device token (used directly by MVP PWA)
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const device = await prisma.customerDevice.findFirst({
        where: { tokenHash, isRevoked: false },
        include: { customer: true }
      });

      if (device && device.customer) {
        (req as any).customer = {
          customerId: device.customer.id,
          organizationId: device.customer.organizationId,
          deviceId: device.deviceId,
          type: 'customer'
        };
        next();
      } else {
        res.status(401).json({ message: 'Invalid or expired access token' });
      }
    }
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

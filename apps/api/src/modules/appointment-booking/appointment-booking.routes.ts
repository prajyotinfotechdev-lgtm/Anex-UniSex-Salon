import { Router, Request, Response, NextFunction } from 'express';
import { AppointmentBookingController } from './appointment-booking.controller';
import { verifyAccessToken, verifyCustomerAccessToken } from '../../auth/jwt.util';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export const appointmentBookingRoutes = Router();
const controller = new AppointmentBookingController();
const prisma = new PrismaClient();

const unifiedAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    const token = authHeader.split(' ')[1];
    
    try {
      (req as any).user = verifyAccessToken(token);
      next();
      return;
    } catch (e) {}
    
    try {
      (req as any).customer = verifyCustomerAccessToken(token);
      next();
      return;
    } catch (e) {}

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
      return;
    }
    
    res.status(401).json({ message: 'Invalid token' });
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

appointmentBookingRoutes.use(unifiedAuth);

appointmentBookingRoutes.post('/start', async (req, res, next) => {
  try { await controller.startBooking(req, res); } catch (e) { next(e); }
});
appointmentBookingRoutes.post('/requirements/:customerId', async (req, res, next) => {
  try { await controller.checkRequirements(req, res); } catch (e) { next(e); }
});
appointmentBookingRoutes.post('/confirm', async (req, res, next) => {
  try { await controller.confirmBooking(req, res); } catch (e) { next(e); }
});

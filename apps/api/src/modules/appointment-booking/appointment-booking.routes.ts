import { Router } from 'express';
import { AppointmentBookingController } from './appointment-booking.controller';
import { requireAuth } from '../../auth/auth.middleware';

export const appointmentBookingRoutes = Router();
const controller = new AppointmentBookingController();

// appointmentBookingRoutes.use(requireAuth); // Disabled temporarily to allow Customer App testing without Auth

appointmentBookingRoutes.post('/start', async (req, res, next) => {
  try { await controller.startBooking(req, res); } catch (e) { next(e); }
});
appointmentBookingRoutes.post('/requirements/:customerId', async (req, res, next) => {
  try { await controller.checkRequirements(req, res); } catch (e) { next(e); }
});
appointmentBookingRoutes.post('/confirm', async (req, res, next) => {
  try { await controller.confirmBooking(req, res); } catch (e) { next(e); }
});

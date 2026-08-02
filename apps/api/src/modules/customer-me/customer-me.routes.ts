import { Router } from 'express';
import { requireCustomerDevice } from '../../auth/customer-auth.middleware';
import {
  getDashboardHandler,
  getProfileHandler,
  getAppointmentsHandler,
  getAppointmentByIdHandler,
  cancelAppointmentHandler,
  getInvoicesHandler,
  getInvoiceByIdHandler,
  getWalletBalanceHandler,
  getWalletTransactionsHandler,
  getLoyaltyBalanceHandler,
  getLoyaltyTransactionsHandler,
  getMembershipsHandler,
  getPackagesHandler,
  getDevicesHandler,
  revokeDeviceHandler,
  getAvailabilityHandler,
  getBookingPredictionsHandler,
  createCustomerAppointmentHandler
} from './customer-me.controller';

const router = Router();

// All routes require a valid customer device token
router.use(requireCustomerDevice);

// Dashboard (Unified Experience API)
router.get('/dashboard', getDashboardHandler);

// Profile
router.get('/', getProfileHandler);

// Booking Engine
router.post('/availability', getAvailabilityHandler);
router.get('/booking-predictions', getBookingPredictionsHandler);

// Appointments
router.get('/appointments', getAppointmentsHandler);
router.post('/appointments', createCustomerAppointmentHandler);
router.get('/appointments/:id', getAppointmentByIdHandler);
router.post('/appointments/:id/cancel', cancelAppointmentHandler);

// Invoices
router.get('/invoices', getInvoicesHandler);
router.get('/invoices/:id', getInvoiceByIdHandler);

// Wallet
router.get('/wallet/balance', getWalletBalanceHandler);
router.get('/wallet/transactions', getWalletTransactionsHandler);

// Loyalty
router.get('/loyalty/balance', getLoyaltyBalanceHandler);
router.get('/loyalty/transactions', getLoyaltyTransactionsHandler);

// Memberships & Packages
router.get('/memberships', getMembershipsHandler);
router.get('/packages', getPackagesHandler);

// Devices
router.get('/devices', getDevicesHandler);
router.post('/devices/:id/revoke', revokeDeviceHandler);

// Inspiration / Moodboard
import { InspirationMeController } from '../inspiration/inspiration.controller';
router.get('/inspiration/bookmarks', InspirationMeController.getBookmarks);
router.post('/inspiration/:id/bookmark', InspirationMeController.toggleBookmark);

export const customerMeRoutes = router;

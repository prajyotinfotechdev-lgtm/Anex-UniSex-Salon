import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import {
  registerDeviceSchema,
  confirmRegistrationSchema,
  sessionResolutionSchema,
  refreshSessionSchema,
  pairingRequestSchema,
  pairingResultSchema
} from './customer-auth.validator';
import {
  registerDeviceHandler,
  confirmRegistrationHandler,
  sessionResolutionHandler,
  refreshSessionHandler,
  signOutHandler,
  requestPairingHandler,
  pollPairingResultHandler
} from './customer-auth.controller';
import { requireCustomerDevice } from '../../auth/customer-auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for registration
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  message: { message: 'Too many registration attempts, please try again later.' },
  skip: () => process.env.NODE_ENV !== 'production',
});

// Device Registration
router.post('/register', registrationLimiter, validate(registerDeviceSchema), registerDeviceHandler);
router.post('/confirm-registration', registrationLimiter, validate(confirmRegistrationSchema), confirmRegistrationHandler);

// Session Lifecycle
router.post('/session', validate(sessionResolutionSchema), sessionResolutionHandler);
router.post('/refresh', validate(refreshSessionSchema), refreshSessionHandler);
router.post('/sign-out', requireCustomerDevice, signOutHandler);

// Device Transfer (Pairing)
router.post('/pairing/request', validate(pairingRequestSchema), requestPairingHandler);
router.get('/pairing/:id/result', validate(pairingResultSchema), pollPairingResultHandler);

export const customerAuthRoutes = router;

import { Router } from 'express';
import {
  getBranchesHandler,
  getServicesHandler,
  getEmployeesHandler,
  getSlotsHandler,
  getInvoiceHandler
} from './customer-public.controller';
import { requireOrganizationId } from './customer-public.middleware';
import {
  InspirationPublicController,
} from '../inspiration/inspiration.controller';
import { validate } from '../../middlewares/validate.middleware';
import { listInspirationPostsSchema, trackEventSchema } from '../inspiration/inspiration.validator';

const router = Router();

// Middleware to extract x-organization-id
router.use(requireOrganizationId);

router.get('/branches', getBranchesHandler);
router.get('/services', getServicesHandler);
router.get('/employees', getEmployeesHandler);
router.get('/slots', getSlotsHandler);
router.get('/invoice/:id', getInvoiceHandler);

// ─── Inspiration Public Routes ────────────────────────────────────────────────
router.get('/inspiration', validate(listInspirationPostsSchema), InspirationPublicController.listPosts);
router.get('/inspiration/collections', InspirationPublicController.listCollections);
router.get('/inspiration/collections/:slug', InspirationPublicController.getCollection);
router.get('/inspiration/stylist/:employeeId', InspirationPublicController.getStylistPortfolio);
router.get('/inspiration/:slug', InspirationPublicController.getPost);
router.post('/inspiration/:id/event', validate(trackEventSchema), InspirationPublicController.trackEvent);

export const customerPublicRoutes = router;

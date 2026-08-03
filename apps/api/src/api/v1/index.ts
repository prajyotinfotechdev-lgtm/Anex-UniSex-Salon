import { Router } from 'express';
import healthRoutes from './health/health.routes';
import { authRoutes } from '../../modules/auth';
import { settingsRoutes } from '../../modules/settings/settings.routes';
import { taxRoutes } from '../../modules/tax';
import { branchRoutes } from '../../modules/branch';
import { organizationRoutes } from '../../modules/organization';
import { employeeRoutes } from '../../modules/employee';
import { customerRoutes } from '../../modules/customer';
import { serviceRoutes } from '../../modules/service';
import { appointmentRoutes } from '../../modules/appointment';
import { appointmentOperationsRoutes } from '../../modules/appointment-operations';
import { appointmentBookingRoutes } from '../../modules/appointment-booking/appointment-booking.routes';
import { schedulingRoutes } from '../../modules/scheduling';
import { billingRoutes } from '../../modules/billing';
import { reportsRoutes } from '../../modules/reports';
import { roleRoutes } from '../../modules/role';
import { serviceCategoryRoutes } from '../../modules/service-category';
import { customerAuthRoutes } from '../../modules/customer-auth/customer-auth.routes';
import { customerMeRoutes } from '../../modules/customer-me/customer-me.routes';
import { customerPublicRoutes } from '../../modules/customer-public/customer-public.routes';
import mediaRoutes from '../../modules/media/media.routes';
import inspirationRoutes from '../../modules/inspiration/inspiration.routes';

const router = Router();

router.use('/', healthRoutes); // Mounts /health, /ready, etc.
router.use('/auth', authRoutes);
router.use('/settings/taxes', taxRoutes);
router.use('/settings', settingsRoutes);
router.use('/branches', branchRoutes);
router.use('/organization', organizationRoutes);
router.use('/employees', employeeRoutes);
router.use('/customers', customerRoutes);
router.use('/services', serviceRoutes);
router.use('/booking', appointmentBookingRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/appointments', appointmentOperationsRoutes);
router.use('/scheduling', schedulingRoutes);
router.use('/billing', billingRoutes);
router.use('/reports', reportsRoutes);
router.use('/roles', roleRoutes);
router.use('/service-categories', serviceCategoryRoutes);
router.use('/media', mediaRoutes);
router.use('/inspiration', inspirationRoutes);

// PWA Customer Routes
router.use('/customer', customerAuthRoutes);
router.use('/me', customerMeRoutes);
router.use('/public', customerPublicRoutes);

export default router;

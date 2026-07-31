import { Router } from 'express';
import healthRoutes from './health/health.routes';
import { authRoutes } from '../../modules/auth';
import { organizationRoutes } from '../../modules/organization';
import { employeeRoutes } from '../../modules/employee';
import { customerRoutes } from '../../modules/customer';
import { serviceRoutes } from '../../modules/service';
import { appointmentRoutes } from '../../modules/appointment';
import { appointmentOperationsRoutes } from '../../modules/appointment-operations';
import { schedulingRoutes } from '../../modules/scheduling';
import { billingRoutes } from '../../modules/billing';

const router = Router();

router.use('/', healthRoutes); // Mounts /health, /ready, etc.
router.use('/auth', authRoutes);
router.use('/organization', organizationRoutes);
router.use('/employees', employeeRoutes);
router.use('/customers', customerRoutes);
router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/appointments', appointmentOperationsRoutes);
router.use('/scheduling', schedulingRoutes);
router.use('/billing', billingRoutes);

export default router;

import { Router } from 'express';
import healthRoutes from './health/health.routes';
import { authRoutes } from '../../modules/auth';
import { organizationRoutes } from '../../modules/organization';
import { employeeRoutes } from '../../modules/employee';
import { customerRoutes } from '../../modules/customer';
import { serviceRoutes } from '../../modules/service';

const router = Router();

router.use('/', healthRoutes); // Mounts /health, /ready, etc.
router.use('/auth', authRoutes);
router.use('/organization', organizationRoutes);
router.use('/employees', employeeRoutes);
router.use('/customers', customerRoutes);
router.use('/services', serviceRoutes);

export default router;

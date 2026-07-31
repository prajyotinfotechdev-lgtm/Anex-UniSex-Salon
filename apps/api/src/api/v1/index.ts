import { Router } from 'express';
import healthRoutes from './health/health.routes';
import { authRoutes } from '../../modules/auth';
import { organizationRoutes } from '../../modules/organization';

const router = Router();

router.use('/', healthRoutes); // Mounts /health, /ready, etc.
router.use('/auth', authRoutes);
router.use('/organization', organizationRoutes);

export default router;

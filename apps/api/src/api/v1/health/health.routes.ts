import { Router } from 'express';
import { healthCheck, readyCheck, versionCheck, statusCheck } from './health.controller';

const router = Router();

router.get('/health', healthCheck);
router.get('/ready', readyCheck);
router.get('/version', versionCheck);
router.get('/status', statusCheck);

export default router;

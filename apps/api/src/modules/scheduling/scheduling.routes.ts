import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../rbac/permission.middleware';
import {
  checkAvailabilitySchema,
  generateSlotsSchema,
} from './scheduling.validator';
import {
  checkAvailabilityHandler,
  generateSlotsHandler,
} from './scheduling.controller';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Scheduling
 *   description: Scheduling Engine operations
 */

/**
 * @swagger
 * /api/v1/scheduling/check-availability:
 *   post:
 *     summary: Check availability for a specific service block
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchId
 *               - employeeId
 *               - serviceId
 *               - startTime
 *             properties:
 *               branchId:
 *                 type: string
 *               employeeId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               customerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Availability checked
 */
router.post('/check-availability', requirePermission('Appointment.Read' as any), validate(checkAvailabilitySchema), checkAvailabilityHandler);

/**
 * @swagger
 * /api/v1/scheduling/generate-slots:
 *   post:
 *     summary: Generate available time slots for a given day
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchId
 *               - employeeId
 *               - serviceId
 *               - date
 *             properties:
 *               branchId:
 *                 type: string
 *               employeeId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *                 example: '2026-07-31'
 *               intervalMinutes:
 *                 type: number
 *     responses:
 *       200:
 *         description: Slots generated
 */
router.post('/generate-slots', requirePermission('Appointment.Read' as any), validate(generateSlotsSchema), generateSlotsHandler);

export default router;

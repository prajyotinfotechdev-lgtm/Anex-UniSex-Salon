import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../rbac/permission.middleware';
import { PERMISSIONS } from '@anex/shared';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  searchAppointmentsSchema,
} from './appointment.validator';
import {
  searchAppointmentsHandler,
  getAppointmentHandler,
  createAppointmentHandler,
  updateAppointmentHandler,
  deleteAppointmentHandler,
} from './appointment.controller';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Appointment
 *   description: Appointment Core operations
 */

/**
 * @swagger
 * /api/v1/appointments:
 *   get:
 *     summary: List and search appointments
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, ARRIVED, IN_PROGRESS, COMPLETED, NO_SHOW, CANCELLED]
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [WALK_IN, PHONE, ONLINE, APP, WHATSAPP, INSTAGRAM, MANUAL]
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/', requirePermission(PERMISSIONS.APPOINTMENT.READ), validate(searchAppointmentsSchema), searchAppointmentsHandler);

/**
 * @swagger
 * /api/v1/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 */
router.get('/:id', requirePermission(PERMISSIONS.APPOINTMENT.READ), getAppointmentHandler);

/**
 * @swagger
 * /api/v1/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointment]
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
 *               - date
 *               - items
 *             properties:
 *               branchId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [WALK_IN, PHONE, ONLINE, APP, WHATSAPP, INSTAGRAM, MANUAL]
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, ARRIVED, IN_PROGRESS, COMPLETED, NO_SHOW, CANCELLED]
 *               date:
 *                 type: string
 *                 format: date
 *                 example: '2026-07-31'
 *               notes:
 *                 type: string
 *               internalNotes:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceId:
 *                       type: string
 *                     employeeId:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Appointment created
 *       400:
 *         description: Validation error
 *       404:
 *         description: Branch, Customer, Employee, or Service not found
 *       409:
 *         description: Conflict
 */
router.post('/', requirePermission(PERMISSIONS.APPOINTMENT.CREATE), validate(createAppointmentSchema), createAppointmentHandler);

/**
 * @swagger
 * /api/v1/appointments/{id}:
 *   put:
 *     summary: Update an appointment
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branchId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [WALK_IN, PHONE, ONLINE, APP, WHATSAPP, INSTAGRAM, MANUAL]
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, ARRIVED, IN_PROGRESS, COMPLETED, NO_SHOW, CANCELLED]
 *               date:
 *                 type: string
 *                 format: date
 *                 example: '2026-07-31'
 *               notes:
 *                 type: string
 *               internalNotes:
 *                 type: string
 *               cancellationReason:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceId:
 *                       type: string
 *                     employeeId:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                     price:
 *                       type: number
 *     responses:
 *       200:
 *         description: Appointment updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Conflict (invalid state transition)
 */
router.put('/:id', requirePermission(PERMISSIONS.APPOINTMENT.UPDATE), validate(updateAppointmentSchema), updateAppointmentHandler);

/**
 * @swagger
 * /api/v1/appointments/{id}:
 *   delete:
 *     summary: Soft delete appointment
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment deleted
 *       403:
 *         description: Cannot delete completed appointment
 *       404:
 *         description: Appointment not found
 */
router.delete('/:id', requirePermission(PERMISSIONS.APPOINTMENT.DELETE), deleteAppointmentHandler);

export default router;

import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../rbac/permission.middleware';
import {
  cancelAppointmentSchema,
  updateNotesSchema,
  rescheduleAppointmentSchema,
  changeEmployeeSchema,
  changeServiceSchema,
} from './appointment-operations.validator';
import {
  confirmAppointmentHandler,
  checkInAppointmentHandler,
  startAppointmentHandler,
  completeAppointmentHandler,
  cancelAppointmentHandler,
  noShowAppointmentHandler,
  updateNotesHandler,
  rescheduleAppointmentHandler,
  changeEmployeeHandler,
  changeServiceHandler,
} from './appointment-operations.controller';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: AppointmentOperations
 *   description: Appointment operational state transitions and orchestration
 */

/**
 * @swagger
 * /api/v1/appointments/{id}/confirm:
 *   patch:
 *     summary: Confirm an appointment
 *     tags: [AppointmentOperations]
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
 *         description: Appointment confirmed
 *       409:
 *         description: Invalid state transition
 */
router.patch('/:id/confirm', requirePermission('Appointment.Update' as any), confirmAppointmentHandler);

/**
 * @swagger
 * /api/v1/appointments/{id}/check-in:
 *   patch:
 *     summary: Check in an appointment
 *     tags: [AppointmentOperations]
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
 *         description: Appointment checked in
 *       409:
 *         description: Invalid state transition
 */
router.patch('/:id/check-in', requirePermission('Appointment.Update' as any), checkInAppointmentHandler);

/**
 * @swagger
 * /api/v1/appointments/{id}/start:
 *   patch:
 *     summary: Start an appointment service
 *     tags: [AppointmentOperations]
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
 *         description: Appointment started
 *       409:
 *         description: Invalid state transition
 */
router.patch('/:id/start', requirePermission('Appointment.Update' as any), startAppointmentHandler);

/**
 * @swagger
 * /api/v1/appointments/{id}/complete:
 *   patch:
 *     summary: Complete an appointment
 *     tags: [AppointmentOperations]
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
 *         description: Appointment completed
 *       409:
 *         description: Invalid state transition
 */
router.patch('/:id/complete', requirePermission('Appointment.Update' as any), completeAppointmentHandler);

/**
 * @swagger
 * /api/v1/appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel an appointment
 *     tags: [AppointmentOperations]
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
 *             required:
 *               - cancellationReason
 *             properties:
 *               cancellationReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled
 *       409:
 *         description: Invalid state transition
 */
router.patch('/:id/cancel', requirePermission('Appointment.Update' as any), validate(cancelAppointmentSchema), cancelAppointmentHandler);

/**
 * @swagger
 * /api/v1/appointments/{id}/no-show:
 *   patch:
 *     summary: Mark an appointment as no-show
 *     tags: [AppointmentOperations]
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
 *         description: Appointment marked no-show
 *       409:
 *         description: Invalid state transition
 */
router.patch('/:id/no-show', requirePermission('Appointment.Update' as any), noShowAppointmentHandler);

/**
 * @swagger
 * /api/v1/appointments/{id}/notes:
 *   patch:
 *     summary: Update appointment notes
 *     tags: [AppointmentOperations]
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
 *               notes:
 *                 type: string
 *               internalNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notes updated
 */
router.patch('/:id/notes', requirePermission('Appointment.Update' as any), validate(updateNotesSchema), updateNotesHandler);

/**
 * @swagger
 * /api/v1/appointments/{id}/reschedule:
 *   patch:
 *     summary: Reschedule an appointment
 *     tags: [AppointmentOperations]
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
 *             required:
 *               - date
 *               - startTime
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Appointment rescheduled
 *       409:
 *         description: Conflict
 */
router.patch('/:id/reschedule', requirePermission('Appointment.Update' as any), validate(rescheduleAppointmentSchema), rescheduleAppointmentHandler);

/**
 * @swagger
 * /api/v1/appointments/{id}/change-employee:
 *   patch:
 *     summary: Change the employee for a specific appointment item
 *     tags: [AppointmentOperations]
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
 *             required:
 *               - appointmentItemId
 *               - newEmployeeId
 *             properties:
 *               appointmentItemId:
 *                 type: string
 *               newEmployeeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee changed
 *       409:
 *         description: Conflict
 */
router.patch('/:id/change-employee', requirePermission('Appointment.Update' as any), validate(changeEmployeeSchema), changeEmployeeHandler);

/**
 * @swagger
 * /api/v1/appointments/{id}/change-service:
 *   patch:
 *     summary: Change the service for a specific appointment item
 *     tags: [AppointmentOperations]
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
 *             required:
 *               - appointmentItemId
 *               - newServiceId
 *             properties:
 *               appointmentItemId:
 *                 type: string
 *               newServiceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service changed
 *       409:
 *         description: Conflict
 */
router.patch('/:id/change-service', requirePermission('Appointment.Update' as any), validate(changeServiceSchema), changeServiceHandler);

export default router;

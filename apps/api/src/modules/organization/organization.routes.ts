import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../rbac/permission.middleware';
import { PERMISSIONS } from '@anex/shared';
import {
  updateOrganizationSchema,
  createBranchSchema,
  updateBranchSchema,
  createHolidaySchema,
  updateHolidaySchema,
} from './organization.validator';
import {
  getOrganizationHandler,
  updateOrganizationHandler,
  listBranchesHandler,
  getBranchHandler,
  createBranchHandler,
  updateBranchHandler,
  deleteBranchHandler,
  activateBranchHandler,
  deactivateBranchHandler,
  listHolidaysHandler,
  createHolidayHandler,
  updateHolidayHandler,
  deleteHolidayHandler,
} from './organization.controller';

const router = Router();

// Apply authentication to all routes in this module
router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Organization
 *   description: Organization & Branch management
 */

/**
 * @swagger
 * /api/v1/organization:
 *   get:
 *     summary: Get Current Organization
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization details
 */
router.get('/', requirePermission(PERMISSIONS.ORGANIZATION.READ), getOrganizationHandler);

/**
 * @swagger
 * /api/v1/organization:
 *   put:
 *     summary: Update Current Organization
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               currencyCode:
 *                 type: string
 *               countryCode:
 *                 type: string
 *               locale:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Organization updated
 */
router.put('/', requirePermission(PERMISSIONS.ORGANIZATION.UPDATE), validate(updateOrganizationSchema), updateOrganizationHandler);

/**
 * @swagger
 * /api/v1/organization/branches:
 *   get:
 *     summary: List all branches
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of branches
 */
router.get('/branches', requirePermission(PERMISSIONS.BRANCH.READ), listBranchesHandler);

/**
 * @swagger
 * /api/v1/organization/branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               timeZone:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Branch created
 */
router.post('/branches', requirePermission(PERMISSIONS.BRANCH.CREATE), validate(createBranchSchema), createBranchHandler);

/**
 * @swagger
 * /api/v1/organization/branches/{id}:
 *   get:
 *     summary: Get branch by ID
 *     tags: [Organization]
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
 *         description: Branch details
 */
router.get('/branches/:id', requirePermission(PERMISSIONS.BRANCH.READ), getBranchHandler);

/**
 * @swagger
 * /api/v1/organization/branches/{id}:
 *   put:
 *     summary: Update branch by ID
 *     tags: [Organization]
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
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               timeZone:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Branch updated
 */
router.put('/branches/:id', requirePermission(PERMISSIONS.BRANCH.UPDATE), validate(updateBranchSchema), updateBranchHandler);

/**
 * @swagger
 * /api/v1/organization/branches/{id}:
 *   delete:
 *     summary: Soft delete branch
 *     tags: [Organization]
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
 *         description: Branch soft deleted
 */
router.delete('/branches/:id', requirePermission(PERMISSIONS.BRANCH.DELETE), deleteBranchHandler);

/**
 * @swagger
 * /api/v1/organization/branches/{id}/activate:
 *   patch:
 *     summary: Activate branch
 *     tags: [Organization]
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
 *         description: Branch activated
 */
router.patch('/branches/:id/activate', requirePermission(PERMISSIONS.BRANCH.MANAGE), activateBranchHandler);

/**
 * @swagger
 * /api/v1/organization/branches/{id}/deactivate:
 *   patch:
 *     summary: Deactivate branch
 *     tags: [Organization]
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
 *         description: Branch deactivated
 */
router.patch('/branches/:id/deactivate', requirePermission(PERMISSIONS.BRANCH.MANAGE), deactivateBranchHandler);

/**
 * @swagger
 * /api/v1/organization/branches/{id}/holidays:
 *   get:
 *     summary: List branch holidays
 *     tags: [Organization]
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
 *         description: List of holidays (Calendar Exceptions)
 */
router.get('/branches/:id/holidays', requirePermission(PERMISSIONS.BRANCH.READ), listHolidaysHandler);

/**
 * @swagger
 * /api/v1/organization/branches/{id}/holidays:
 *   post:
 *     summary: Create branch holiday
 *     tags: [Organization]
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
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               isClosed:
 *                 type: boolean
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Holiday created
 */
router.post('/branches/:id/holidays', requirePermission(PERMISSIONS.BRANCH.MANAGE), validate(createHolidaySchema), createHolidayHandler);

/**
 * @swagger
 * /api/v1/organization/branches/{id}/holidays/{holidayId}:
 *   put:
 *     summary: Update branch holiday
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: holidayId
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
 *               date:
 *                 type: string
 *                 format: date-time
 *               isClosed:
 *                 type: boolean
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Holiday updated
 */
router.put('/branches/:id/holidays/:holidayId', requirePermission(PERMISSIONS.BRANCH.MANAGE), validate(updateHolidaySchema), updateHolidayHandler);

/**
 * @swagger
 * /api/v1/organization/branches/{id}/holidays/{holidayId}:
 *   delete:
 *     summary: Delete branch holiday
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: holidayId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Holiday deleted
 */
router.delete('/branches/:id/holidays/:holidayId', requirePermission(PERMISSIONS.BRANCH.MANAGE), deleteHolidayHandler);

export default router;

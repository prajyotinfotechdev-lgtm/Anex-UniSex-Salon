import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../rbac/permission.middleware';
import {
  createServiceSchema,
  updateServiceSchema,
  searchServicesSchema,
} from './service.validator';
import {
  searchServicesHandler,
  getServiceHandler,
  createServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
  activateServiceHandler,
  deactivateServiceHandler,
} from './service.controller';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Service
 *   description: Service Catalog operations
 */

/**
 * @swagger
 * /api/v1/services:
 *   get:
 *     summary: List and search services
 *     tags: [Service]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: pricingType
 *         schema:
 *           type: string
 *           enum: [FIXED, STARTING_AT, VARIABLE, FREE]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: minDuration
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxDuration
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of services
 */
router.get('/', requirePermission('Service.Read' as any), validate(searchServicesSchema), searchServicesHandler);

/**
 * @swagger
 * /api/v1/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Service]
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
 *         description: Service details
 *       404:
 *         description: Service not found
 */
router.get('/:id', requirePermission('Service.Read' as any), getServiceHandler);

/**
 * @swagger
 * /api/v1/services:
 *   post:
 *     summary: Create a new service
 *     tags: [Service]
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
 *               - pricingType
 *               - basePrice
 *               - durationMinutes
 *               - serviceCategoryId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               pricingType:
 *                 type: string
 *                 enum: [FIXED, STARTING_AT, VARIABLE, FREE]
 *               basePrice:
 *                 type: number
 *               durationMinutes:
 *                 type: integer
 *               processingMinutes:
 *                 type: integer
 *               cleanupMinutes:
 *                 type: integer
 *               beforeBufferMinutes:
 *                 type: integer
 *               afterBufferMinutes:
 *                 type: integer
 *               color:
 *                 type: string
 *               requiresConsultation:
 *                 type: boolean
 *               requiresPatchTest:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *               serviceCategoryId:
 *                 type: string
 *               employees:
 *                 type: array
 *                 items:
 *                   type: string
 *               branches:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Service created
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category or Employee not found
 *       409:
 *         description: Conflict (Duplicate name)
 */
router.post('/', requirePermission('Service.Create' as any), validate(createServiceSchema), createServiceHandler);

/**
 * @swagger
 * /api/v1/services/{id}:
 *   put:
 *     summary: Update a service
 *     tags: [Service]
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
 *               description:
 *                 type: string
 *               pricingType:
 *                 type: string
 *                 enum: [FIXED, STARTING_AT, VARIABLE, FREE]
 *               basePrice:
 *                 type: number
 *               durationMinutes:
 *                 type: integer
 *               processingMinutes:
 *                 type: integer
 *               cleanupMinutes:
 *                 type: integer
 *               beforeBufferMinutes:
 *                 type: integer
 *               afterBufferMinutes:
 *                 type: integer
 *               color:
 *                 type: string
 *               requiresConsultation:
 *                 type: boolean
 *               requiresPatchTest:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *               serviceCategoryId:
 *                 type: string
 *               employees:
 *                 type: array
 *                 items:
 *                   type: string
 *               branches:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Service updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Service not found
 *       409:
 *         description: Conflict
 */
router.put('/:id', requirePermission('Service.Update' as any), validate(updateServiceSchema), updateServiceHandler);

/**
 * @swagger
 * /api/v1/services/{id}:
 *   delete:
 *     summary: Soft delete service
 *     tags: [Service]
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
 *         description: Service deleted
 *       404:
 *         description: Service not found
 *       409:
 *         description: Conflict (has active dependencies)
 */
router.delete('/:id', requirePermission('Service.Delete' as any), deleteServiceHandler);

/**
 * @swagger
 * /api/v1/services/{id}/activate:
 *   patch:
 *     summary: Activate service
 *     tags: [Service]
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
 *         description: Service activated
 *       404:
 *         description: Service not found
 */
router.patch('/:id/activate', requirePermission('Service.Manage' as any), activateServiceHandler);

/**
 * @swagger
 * /api/v1/services/{id}/deactivate:
 *   patch:
 *     summary: Deactivate service
 *     tags: [Service]
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
 *         description: Service deactivated
 *       404:
 *         description: Service not found
 *       409:
 *         description: Conflict (has active dependencies)
 */
router.patch('/:id/deactivate', requirePermission('Service.Manage' as any), deactivateServiceHandler);

export default router;

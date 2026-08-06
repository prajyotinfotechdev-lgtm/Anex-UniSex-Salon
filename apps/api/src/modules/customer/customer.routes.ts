import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../rbac/permission.middleware';
import { PERMISSIONS } from '@anex/shared';
import {
  createCustomerSchema,
  updateCustomerSchema,
  searchCustomersSchema,
} from './customer.validator';
import {
  searchCustomersHandler,
  getCustomerHandler,
  createCustomerHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  hardDeleteCustomerHandler,
  activateCustomerHandler,
  deactivateCustomerHandler,
  listCustomerDevicesHandler,
  revokeCustomerDeviceHandler,
  executeDeviceTransferHandler
} from './customer.controller';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Customer CRM operations
 */

/**
 * @swagger
 * /api/v1/customers:
 *   get:
 *     summary: List and search customers
 *     tags: [Customer]
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
 *         name: phone
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [MALE, FEMALE, OTHER]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: tagId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/', requirePermission(PERMISSIONS.CUSTOMER.READ), validate(searchCustomersSchema), searchCustomersHandler);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   get:
 *     summary: Get customer by ID with history
 *     tags: [Customer]
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
 *         description: Customer details
 *       404:
 *         description: Customer not found
 */
router.get('/:id', requirePermission(PERMISSIONS.CUSTOMER.READ), getCustomerHandler);

/**
 * @swagger
 * /api/v1/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - primaryPhone
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               primaryPhone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               dob:
 *                 type: string
 *                 format: date-time
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Customer created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Conflict (Email or Phone already in use)
 */
router.post('/', requirePermission(PERMISSIONS.CUSTOMER.CREATE), validate(createCustomerSchema), createCustomerHandler);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   put:
 *     summary: Update a customer
 *     tags: [Customer]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               primaryPhone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               dob:
 *                 type: string
 *                 format: date-time
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Customer updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Customer not found
 *       409:
 *         description: Conflict
 */
router.put('/:id', requirePermission(PERMISSIONS.CUSTOMER.UPDATE), validate(updateCustomerSchema), updateCustomerHandler);

/**
 * @swagger
 * /api/v1/customers/{id}/devices:
 *   get:
 *     summary: List customer devices
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/devices', requirePermission(PERMISSIONS.CUSTOMER.READ), listCustomerDevicesHandler);

/**
 * @swagger
 * /api/v1/customers/{id}/devices/{deviceId}/revoke:
 *   patch:
 *     summary: Revoke a specific customer device
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/devices/:deviceId/revoke', requirePermission(PERMISSIONS.CUSTOMER.UPDATE), revokeCustomerDeviceHandler);

/**
 * @swagger
 * /api/v1/customers/{id}/devices/transfer:
 *   post:
 *     summary: Execute Device Transfer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/devices/transfer', requirePermission(PERMISSIONS.CUSTOMER.UPDATE), executeDeviceTransferHandler);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   delete:
 *     summary: Soft delete customer
 *     tags: [Customer]
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
 *         description: Customer deleted
 *       404:
 *         description: Customer not found
 *       409:
 *         description: Conflict (has active dependencies)
 */
router.delete('/:id', requirePermission(PERMISSIONS.CUSTOMER.DELETE), deleteCustomerHandler);

/**
 * @swagger
 * /api/v1/customers/{id}/permanent:
 *   delete:
 *     summary: Fully permanently delete customer
 *     tags: [Customer]
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
 *         description: Customer permanently deleted
 *       404:
 *         description: Customer not found
 */
router.delete('/:id/permanent', requirePermission(PERMISSIONS.CUSTOMER.DELETE), hardDeleteCustomerHandler);

/**
 * @swagger
 * /api/v1/customers/{id}/activate:
 *   patch:
 *     summary: Activate customer
 *     tags: [Customer]
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
 *         description: Customer activated
 *       404:
 *         description: Customer not found
 */
router.patch('/:id/activate', requirePermission(PERMISSIONS.CUSTOMER.MANAGE), activateCustomerHandler);

/**
 * @swagger
 * /api/v1/customers/{id}/deactivate:
 *   patch:
 *     summary: Deactivate customer
 *     tags: [Customer]
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
 *         description: Customer deactivated
 *       404:
 *         description: Customer not found
 *       409:
 *         description: Conflict (has active dependencies)
 */
router.patch('/:id/deactivate', requirePermission(PERMISSIONS.CUSTOMER.MANAGE), deactivateCustomerHandler);

export default router;

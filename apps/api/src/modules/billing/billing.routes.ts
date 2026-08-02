import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../rbac/permission.middleware';
import {
  createInvoiceSchema,
  addPaymentSchema,
  invoiceListSchema,
  paymentListSchema,
} from './billing.validator';
import {
  createInvoiceHandler,
  getInvoiceHandler,
  listInvoicesHandler,
  voidInvoiceHandler,
  addPaymentHandler,
  listPaymentsHandler,
} from './billing.controller';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Billing and Payments operations
 */

/**
 * @swagger
 * /api/v1/billing/invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Billing]
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
 *               - items
 *             properties:
 *               branchId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               appointmentId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *                     snapshottedName:
 *                       type: string
 *     responses:
 *       201:
 *         description: Invoice created
 */
router.post('/invoices', requirePermission('Billing.Create' as any), validate(createInvoiceSchema), createInvoiceHandler);

/**
 * @swagger
 * /api/v1/billing/invoices:
 *   get:
 *     summary: Get list of invoices
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 */
router.get('/invoices', requirePermission('Billing.Read' as any), validate(invoiceListSchema), listInvoicesHandler);

/**
 * @swagger
 * /api/v1/billing/invoices/{id}:
 *   get:
 *     summary: Get an invoice by ID
 *     tags: [Billing]
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
 *         description: Invoice details
 */
router.get('/invoices/:id', requirePermission('Billing.Read' as any), getInvoiceHandler);

/**
 * @swagger
 * /api/v1/billing/invoices/{id}/void:
 *   patch:
 *     summary: Void an invoice
 *     tags: [Billing]
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
 *         description: Invoice voided
 */
router.patch('/invoices/:id/void', requirePermission('Billing.Manage' as any), voidInvoiceHandler);

/**
 * @swagger
 * /api/v1/billing/payments:
 *   post:
 *     summary: Add a payment to an invoice
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *               - amount
 *               - method
 *             properties:
 *               invoiceId:
 *                 type: string
 *               amount:
 *                 type: number
 *               method:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment added
 */
router.post('/payments', requirePermission('Billing.Create' as any), validate(addPaymentSchema), addPaymentHandler);

/**
 * @swagger
 * /api/v1/billing/payments:
 *   get:
 *     summary: Get list of payments
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get('/payments', requirePermission('Billing.Read' as any), validate(paymentListSchema), listPaymentsHandler);

export default router;

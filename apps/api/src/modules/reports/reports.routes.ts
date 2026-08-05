import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../rbac/permission.middleware';
import { PERMISSIONS } from '@anex/shared';
import { baseReportFilterSchema } from './reports.validator';
import {
  getDashboardSummaryHandler,
  getRevenueReportHandler,
  getRevenueTrendHandler,
  getAppointmentTrendHandler,
  getEmployeePerformanceHandler,
} from './reports.controller';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reporting and Analytics
 */

/**
 * @swagger
 * /api/v1/reports/dashboard:
 *   get:
 *     summary: Get dashboard summary KPIs
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dashboard KPIs
 */
router.get('/dashboard', requirePermission(PERMISSIONS.REPORTS.READ), getDashboardSummaryHandler);

/**
 * @swagger
 * /api/v1/reports/revenue:
 *   get:
 *     summary: Get revenue report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *     responses:
 *       200:
 *         description: Revenue report
 */
router.get('/revenue', requirePermission(PERMISSIONS.REPORTS.READ), validate(baseReportFilterSchema), getRevenueReportHandler);

/**
 * @swagger
 * /api/v1/reports/revenue/trend:
 *   get:
 *     summary: Get revenue trend
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *     responses:
 *       200:
 *         description: Revenue trend
 */
router.get('/revenue/trend', requirePermission(PERMISSIONS.REPORTS.READ), validate(baseReportFilterSchema), getRevenueTrendHandler);
router.get('/appointments/trend', requirePermission(PERMISSIONS.REPORTS.READ), validate(baseReportFilterSchema), getAppointmentTrendHandler);

/**
 * @swagger
 * /api/v1/reports/employees:
 *   get:
 *     summary: Get employee performance
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *     responses:
 *       200:
 *         description: Employee performance report
 */
router.get('/employees', requirePermission(PERMISSIONS.REPORTS.READ), validate(baseReportFilterSchema), getEmployeePerformanceHandler);

export default router;

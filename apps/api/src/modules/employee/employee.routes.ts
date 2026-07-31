import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../rbac/permission.middleware';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  searchEmployeesSchema,
} from './employee.validator';
import {
  searchEmployeesHandler,
  getEmployeeHandler,
  createEmployeeHandler,
  updateEmployeeHandler,
  deleteEmployeeHandler,
  activateEmployeeHandler,
  deactivateEmployeeHandler,
} from './employee.controller';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Employee management
 */

/**
 * @swagger
 * /api/v1/employees:
 *   get:
 *     summary: List employees
 *     tags: [Employee]
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
 *         name: branchId
 *         schema:
 *           type: string
 *       - in: query
 *         name: roleId
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of employees with pagination
 */
router.get('/', requirePermission('Employee.Read' as any), validate(searchEmployeesSchema), searchEmployeesHandler);

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employee]
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
 *         description: Employee details
 *       404:
 *         description: Employee not found
 */
router.get('/:id', requirePermission('Employee.Read' as any), getEmployeeHandler);

/**
 * @swagger
 * /api/v1/employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employee]
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
 *               - roleId
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               roleId:
 *                 type: string
 *               userId:
 *                 type: string
 *               bio:
 *                 type: string
 *               profileImageUrl:
 *                 type: string
 *               dateOfJoining:
 *                 type: string
 *                 format: date-time
 *               emergencyContactName:
 *                 type: string
 *               emergencyContactPhone:
 *                 type: string
 *               calendarColor:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               branches:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     branchId:
 *                       type: string
 *                     isPrimary:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Employee created
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found (Role, User, Branch)
 *       409:
 *         description: Conflict (Email, Phone, User already linked)
 */
router.post('/', requirePermission('Employee.Create' as any), validate(createEmployeeSchema), createEmployeeHandler);

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   put:
 *     summary: Update an employee
 *     tags: [Employee]
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
 *               phone:
 *                 type: string
 *               roleId:
 *                 type: string
 *               userId:
 *                 type: string
 *               bio:
 *                 type: string
 *               profileImageUrl:
 *                 type: string
 *               dateOfJoining:
 *                 type: string
 *                 format: date-time
 *               emergencyContactName:
 *                 type: string
 *               emergencyContactPhone:
 *                 type: string
 *               calendarColor:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               branches:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     branchId:
 *                       type: string
 *                     isPrimary:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Employee updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
 *       409:
 *         description: Conflict
 */
router.put('/:id', requirePermission('Employee.Update' as any), validate(updateEmployeeSchema), updateEmployeeHandler);

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   delete:
 *     summary: Soft delete employee
 *     tags: [Employee]
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
 *         description: Employee deleted
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Conflict (has active dependencies)
 */
router.delete('/:id', requirePermission('Employee.Delete' as any), deleteEmployeeHandler);

/**
 * @swagger
 * /api/v1/employees/{id}/activate:
 *   patch:
 *     summary: Activate employee
 *     tags: [Employee]
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
 *         description: Employee activated
 *       404:
 *         description: Employee not found
 */
router.patch('/:id/activate', requirePermission('Employee.Manage' as any), activateEmployeeHandler);

/**
 * @swagger
 * /api/v1/employees/{id}/deactivate:
 *   patch:
 *     summary: Deactivate employee
 *     tags: [Employee]
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
 *         description: Employee deactivated
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Conflict (has active dependencies)
 */
router.patch('/:id/deactivate', requirePermission('Employee.Manage' as any), deactivateEmployeeHandler);

export default router;

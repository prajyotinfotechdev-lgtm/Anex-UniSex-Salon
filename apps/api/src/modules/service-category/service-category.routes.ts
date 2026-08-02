import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../rbac/permission.middleware';
import { searchCategoriesSchema } from './service-category.validator';
import { listServiceCategoriesHandler } from './service-category.controller';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: ServiceCategory
 *   description: Service Category operations
 */

/**
 * @swagger
 * /api/v1/service-categories:
 *   get:
 *     summary: List and search service categories
 *     tags: [ServiceCategory]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of service categories
 */
router.get('/', requirePermission('Service.Read' as any), validate(searchCategoriesSchema), listServiceCategoriesHandler);

export default router;

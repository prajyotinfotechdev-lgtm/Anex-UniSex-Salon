import { Router } from 'express';
import { taxController } from './tax.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import { tenantContextMiddleware } from '../../middlewares/tenant-context.middleware';
import { CreateTaxCategoryDto, UpdateTaxCategoryDto } from './tax.dto';

const router = Router();

router.use(requireAuth);
router.use(tenantContextMiddleware);

router.get('/', taxController.getCategories);
router.post('/', validate(CreateTaxCategoryDto, 'body'), taxController.createCategory);
router.get('/:id', taxController.getCategory);
router.put('/:id', validate(UpdateTaxCategoryDto, 'body'), taxController.updateCategory);
router.delete('/:id', taxController.deleteCategory);

export { router as taxRoutes };

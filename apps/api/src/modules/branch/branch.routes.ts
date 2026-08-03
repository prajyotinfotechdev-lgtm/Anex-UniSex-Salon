import { Router } from 'express';
import { BranchController } from './branch.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import { tenantContextMiddleware } from '../../middlewares/tenant-context.middleware';
import {
  CreateBranchSchema,
  UpdateBranchSchema,
  UpsertWorkingHoursSchema,
  CreateHolidaySchema,
  BranchParams,
  HolidayParams
} from './branch.dto';

const router = Router();
const controller = new BranchController();

router.use(requireAuth);
router.use(tenantContextMiddleware);

// --- BRANCHES ---
router.get('/', controller.listBranches);
router.get('/:branchId', validate(BranchParams, 'params'), controller.getBranch);

router.post(
  '/',
  validate(CreateBranchSchema, 'body'),
  controller.createBranch
);

router.put(
  '/:branchId',
  validate(BranchParams, 'params'),
  validate(UpdateBranchSchema, 'body'),
  controller.updateBranch
);

router.delete(
  '/:branchId',
  validate(BranchParams, 'params'),
  controller.deleteBranch
);

// --- WORKING HOURS ---
router.put(
  '/:branchId/working-hours',
  validate(BranchParams, 'params'),
  validate(UpsertWorkingHoursSchema, 'body'),
  controller.upsertWorkingHours
);

// --- HOLIDAYS ---
router.post(
  '/:branchId/holidays',
  validate(BranchParams, 'params'),
  validate(CreateHolidaySchema, 'body'),
  controller.createHoliday
);

router.delete(
  '/:branchId/holidays/:holidayId',
  validate(HolidayParams, 'params'),
  controller.deleteHoliday
);

export const branchRoutes = router;

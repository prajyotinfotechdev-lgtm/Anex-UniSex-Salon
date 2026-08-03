import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { validate } from '../../middlewares/validate.middleware';
import { tenantContextMiddleware } from '../../middlewares/tenant-context.middleware';
import { 
  UpdateModuleSchema, 
  UpdateBrandingSchema, 
  UpdateInvoiceConfigSchema,
  CreateTaxGroupSchema,
  UpdateTaxGroupSchema,
  TaxGroupParams,
  OrgModuleParams
} from './settings.dto';

import { requireAuth } from '../../auth/auth.middleware';

const router = Router();
const controller = new SettingsController();

// Note: Ensure auth middleware is applied in the main index router BEFORE these routes,
// otherwise tenantContextMiddleware will not have req.user.
router.use(requireAuth);
router.use(tenantContextMiddleware);

// --- MODULES ---
router.get('/modules', controller.listModules);
router.put(
  '/modules/:moduleId',
  validate(UpdateModuleSchema, 'body'),
  validate(OrgModuleParams, 'params'),
  controller.updateModule
);

// --- BRANDING ---
router.get('/branding', controller.getBranding);
router.put(
  '/branding',
  validate(UpdateBrandingSchema, 'body'),
  controller.updateBranding
);

// --- INVOICE CONFIG ---
router.get('/invoice-config', controller.getInvoiceConfig);
router.put(
  '/invoice-config',
  validate(UpdateInvoiceConfigSchema, 'body'),
  controller.updateInvoiceConfig
);

// --- TAX GROUPS ---
router.get('/tax-groups', controller.listTaxGroups);
router.post(
  '/tax-groups',
  validate(CreateTaxGroupSchema, 'body'),
  controller.createTaxGroup
);
router.put(
  '/tax-groups/:taxGroupId',
  validate(UpdateTaxGroupSchema, 'body'),
  validate(TaxGroupParams, 'params'),
  controller.updateTaxGroup
);
router.delete(
  '/tax-groups/:taxGroupId',
  validate(TaxGroupParams, 'params'),
  controller.deleteTaxGroup
);

// --- AUDIT LOGS ---
router.get('/audit-logs', controller.getAuditLogs);

export const settingsRoutes = router;

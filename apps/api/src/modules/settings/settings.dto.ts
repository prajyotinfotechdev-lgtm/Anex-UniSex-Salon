import { z } from 'zod';

// ... existing code ...

export const UpdateModuleSchema = z.object({
  enabled: z.boolean(),
  plan: z.string().optional(),
  version: z.number().int().positive(), // optimistic concurrency
});
export type UpdateModuleDto = z.infer<typeof UpdateModuleSchema>;

export const UpdateBrandingSchema = z.object({
  designTokens: z.record(z.any()),
  version: z.number().int().positive(),
});
export type UpdateBrandingDto = z.infer<typeof UpdateBrandingSchema>;

export const UpdateInvoiceConfigSchema = z.object({
  invoicePrefix: z.string().optional(),
  receiptPrefix: z.string().optional(),
  creditNotePrefix: z.string().optional(),
  numberFormat: z.string().optional(),
  financialYearReset: z.boolean().optional(),
  showQrCode: z.boolean().optional(),
  gstLayout: z.boolean().optional(),
  printTemplate: z.string().optional(),
  version: z.number().int().positive(),
});
export type UpdateInvoiceConfigDto = z.infer<typeof UpdateInvoiceConfigSchema>;

export const CreateTaxGroupSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  isInclusive: z.boolean(),
  isActive: z.boolean().optional(),
});
export type CreateTaxGroupDto = z.infer<typeof CreateTaxGroupSchema>;

export const UpdateTaxGroupSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isInclusive: z.boolean().optional(),
  isActive: z.boolean().optional(),
  version: z.number().int().positive(),
});
export type UpdateTaxGroupDto = z.infer<typeof UpdateTaxGroupSchema>;

export const OrgModuleParams = z.object({
  moduleId: z.string().uuid(),
});

export const TaxGroupParams = z.object({
  taxGroupId: z.string().uuid(),
});

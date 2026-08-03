import { z } from 'zod';
import { TaxType } from '@anex/database';

export const TaxRateDto = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(50),
  rate: z.number().min(0, 'Rate cannot be negative'),
  type: z.nativeEnum(TaxType).default(TaxType.PERCENTAGE),
  priority: z.number().int().min(0).default(0),
});

export const CreateTaxCategoryDto = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(255).optional().nullable(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  rates: z.array(TaxRateDto).min(1, 'At least one tax rate is required'),
});

export const UpdateTaxCategoryDto = CreateTaxCategoryDto.partial().extend({
  rates: z.array(TaxRateDto).optional(),
});

export type TaxRateDtoType = z.infer<typeof TaxRateDto>;
export type CreateTaxCategoryDtoType = z.infer<typeof CreateTaxCategoryDto>;
export type UpdateTaxCategoryDtoType = z.infer<typeof UpdateTaxCategoryDto>;

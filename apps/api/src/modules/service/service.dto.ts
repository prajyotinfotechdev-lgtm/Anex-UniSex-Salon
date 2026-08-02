import { z } from 'zod';
import { PricingType } from '@anex/database';
import { createServiceSchema, updateServiceSchema, searchServicesSchema } from './service.validator';

export type CreateServiceRequestDto = z.infer<typeof createServiceSchema>['body'];
export type UpdateServiceRequestDto = z.infer<typeof updateServiceSchema>['body'];
export type SearchServicesQueryDto = z.infer<typeof searchServicesSchema>['query'];

export interface ServiceResponseDto {
  id: string;
  organizationId: string;
  serviceCategoryId: string;
  name: string;
  description: string | null;
  pricingType: PricingType;
  basePrice: any; // Decimal mapping
  durationMinutes: number;
  processingMinutes: number | null;
  cleanupMinutes: number | null;
  beforeBufferMinutes: number;
  afterBufferMinutes: number;
  color: string | null;
  requiresConsultation: boolean;
  requiresPatchTest: boolean;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  serviceCategory?: any;
  employeeServices?: any[];
  serviceBranches?: any[];
}

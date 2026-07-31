import { z } from 'zod';
import { PricingType } from '@prisma/client';

export const createServiceSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Service name is required').trim(),
    description: z.string().trim().optional().nullable(),
    pricingType: z.nativeEnum(PricingType),
    basePrice: z.number().min(0, 'Price must be greater than or equal to 0'),
    durationMinutes: z.number().int().min(0, 'Duration must be greater than or equal to 0'),
    processingMinutes: z.number().int().min(0).optional().nullable(),
    cleanupMinutes: z.number().int().min(0).optional().nullable(),
    beforeBufferMinutes: z.number().int().min(0).optional(),
    afterBufferMinutes: z.number().int().min(0).optional(),
    color: z.string().trim().optional().nullable(),
    requiresConsultation: z.boolean().optional(),
    requiresPatchTest: z.boolean().optional(),
    isActive: z.boolean().optional(),
    serviceCategoryId: z.string().uuid('Invalid category ID'),
    employees: z.array(z.string().uuid('Invalid employee ID')).optional(),
    branches: z.array(z.object({
      branchId: z.string().uuid('Invalid branch ID'),
      price: z.number().min(0, 'Price must be greater than or equal to 0')
    })).optional(),
  }),
});

export const updateServiceSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Service name is required').trim().optional(),
    description: z.string().trim().optional().nullable(),
    pricingType: z.nativeEnum(PricingType).optional(),
    basePrice: z.number().min(0, 'Price must be greater than or equal to 0').optional(),
    durationMinutes: z.number().int().min(0, 'Duration must be greater than or equal to 0').optional(),
    processingMinutes: z.number().int().min(0).optional().nullable(),
    cleanupMinutes: z.number().int().min(0).optional().nullable(),
    beforeBufferMinutes: z.number().int().min(0).optional(),
    afterBufferMinutes: z.number().int().min(0).optional(),
    color: z.string().trim().optional().nullable(),
    requiresConsultation: z.boolean().optional(),
    requiresPatchTest: z.boolean().optional(),
    isActive: z.boolean().optional(),
    serviceCategoryId: z.string().uuid('Invalid category ID').optional(),
    employees: z.array(z.string().uuid('Invalid employee ID')).optional(),
    branches: z.array(z.object({
      branchId: z.string().uuid('Invalid branch ID'),
      price: z.number().min(0, 'Price must be greater than or equal to 0')
    })).optional(),
  }),
});

export const searchServicesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    employeeId: z.string().uuid().optional(),
    branchId: z.string().uuid().optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
    pricingType: z.nativeEnum(PricingType).optional(),
    minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
    minDuration: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxDuration: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

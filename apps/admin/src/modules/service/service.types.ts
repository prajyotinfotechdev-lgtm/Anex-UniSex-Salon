import { z } from 'zod';

export enum PricingType {
  FIXED = 'FIXED',
  STARTING_AT = 'STARTING_AT',
  VARIABLE = 'VARIABLE',
  FREE = 'FREE',
}

export const serviceFormSchema = z.object({
  name: z.string().min(1, 'Service name is required').trim(),
  description: z.string().trim().optional().or(z.literal('')),
  serviceCategoryId: z.string().uuid('Category is required'),
  pricingType: z.nativeEnum(PricingType),
  basePrice: z.coerce.number().min(0, 'Price must be greater than or equal to 0'),
  durationMinutes: z.coerce.number().int().min(0, 'Duration must be greater than or equal to 0'),
  processingMinutes: z.coerce.number().int().min(0).optional().nullable(),
  cleanupMinutes: z.coerce.number().int().min(0).optional().nullable(),
  beforeBufferMinutes: z.coerce.number().int().min(0).optional().default(0),
  afterBufferMinutes: z.coerce.number().int().min(0).optional().default(0),
  color: z.string().trim().optional().or(z.literal('')),
  requiresConsultation: z.boolean().default(false),
  requiresPatchTest: z.boolean().default(false),
  isActive: z.boolean().default(true),
  employees: z.array(z.string().uuid()).default([]),
  branches: z.array(z.object({
    branchId: z.string().uuid('Invalid branch ID'),
    price: z.coerce.number().min(0, 'Price must be greater than or equal to 0')
  })).default([]),
});

export interface ServiceFormValues extends z.infer<typeof serviceFormSchema> {}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface ServiceBranch {
  branchId: string;
  price: string;
  branch?: {
    id: string;
    name: string;
  };
}

export interface EmployeeService {
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    role?: {
      name: string;
    };
  };
}

export interface Service {
  id: string;
  organizationId: string;
  serviceCategoryId: string;
  name: string;
  description: string | null;
  pricingType: PricingType;
  basePrice: string;
  durationMinutes: number;
  processingMinutes: number | null;
  cleanupMinutes: number | null;
  beforeBufferMinutes: number;
  afterBufferMinutes: number;
  color: string | null;
  requiresConsultation: boolean;
  requiresPatchTest: boolean;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  serviceCategory?: ServiceCategory;
  employeeServices?: EmployeeService[];
  serviceBranches?: ServiceBranch[];
}

export interface ServiceListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  employeeId?: string;
  branchId?: string;
  isActive?: boolean;
  pricingType?: PricingType;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

import { z } from 'zod';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export const customerFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.string().email('Invalid email format').trim().toLowerCase().optional().or(z.literal('')),
  primaryPhone: z.string().min(1, 'Primary phone is required').trim().transform(val => val.replace(/\s+/g, '')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  dob: z.string().datetime({ message: 'Must be a valid ISO 8601 date string' }).optional().nullable().or(z.literal('')),
  addressLine1: z.string().trim().optional(),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  country: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string().uuid('Invalid tag ID format')).optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export interface Customer {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  primaryPhone: string;
  gender: Gender | null;
  dob: string | null; // ISO Date String
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  tags?: Record<string, unknown>[];
  appointments?: Record<string, unknown>[];
  invoices?: Record<string, unknown>[];
  memberships?: Record<string, unknown>[];
  packages?: Record<string, unknown>[];
  walletTransactions?: Record<string, unknown>[];
  loyaltyTransactions?: Record<string, unknown>[];
}

export interface CustomerListResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CustomerSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  phone?: string;
  email?: string;
  gender?: Gender;
  isActive?: boolean;
  tagId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

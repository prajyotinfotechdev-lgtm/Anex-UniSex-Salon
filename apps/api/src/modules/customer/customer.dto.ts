import { z } from 'zod';
import { Gender } from '@prisma/client';
import { createCustomerSchema, updateCustomerSchema, searchCustomersSchema } from './customer.validator';

export type CreateCustomerRequestDto = z.infer<typeof createCustomerSchema>['body'];
export type UpdateCustomerRequestDto = z.infer<typeof updateCustomerSchema>['body'];
export type SearchCustomersQueryDto = z.infer<typeof searchCustomersSchema>['query'];

export interface CustomerResponseDto {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  primaryPhone: string;
  gender: Gender | null;
  dob: Date | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  tags?: any[];
  appointments?: any[];
  invoices?: any[];
  memberships?: any[];
  packages?: any[];
  walletTransactions?: any[];
  loyaltyTransactions?: any[];
}

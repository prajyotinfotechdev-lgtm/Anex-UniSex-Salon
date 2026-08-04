import { z } from 'zod';
import { Gender } from '@anex/database';

export const createCustomerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().min(1, 'Last name is required').trim(),
    email: z.literal('').or(z.string().email('Invalid email format').trim().toLowerCase()).optional().nullable().transform(e => e === '' ? null : e),
    primaryPhone: z.string().min(1, 'Primary phone is required').trim().transform(val => val.replace(/\s+/g, '')),
    gender: z.nativeEnum(Gender).optional().nullable(),
    dob: z.literal('').or(z.string().datetime({ message: 'Must be a valid ISO 8601 date string' })).optional().nullable().transform(e => e === '' ? null : e),
    addressLine1: z.string().trim().optional().nullable(),
    addressLine2: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    state: z.string().trim().optional().nullable(),
    zipCode: z.string().trim().optional().nullable(),
    country: z.string().trim().optional().nullable(),
    notes: z.string().trim().optional().nullable(),
    isActive: z.boolean().optional(),
    tags: z.array(z.string().uuid('Invalid tag ID format')).optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').trim().optional(),
    lastName: z.string().min(1, 'Last name is required').trim().optional(),
    email: z.literal('').or(z.string().email('Invalid email format').trim().toLowerCase()).optional().nullable().transform(e => e === '' ? null : e),
    primaryPhone: z.string().min(1, 'Primary phone is required').trim().transform(val => val.replace(/\s+/g, '')).optional(),
    gender: z.nativeEnum(Gender).optional().nullable(),
    dob: z.literal('').or(z.string().datetime({ message: 'Must be a valid ISO 8601 date string' })).optional().nullable().transform(e => e === '' ? null : e),
    addressLine1: z.string().trim().optional().nullable(),
    addressLine2: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    state: z.string().trim().optional().nullable(),
    zipCode: z.string().trim().optional().nullable(),
    country: z.string().trim().optional().nullable(),
    notes: z.string().trim().optional().nullable(),
    isActive: z.boolean().optional(),
    tags: z.array(z.string().uuid('Invalid tag ID format')).optional(),
  }),
});

export const searchCustomersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    gender: z.nativeEnum(Gender).optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
    tagId: z.string().uuid().optional(),
    createdAtFrom: z.string().datetime().optional(),
    createdAtTo: z.string().datetime().optional(),
    sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'email', 'primaryPhone']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

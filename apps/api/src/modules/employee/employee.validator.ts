import { z } from 'zod';

export const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().min(1, 'Last name is required').trim(),
    email: z.string().email('Invalid email format').trim().optional().nullable(),
    phone: z.string().trim().optional().nullable(),
    roleId: z.string().uuid('Invalid role ID format'),
    userId: z.string().uuid('Invalid user ID format').optional().nullable(),
    bio: z.string().optional().nullable(),
    profileImageId: z.string().uuid('Invalid profileImageId format').optional().nullable(),
    dateOfJoining: z.string().datetime({ message: 'Must be a valid ISO 8601 date string' }).optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    calendarColor: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    branches: z.array(z.object({
      branchId: z.string().uuid('Invalid branch ID format'),
      isPrimary: z.boolean().default(false)
    })).optional(),
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').trim().optional(),
    lastName: z.string().min(1, 'Last name is required').trim().optional(),
    email: z.string().email('Invalid email format').trim().optional().nullable(),
    phone: z.string().trim().optional().nullable(),
    roleId: z.string().uuid('Invalid role ID format').optional(),
    userId: z.string().uuid('Invalid user ID format').optional().nullable(),
    bio: z.string().optional().nullable(),
    profileImageId: z.string().uuid('Invalid profileImageId format').optional().nullable(),
    dateOfJoining: z.string().datetime({ message: 'Must be a valid ISO 8601 date string' }).optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    calendarColor: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    branches: z.array(z.object({
      branchId: z.string().uuid('Invalid branch ID format'),
      isPrimary: z.boolean().default(false)
    })).optional(),
  }),
});

export const searchEmployeesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    branchId: z.string().uuid().optional(),
    roleId: z.string().uuid().optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
    sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'email', 'phone']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

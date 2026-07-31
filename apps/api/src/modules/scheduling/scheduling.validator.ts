import { z } from 'zod';

export const checkAvailabilitySchema = z.object({
  body: z.object({
    branchId: z.string().uuid('Invalid branch ID'),
    employeeId: z.string().uuid('Invalid employee ID'),
    serviceId: z.string().uuid('Invalid service ID'),
    startTime: z.string().datetime('Invalid start time format (must be ISO DateTime)'),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
  }),
});

export const generateSlotsSchema = z.object({
  body: z.object({
    branchId: z.string().uuid('Invalid branch ID'),
    employeeId: z.string().uuid('Invalid employee ID'),
    serviceId: z.string().uuid('Invalid service ID'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    intervalMinutes: z.number().min(5).max(120).optional(),
  }),
});

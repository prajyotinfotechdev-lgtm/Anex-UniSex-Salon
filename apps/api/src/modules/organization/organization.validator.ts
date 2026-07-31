import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim(),
    currencyCode: z.string().min(3).max(3).optional(),
    countryCode: z.string().min(2).max(2).optional(),
    locale: z.string().min(2).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim(),
    address: z.string().trim().optional().nullable(),
    phone: z.string().trim().optional().nullable(),
    timeZone: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateBranchSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim().optional(),
    address: z.string().trim().optional().nullable(),
    phone: z.string().trim().optional().nullable(),
    timeZone: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createHolidaySchema = z.object({
  body: z.object({
    date: z.string().datetime({ message: 'Must be a valid ISO 8601 date string' }),
    isClosed: z.boolean().optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional().nullable(),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional().nullable(),
    reason: z.string().trim().optional().nullable(),
  }),
});

export const updateHolidaySchema = z.object({
  body: z.object({
    date: z.string().datetime({ message: 'Must be a valid ISO 8601 date string' }).optional(),
    isClosed: z.boolean().optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional().nullable(),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional().nullable(),
    reason: z.string().trim().optional().nullable(),
  }),
});

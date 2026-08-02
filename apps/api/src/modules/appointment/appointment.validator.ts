import { z } from 'zod';
import { AppointmentSource, AppointmentStatus } from '@anex/database';

export const appointmentItemSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  employeeId: z.string().uuid('Invalid employee ID'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
}).refine(data => new Date(data.startTime) < new Date(data.endTime), {
  message: 'Start time must be before end time',
  path: ['startTime'],
});

export const createAppointmentSchema = z.object({
  body: z.object({
    branchId: z.string().uuid('Invalid branch ID'),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
    source: z.nativeEnum(AppointmentSource).optional(),
    status: z.nativeEnum(AppointmentStatus).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    notes: z.string().trim().optional().nullable(),
    internalNotes: z.string().trim().optional().nullable(),
    items: z.array(appointmentItemSchema).min(1, 'At least one service is required'),
  }).refine(data => {
    // Check for duplicate service+employee+startTime
    const itemStrings = data.items.map(item => `${item.serviceId}-${item.employeeId}-${item.startTime}`);
    const uniqueItems = new Set(itemStrings);
    return uniqueItems.size === itemStrings.length;
  }, {
    message: 'Duplicate service assignment detected for the same employee at the same time',
    path: ['items'],
  }),
});

export const updateAppointmentSchema = z.object({
  body: z.object({
    branchId: z.string().uuid('Invalid branch ID').optional(),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
    source: z.nativeEnum(AppointmentSource).optional(),
    status: z.nativeEnum(AppointmentStatus).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
    notes: z.string().trim().optional().nullable(),
    internalNotes: z.string().trim().optional().nullable(),
    cancellationReason: z.string().trim().optional().nullable(),
    items: z.array(appointmentItemSchema).min(1, 'At least one service is required').optional(),
  }).refine(data => {
    if (!data.items) return true;
    const itemStrings = data.items.map(item => `${item.serviceId}-${item.employeeId}-${item.startTime}`);
    const uniqueItems = new Set(itemStrings);
    return uniqueItems.size === itemStrings.length;
  }, {
    message: 'Duplicate service assignment detected for the same employee at the same time',
    path: ['items'],
  }),
});

export const searchAppointmentsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    customerId: z.string().uuid().optional(),
    employeeId: z.string().uuid().optional(),
    branchId: z.string().uuid().optional(),
    serviceId: z.string().uuid().optional(),
    status: z.nativeEnum(AppointmentStatus).optional(),
    source: z.nativeEnum(AppointmentSource).optional(),
    dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    sortBy: z.enum(['createdAt', 'scheduledDate', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

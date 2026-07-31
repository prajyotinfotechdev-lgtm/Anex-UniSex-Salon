import { z } from 'zod';

export const cancelAppointmentSchema = z.object({
  body: z.object({
    cancellationReason: z.string().min(1, 'Cancellation reason is required'),
  }),
});

export const updateNotesSchema = z.object({
  body: z.object({
    notes: z.string().optional().nullable(),
    internalNotes: z.string().optional().nullable(),
  }),
});

export const rescheduleAppointmentSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    startTime: z.string().datetime('Invalid start time format'),
  }),
});

export const changeEmployeeSchema = z.object({
  body: z.object({
    appointmentItemId: z.string().uuid('Invalid appointment item ID'),
    newEmployeeId: z.string().uuid('Invalid new employee ID'),
  }),
});

export const changeServiceSchema = z.object({
  body: z.object({
    appointmentItemId: z.string().uuid('Invalid appointment item ID'),
    newServiceId: z.string().uuid('Invalid new service ID'),
  }),
});

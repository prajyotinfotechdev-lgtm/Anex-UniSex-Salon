import { z } from 'zod';

export const CreateBranchSchema = z.object({
  name: z.string().min(2),
  branchCode: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  managerId: z.string().uuid().optional(),
  timeZone: z.string().default('UTC'),
  isDefault: z.boolean().default(false),
  posCounters: z.number().int().min(1).default(1),
  cashDrawers: z.number().int().min(1).default(1),
  rooms: z.number().int().min(0).default(0),
  chairs: z.number().int().min(0).default(0),
});
export type CreateBranchDto = z.infer<typeof CreateBranchSchema>;

export const UpdateBranchSchema = CreateBranchSchema.partial().extend({
  version: z.number().int().positive(), // optimistic concurrency
});
export type UpdateBranchDto = z.infer<typeof UpdateBranchSchema>;

// Note: openTime and closeTime come in as "HH:mm:ss" strings (or ISO).
// We validate they are strings here; parsing to Date happens in service.
export const WorkingHourSchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  isOpen: z.boolean(),
  openTime: z.string().nullable().optional(),
  closeTime: z.string().nullable().optional(),
});

export const UpsertWorkingHoursSchema = z.object({
  hours: z.array(WorkingHourSchema),
});
export type UpsertWorkingHoursDto = z.infer<typeof UpsertWorkingHoursSchema>;

export const CreateHolidaySchema = z.object({
  date: z.string().datetime(), // ISO string for the date
  title: z.string().min(1),
  recurring: z.boolean().default(false),
  fullDay: z.boolean().default(true),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
});
export type CreateHolidayDto = z.infer<typeof CreateHolidaySchema>;

export const UpdateHolidaySchema = CreateHolidaySchema.partial();
export type UpdateHolidayDto = z.infer<typeof UpdateHolidaySchema>;

export const BranchParams = z.object({
  branchId: z.string().uuid(),
});

export const HolidayParams = z.object({
  branchId: z.string().uuid(),
  holidayId: z.string().uuid(),
});

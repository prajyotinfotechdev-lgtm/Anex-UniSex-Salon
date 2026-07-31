import { z } from 'zod';

export const baseReportFilterSchema = z.object({
  query: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    branchId: z.string().uuid().optional(),
    employeeId: z.string().uuid().optional(),
    customerId: z.string().uuid().optional(),
    serviceId: z.string().uuid().optional(),
    format: z.enum(['json', 'csv']).optional().default('json'),
    period: z.enum(['day', 'week', 'month', 'year']).optional().default('day'),
  }),
}).refine((data) => new Date(data.query.startDate) <= new Date(data.query.endDate), {
  message: "startDate cannot be after endDate",
  path: ["query", "startDate"],
});

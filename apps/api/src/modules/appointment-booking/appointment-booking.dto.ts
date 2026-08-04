import { z } from 'zod';
import { SaveConsultationDto } from '../consultation-engine/consultation-engine.dto';

export const StartBookingDto = z.object({
  customerId: z.string(),
  branchId: z.string(),
});

export const CheckRequirementsDto = z.object({
  serviceIds: z.array(z.string()),
});

export const ConfirmBookingDto = z.object({
  appointmentId: z.string(),
  items: z.array(z.object({
    serviceId: z.string(),
    employeeId: z.string().nullable().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })),
  consultations: z.array(SaveConsultationDto).optional(),
});

export type StartBookingInput = z.infer<typeof StartBookingDto>;
export type CheckRequirementsInput = z.infer<typeof CheckRequirementsDto>;
export type ConfirmBookingInput = z.infer<typeof ConfirmBookingDto>;

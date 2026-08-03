import { z } from 'zod';
import { SaveConsultationDto } from '../consultation-engine/consultation-engine.dto';

export const StartBookingDto = z.object({
  customerId: z.string().uuid(),
  branchId: z.string().uuid(),
});

export const CheckRequirementsDto = z.object({
  serviceIds: z.array(z.string().uuid()),
});

export const ConfirmBookingDto = z.object({
  appointmentId: z.string().uuid(),
  items: z.array(z.object({
    serviceId: z.string().uuid(),
    employeeId: z.string().uuid(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })),
  consultations: z.array(SaveConsultationDto).optional(),
});

export type StartBookingInput = z.infer<typeof StartBookingDto>;
export type CheckRequirementsInput = z.infer<typeof CheckRequirementsDto>;
export type ConfirmBookingInput = z.infer<typeof ConfirmBookingDto>;

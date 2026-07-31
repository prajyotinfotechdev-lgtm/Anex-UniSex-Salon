import { z } from 'zod';
import {
  cancelAppointmentSchema,
  updateNotesSchema,
  rescheduleAppointmentSchema,
  changeEmployeeSchema,
  changeServiceSchema,
} from './appointment-operations.validator';

export type CancelAppointmentRequestDto = z.infer<typeof cancelAppointmentSchema>['body'];
export type UpdateNotesRequestDto = z.infer<typeof updateNotesSchema>['body'];
export type RescheduleAppointmentRequestDto = z.infer<typeof rescheduleAppointmentSchema>['body'];
export type ChangeEmployeeRequestDto = z.infer<typeof changeEmployeeSchema>['body'];
export type ChangeServiceRequestDto = z.infer<typeof changeServiceSchema>['body'];

import { z } from 'zod';
import { AppointmentSource, AppointmentStatus } from '@anex/database';
import { createAppointmentSchema, updateAppointmentSchema, searchAppointmentsSchema } from './appointment.validator';

export type CreateAppointmentRequestDto = z.infer<typeof createAppointmentSchema>['body'];
export type UpdateAppointmentRequestDto = z.infer<typeof updateAppointmentSchema>['body'];
export type SearchAppointmentsQueryDto = z.infer<typeof searchAppointmentsSchema>['query'];

export interface AppointmentItemDto {
  serviceId: string;
  employeeId: string;
  startTime: string; // ISO DateTime string
  endTime: string;
  price: number;
}

export interface AppointmentResponseDto {
  id: string;
  branchId: string;
  customerId: string | null;
  source: AppointmentSource;
  status: AppointmentStatus;
  date: Date;
  notes: string | null;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  confirmedAt: Date | null;
  checkedInAt: Date | null;
  completedAt: Date | null;
  internalNotes: string | null;
  createdByEmployeeId: string | null;
  updatedByEmployeeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  branch?: any;
  customer?: any;
  items?: any[];
}

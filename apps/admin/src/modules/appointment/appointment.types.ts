import { z } from 'zod';
import { Customer } from '../customer/customer.types';
import { Employee } from '../employee/employee.types';
import { Service } from '../service/service.types';
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum AppointmentSource {
  MANUAL = 'MANUAL',
  ONLINE = 'ONLINE',
  WALK_IN = 'WALK_IN',
}

// --- Schema Definitions ---

export const appointmentItemSchema = z.object({
  id: z.string().uuid().optional(),
  serviceId: z.string().uuid('Service is required'),
  employeeId: z.string().uuid('Employee is required'),
  startTime: z.string(), // ISO string from frontend slot selection
  endTime: z.string(), // ISO string
  price: z.number().min(0),
});

export const appointmentFormSchema = z.object({
  customerId: z.string().uuid('Customer is required'),
  branchId: z.string().uuid('Branch is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  source: z.nativeEnum(AppointmentSource).default(AppointmentSource.MANUAL),
  status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.PENDING),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  items: z.array(appointmentItemSchema).min(1, 'At least one service is required'),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export const rescheduleAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string(), // ISO string
});

export type RescheduleAppointmentValues = z.infer<typeof rescheduleAppointmentSchema>;

// --- API DTOs ---

export interface AppointmentItem {
  id: string;
  appointmentId: string;
  serviceId: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  price: number;
  durationMinutes: number;
  status: string;
  service?: Service;
  employee?: Employee;
}

export interface Appointment {
  id: string;
  branchId: string;
  customerId: string | null;
  source: AppointmentSource;
  status: AppointmentStatus;
  date: string; // From API it comes as string, we can parse it to Date later
  notes: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  confirmedAt: string | null;
  checkedInAt: string | null;
  completedAt: string | null;
  internalNotes: string | null;
  createdByEmployeeId: string | null;
  updatedByEmployeeId: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  branch?: any;
  customer?: Customer;
  items?: AppointmentItem[];
  invoices?: any[];
}

export interface SlotGenerationRequest {
  branchId: string;
  employeeId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  intervalMinutes?: number;
}

export interface TimeSlot {
  startTime: string; // ISO DateTime
  endTime: string;   // ISO DateTime
}

export interface SlotGenerationResponse {
  success: boolean;
  data: TimeSlot[];
}

export interface CheckAvailabilityRequest {
  branchId: string;
  employeeId: string;
  serviceId: string;
  startTime: string; // ISO DateTime
  customerId?: string;
}

export interface AvailabilityResponse {
  success: boolean;
  data: {
    isAvailable: boolean;
    conflicts?: any[];
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

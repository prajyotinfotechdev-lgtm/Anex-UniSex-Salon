import { z } from 'zod';
import {
  updateOrganizationSchema,
  createBranchSchema,
  updateBranchSchema,
  createHolidaySchema,
  updateHolidaySchema,
} from './organization.validator';

export type UpdateOrganizationRequestDto = z.infer<typeof updateOrganizationSchema>['body'];
export type CreateBranchRequestDto = z.infer<typeof createBranchSchema>['body'];
export type UpdateBranchRequestDto = z.infer<typeof updateBranchSchema>['body'];
export type CreateHolidayRequestDto = z.infer<typeof createHolidaySchema>['body'];
export type UpdateHolidayRequestDto = z.infer<typeof updateHolidaySchema>['body'];

export interface OrganizationResponseDto {
  id: string;
  name: string;
  currencyCode: string;
  countryCode: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface BranchResponseDto {
  id: string;
  organizationId: string;
  name: string;
  address: string | null;
  phone: string | null;
  timeZone: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface HolidayResponseDto {
  id: string;
  branchId: string;
  date: Date;
  isClosed: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

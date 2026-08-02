import { z } from 'zod';
import { createEmployeeSchema, updateEmployeeSchema, searchEmployeesSchema } from './employee.validator';

export type CreateEmployeeRequestDto = z.infer<typeof createEmployeeSchema>['body'];
export type UpdateEmployeeRequestDto = z.infer<typeof updateEmployeeSchema>['body'];
export type SearchEmployeesQueryDto = z.infer<typeof searchEmployeesSchema>['query'];

export interface EmployeeBranchDto {
  branchId: string;
  isPrimary: boolean;
}

export interface EmployeeResponseDto {
  id: string;
  organizationId: string;
  userId: string | null;
  roleId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  profileImageId: string | null;
  bio: string | null;
  dateOfJoining: Date | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  calendarColor: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  branches?: EmployeeBranchDto[];
}

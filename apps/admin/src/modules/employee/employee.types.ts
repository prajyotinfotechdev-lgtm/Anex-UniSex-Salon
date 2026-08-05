import { z } from 'zod';

export const employeeFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.string().email('Invalid email format').trim().optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  roleId: z.string().uuid('Invalid role ID format'),
  bio: z.string().optional().or(z.literal('')),
  profileImageId: z.string().uuid('Invalid UUID format').optional().or(z.literal('')),
  dateOfJoining: z.string().optional().or(z.literal('')),
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  calendarColor: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
  branches: z.array(z.object({
    branchId: z.string().uuid('Invalid branch ID format'),
    isPrimary: z.boolean()
  })).min(1, 'At least one branch must be selected'),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export interface EmployeeBranch {
  branchId: string;
  isPrimary: boolean;
}

export interface Employee {
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
  dateOfJoining: string | null; // ISO Date String
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  calendarColor: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  branches?: EmployeeBranch[];
  role?: {
    id: string;
    name: string;
  };
}

export interface EmployeeListResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EmployeeSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  roleId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Role {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export interface RoleListResponse {
  data: Role[];
  meta?: Record<string, unknown>;
}

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
}

export interface BranchListResponse {
  data: Branch[];
  meta?: Record<string, unknown>;
}

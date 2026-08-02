import { apiClient } from './axios';
import { EmployeeListResponse, Employee, EmployeeSearchParams, EmployeeFormValues, RoleListResponse, BranchListResponse } from '@/modules/employee/employee.types';

export const employeesApi = {
  list: async (params?: EmployeeSearchParams): Promise<EmployeeListResponse> => {
    const response = await apiClient.get<EmployeeListResponse>('/employees', { params });
    return response.data;
  },

  get: async (id: string): Promise<{ data: Employee }> => {
    const response = await apiClient.get<{ data: Employee }>(`/employees/${id}`);
    return response.data;
  },

  create: async (data: EmployeeFormValues): Promise<{ data: Employee }> => {
    const response = await apiClient.post<{ data: Employee }>('/employees', data);
    return response.data;
  },

  update: async (id: string, data: Partial<EmployeeFormValues>): Promise<{ data: Employee }> => {
    const response = await apiClient.patch<{ data: Employee }>(`/employees/${id}`, data);
    return response.data;
  },

  activate: async (id: string): Promise<void> => {
    await apiClient.patch(`/employees/${id}/activate`);
  },

  deactivate: async (id: string): Promise<void> => {
    await apiClient.patch(`/employees/${id}/deactivate`);
  },

  listRoles: async (): Promise<RoleListResponse> => {
    const response = await apiClient.get<RoleListResponse>('/roles?isActive=true');
    return response.data;
  },

  listBranches: async (): Promise<BranchListResponse> => {
    const response = await apiClient.get<BranchListResponse>('/organization/branches');
    return response.data;
  }
};

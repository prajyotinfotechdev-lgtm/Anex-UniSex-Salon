import { apiClient } from './axios';

export const authApi = {
  login: async (data: any) => {
    const response = await apiClient.post('/auth/login', data);
    const { tokens, employee, role, permissions, user } = response.data.data;
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        organizationId: employee.organizationId,
        branchId: employee.branchId,
        role: {
          id: role.id,
          name: role.name,
          permissions: permissions,
        },
      }
    };
  },
  
  forgotPassword: async (data: { email: string }) => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data.data;
  },
  
  verifyOTP: async (data: { email: string; otp: string }) => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data.data;
  },
  
  resetPassword: async (data: any) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data.data;
  },
};

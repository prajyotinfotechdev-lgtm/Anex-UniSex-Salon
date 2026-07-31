import { apiClient } from './axios';

export const authApi = {
  login: async (data: any) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data.data;
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

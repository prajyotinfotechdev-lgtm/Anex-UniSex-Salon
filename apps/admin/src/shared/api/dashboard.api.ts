import { apiClient } from '@/shared/api/axios';

export const getDashboardSummary = async (branchId?: string) => {
  const params = branchId ? { branchId } : {};
  const response = await apiClient.get('/reports/dashboard', { params });
  return response.data.data;
};

export const getRevenueTrend = async (startDate: string, endDate: string, branchId?: string) => {
  const params: Record<string, unknown> = { startDate, endDate, period: 'day' };
  if (branchId) params.branchId = branchId;
  const response = await apiClient.get('/reports/revenue/trend', { params });
  return response.data.data;
};

export const getAppointmentTrend = async (startDate: string, endDate: string, branchId?: string) => {
  const params: Record<string, unknown> = { startDate, endDate, period: 'day' };
  if (branchId) params.branchId = branchId;
  const response = await apiClient.get('/reports/appointments/trend', { params });
  return response.data.data;
};

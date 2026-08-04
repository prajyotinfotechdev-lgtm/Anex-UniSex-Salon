import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/axios';
import { Service, ServiceListParams, ServiceFormValues, PaginatedResponse, ApiResponse } from './service.types';

export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters: string) => [...serviceKeys.lists(), { filters }] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
};

export const useServices = (params?: ServiceListParams) => {
  return useQuery({
    queryKey: serviceKeys.list(JSON.stringify(params)),
    queryFn: async () => {
      const { data: responseData } = await apiClient.get<any>('/services', { params });
      const payload = responseData.data || {};
      return {
        data: payload.data || [],
        meta: {
          total: payload.total || 0,
          page: payload.page || 1,
          limit: payload.limit || 10,
          totalPages: Math.ceil((payload.total || 0) / (payload.limit || 10)) || 1
        }
      } as PaginatedResponse<Service>;
    },
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Service>>(`/services/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      const { data: response } = await apiClient.post<ApiResponse<Service>>('/services', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
};

export const useUpdateService = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ServiceFormValues>) => {
      const { data: response } = await apiClient.put<ApiResponse<Service>>(`/services/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
};

export const useActivateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<ApiResponse<Service>>(`/services/${id}/activate`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
};

export const useDeactivateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<ApiResponse<Service>>(`/services/${id}/deactivate`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
};

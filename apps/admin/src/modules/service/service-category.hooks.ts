import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/axios';
import { ServiceCategory, PaginatedResponse } from './service.types';

export const serviceCategoryKeys = {
  all: ['service-categories'] as const,
  lists: () => [...serviceCategoryKeys.all, 'list'] as const,
  list: (filters: string) => [...serviceCategoryKeys.lists(), { filters }] as const,
  details: () => [...serviceCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceCategoryKeys.details(), id] as const,
};

export const useServiceCategories = (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) => {
  return useQuery({
    queryKey: serviceCategoryKeys.list(JSON.stringify(params)),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<ServiceCategory>>('/service-categories', { params });
      return data.data;
    },
  });
};

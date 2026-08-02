import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeesApi } from '@/shared/api/employees.api';
import { EmployeeSearchParams, EmployeeFormValues } from './employee.types';

export const useEmployees = (params?: EmployeeSearchParams) => {
  return useQuery({
    queryKey: ['employees', 'list', params],
    queryFn: () => employeesApi.list(params),
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employees', 'detail', id],
    queryFn: () => employeesApi.get(id),
    enabled: !!id,
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles', 'list'],
    queryFn: () => employeesApi.listRoles(),
  });
};

export const useBranches = () => {
  return useQuery({
    queryKey: ['branches', 'list'],
    queryFn: () => employeesApi.listBranches(),
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployeeFormValues) => employeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee created successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create employee');
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeFormValues> }) =>
      employeesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', 'detail', variables.id] });
      toast.success('Employee updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update employee');
    },
  });
};

export const useActivateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApi.activate(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['employees'] });
      const previousData = queryClient.getQueryData(['employees', 'detail', id]);
      
      queryClient.setQueryData(['employees', 'detail', id], (old: unknown) => {
        const oldData = old as { data: Record<string, unknown> } | undefined;
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: { ...oldData.data, isActive: true }
        };
      });

      return { previousData, id };
    },
    onError: (err, newTodo, context: unknown) => {
      const ctx = context as { previousData: unknown, id: string };
      if (ctx?.previousData) {
        queryClient.setQueryData(['employees', 'detail', ctx.id], ctx.previousData);
      }
      toast.error('Failed to activate employee');
    },
    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({ queryKey: ['employees', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] });
    },
  });
};

export const useDeactivateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApi.deactivate(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['employees'] });
      const previousData = queryClient.getQueryData(['employees', 'detail', id]);
      
      queryClient.setQueryData(['employees', 'detail', id], (old: unknown) => {
        const oldData = old as { data: Record<string, unknown> } | undefined;
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: { ...oldData.data, isActive: false }
        };
      });

      return { previousData, id };
    },
    onError: (err, newTodo, context: unknown) => {
      const ctx = context as { previousData: unknown, id: string };
      if (ctx?.previousData) {
        queryClient.setQueryData(['employees', 'detail', ctx.id], ctx.previousData);
      }
      toast.error('Failed to deactivate employee');
    },
    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({ queryKey: ['employees', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] });
    },
  });
};

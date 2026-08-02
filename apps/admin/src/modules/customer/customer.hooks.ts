import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomersApi } from '@/shared/api/customers.api';
import { CustomerSearchParams, CustomerFormValues, Customer } from './customer.types';
import { queryKeys } from '@/shared/api/queryKeys';

export function useCustomers(params?: CustomerSearchParams) {
  return useQuery({
    queryKey: queryKeys.customers.all(params),
    queryFn: () => CustomersApi.search(params),
    placeholderData: (previousData) => previousData, // keep previous data while fetching new pages
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => CustomersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerFormValues) => CustomersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerFormValues> }) =>
      CustomersApi.update(id, data),
    onSuccess: (updatedCustomer) => {
      // Invalidate specific customer detail and list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(updatedCustomer.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
    },
  });
}

export function useActivateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CustomersApi.activate(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.customers.detail(id) });
      const previousCustomer = queryClient.getQueryData<Customer>(queryKeys.customers.detail(id));
      
      if (previousCustomer) {
        queryClient.setQueryData<Customer>(queryKeys.customers.detail(id), {
          ...previousCustomer,
          isActive: true,
        });
      }
      return { previousCustomer };
    },
    onError: (err, id, context) => {
      if (context?.previousCustomer) {
        queryClient.setQueryData(queryKeys.customers.detail(id), context.previousCustomer);
      }
    },
    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
    },
  });
}

export function useDeactivateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CustomersApi.deactivate(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.customers.detail(id) });
      const previousCustomer = queryClient.getQueryData<Customer>(queryKeys.customers.detail(id));
      
      if (previousCustomer) {
        queryClient.setQueryData<Customer>(queryKeys.customers.detail(id), {
          ...previousCustomer,
          isActive: false,
        });
      }
      return { previousCustomer };
    },
    onError: (err, id, context) => {
      if (context?.previousCustomer) {
        queryClient.setQueryData(queryKeys.customers.detail(id), context.previousCustomer);
      }
    },
    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
    },
  });
}

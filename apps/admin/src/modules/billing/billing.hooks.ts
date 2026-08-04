import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/axios';
import { PaginatedResponse, Invoice, InvoiceListParams, CreateInvoiceInput, AddPaymentInput, Payment, PaymentListParams } from './billing.types';
import { toast } from 'sonner';

// --- INVOICES ---

export function useInvoices(params?: InvoiceListParams) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Invoice>>('/billing/invoices', { params });
      return data.data;
    },
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ message: string; data: Invoice }>(`/billing/invoices/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInvoiceInput) => {
      const { data } = await apiClient.post<{ message: string; data: Invoice }>('/billing/invoices', payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Invoice created successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    },
  });
}

export function useVoidInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<{ message: string; data: Invoice }>(`/billing/invoices/${id}/void`);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Invoice voided successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to void invoice');
    },
  });
}

// --- PAYMENTS ---

export function usePayments(params?: PaymentListParams) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Payment>>('/billing/payments', { params });
      return data.data;
    },
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddPaymentInput) => {
      const { data } = await apiClient.post<{ message: string; data: Payment }>('/billing/payments', payload);
      return data;
    },
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Payment added successfully');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add payment');
    },
  });
}

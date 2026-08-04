import { apiClient } from './axios';
import { Customer, CustomerFormValues, CustomerListResponse, CustomerSearchParams } from '@/modules/customer/customer.types';

export class CustomersApi {
  static async search(params?: CustomerSearchParams): Promise<CustomerListResponse> {
    const { data: responseData } = await apiClient.get<any>('/customers', { params });
    const payload = responseData.data || {};
    return {
      data: payload.data || [],
      meta: {
        total: payload.total || 0,
        page: payload.page || 1,
        limit: payload.limit || 10,
        totalPages: Math.ceil((payload.total || 0) / (payload.limit || 10)) || 1
      }
    } as unknown as CustomerListResponse;
  }

  static async getById(id: string): Promise<Customer> {
    const { data } = await apiClient.get<{ data: Customer }>(`/customers/${id}`);
    return data.data;
  }

  static async create(payload: CustomerFormValues): Promise<Customer> {
    const { data } = await apiClient.post<{ data: Customer }>('/customers', payload);
    return data.data;
  }

  static async update(id: string, payload: Partial<CustomerFormValues>): Promise<Customer> {
    const { data } = await apiClient.put<{ data: Customer }>(`/customers/${id}`, payload);
    return data.data;
  }

  static async activate(id: string): Promise<Customer> {
    const { data } = await apiClient.patch<{ data: Customer }>(`/customers/${id}/activate`);
    return data.data;
  }

  static async deactivate(id: string): Promise<Customer> {
    const { data } = await apiClient.patch<{ data: Customer }>(`/customers/${id}/deactivate`);
    return data.data;
  }
}

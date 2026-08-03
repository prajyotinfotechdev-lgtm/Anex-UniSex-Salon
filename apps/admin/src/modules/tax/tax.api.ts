import { fetchApi } from '@/lib/api-client';

export interface TaxRate {
  id?: string;
  name: string;
  rate: number;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  priority: number;
}

export interface TaxCategory {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  isDefault: boolean;
  taxRates: TaxRate[];
  _count?: {
    services: number;
    products: number;
  };
}

export type CreateTaxCategoryDto = Omit<TaxCategory, 'id' | '_count' | 'taxRates'> & { rates: TaxRate[] };
export type UpdateTaxCategoryDto = Partial<CreateTaxCategoryDto>;

export const TaxApi = {
  listCategories: () => fetchApi<TaxCategory[]>('/settings/taxes'),
  
  getCategory: (id: string) => fetchApi<TaxCategory>(`/settings/taxes/${id}`),
  
  createCategory: (data: CreateTaxCategoryDto) =>
    fetchApi<TaxCategory>('/settings/taxes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  updateCategory: (id: string, data: UpdateTaxCategoryDto) =>
    fetchApi<TaxCategory>(`/settings/taxes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  deleteCategory: (id: string) =>
    fetchApi<{ success: boolean }>(`/settings/taxes/${id}`, {
      method: 'DELETE',
    }),
};

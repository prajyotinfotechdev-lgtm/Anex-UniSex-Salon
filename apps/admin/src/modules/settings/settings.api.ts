import { fetchApi } from '@/lib/api-client';
export interface Module {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  category: string;
  enabledByDefault: boolean;
  createdAt: string;
}

export interface OrganizationModule {
  organizationId: string;
  moduleId: string;
  enabled: boolean;
  plan: string;
  version: number;
  module: Module;
}

export interface BrandingConfiguration {
  organizationId: string;
  designTokens: any;
  version: number;
}

export interface InvoiceConfiguration {
  organizationId: string;
  invoicePrefix: string | null;
  receiptPrefix: string | null;
  creditNotePrefix: string | null;
  numberFormat: string;
  financialYearReset: boolean;
  showQrCode: boolean;
  gstLayout: boolean;
  printTemplate: string;
  version: number;
}

export interface AuditLog {
  id: string;
  action: string;
  entityName: string;
  entityId: string;
  oldValue: any;
  newValue: any;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  }
}

export const SettingsApi = {
  // Modules
  listModules: () => fetchApi<OrganizationModule[]>('/settings/modules'),
  updateModule: (moduleId: string, data: { enabled: boolean, version: number }) => 
    fetchApi<OrganizationModule>(`/settings/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Branding
  getBranding: () => fetchApi<BrandingConfiguration>('/settings/branding'),
  updateBranding: (data: { designTokens: any, version: number }) =>
    fetchApi<BrandingConfiguration>('/settings/branding', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Invoice Config
  getInvoiceConfig: () => fetchApi<InvoiceConfiguration>('/settings/invoice-config'),
  updateInvoiceConfig: (data: Partial<InvoiceConfiguration> & { version: number }) =>
    fetchApi<InvoiceConfiguration>('/settings/invoice-config', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Audit Logs
  getAuditLogs: () => fetchApi<AuditLog[]>('/settings/audit-logs'),

  // Closures & Working Hours
  listClosures: () => fetchApi<any[]>('/settings/closures'),
  createClosure: (data: { date: string; reason?: string; isClosed: boolean; startTime?: string; endTime?: string }) =>
    fetchApi<any>('/settings/closures', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteClosure: (id: string) =>
    fetchApi<any>(`/settings/closures/${id}`, {
      method: 'DELETE'
    }),
  getEmployeeAvailability: (employeeId: string) =>
    fetchApi<any[]>(`/settings/availability/${employeeId}`),
  updateEmployeeAvailability: (employeeId: string, availabilities: { dayOfWeek: string; startTime: string; endTime: string }[]) =>
    fetchApi<any[]>(`/settings/availability/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify({ availabilities })
    }),
};

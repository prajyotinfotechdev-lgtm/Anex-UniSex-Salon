import { fetchApi } from '@/lib/api-client';

export interface Branch {
  id: string;
  organizationId: string;
  branchCode: string | null;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  managerId: string | null;
  timeZone: string;
  isDefault: boolean;
  version: number;
  posCounters: number;
  cashDrawers: number;
  rooms: number;
  chairs: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
  };
}

export interface WorkingHour {
  id?: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface Holiday {
  id: string;
  date: string;
  title: string;
  recurring: boolean;
  fullDay: boolean;
  startTime: string | null;
  endTime: string | null;
}

export interface BranchDetails extends Branch {
  workingHours: WorkingHour[];
  holidays: Holiday[];
}

export const BranchApi = {
  list: () => fetchApi<Branch[]>('/branches'),
  get: (id: string) => fetchApi<BranchDetails>(`/branches/${id}`),
  create: (data: Partial<Branch>) => fetchApi<Branch>('/branches', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Branch> & { version: number }) => 
    fetchApi<Branch>(`/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/branches/${id}`, { method: 'DELETE' }),

  upsertWorkingHours: (branchId: string, hours: WorkingHour[]) =>
    fetchApi<WorkingHour[]>(`/branches/${branchId}/working-hours`, { method: 'PUT', body: JSON.stringify({ hours }) }),

  createHoliday: (branchId: string, data: Omit<Holiday, 'id'>) =>
    fetchApi<Holiday>(`/branches/${branchId}/holidays`, { method: 'POST', body: JSON.stringify(data) }),
  deleteHoliday: (branchId: string, holidayId: string) =>
    fetchApi(`/branches/${branchId}/holidays/${holidayId}`, { method: 'DELETE' }),
};

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  dashboard: {
    summary: (branchId?: string) => ['dashboard', 'summary', branchId] as const,
    revenue: (filters: Record<string, any>) => ['dashboard', 'revenue', filters] as const,
  },
  customers: {
    all: (filters?: Record<string, any>) => ['customers', filters] as const,
    detail: (id: string) => ['customers', id] as const,
  },
  employees: {
    all: (filters?: Record<string, any>) => ['employees', filters] as const,
    detail: (id: string) => ['employees', id] as const,
  },
  services: {
    all: (filters?: Record<string, any>) => ['services', filters] as const,
  },
  appointments: {
    all: (filters?: Record<string, any>) => ['appointments', filters] as const,
  }
};

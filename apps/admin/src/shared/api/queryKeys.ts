export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  dashboard: {
    summary: (branchId?: string) => ['dashboard', 'summary', branchId] as const,
    revenue: (filters: unknown) => ['dashboard', 'revenue', filters] as const,
  },
  customers: {
    all: (filters?: unknown) => ['customers', filters] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
    appointments: (id: string) => ['customers', 'appointments', id] as const,
    invoices: (id: string) => ['customers', 'invoices', id] as const,
    stats: (id: string) => ['customers', 'stats', id] as const,
  },
  employees: {
    all: (filters?: unknown) => ['employees', filters] as const,
    detail: (id: string) => ['employees', id] as const,
  },
  services: {
    all: (filters?: unknown) => ['services', filters] as const,
    detail: (id: string) => ['services', id] as const,
  },
  serviceCategories: {
    all: () => ['service-categories'] as const,
  },
  appointments: {
    all: (filters?: unknown) => ['appointments', filters] as const,
    detail: (id: string) => ['appointments', id] as const,
  },
  branches: {
    all: () => ['branches'] as const,
  },
  invoices: {
    all: (filters?: unknown) => ['invoices', filters] as const,
    detail: (id: string) => ['invoices', id] as const,
  },
  payments: {
    all: (filters?: unknown) => ['payments', filters] as const,
  },
};

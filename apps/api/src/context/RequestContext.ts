import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
  organizationId: string;
  userId: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
}

export const RequestContext = new AsyncLocalStorage<RequestContextData>();

export function getTenantContext(): RequestContextData {
  const context = RequestContext.getStore();
  if (!context) {
    throw new Error('No tenant context found. Ensure this is called within a request lifecycle.');
  }
  return context;
}

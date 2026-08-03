import { MemoryCacheProvider } from './MemoryCacheProvider';
import { EventBus, DomainEvents } from '../events/EventBus';

export const CacheService = new MemoryCacheProvider();

// Helper to build consistent keys
export const CacheKeys = {
  organizationProfile: (orgId: string) => `org:${orgId}:profile`,
  organizationModules: (orgId: string) => `org:${orgId}:modules`,
  branchDetails: (branchId: string) => `branch:${branchId}`,
  branchWorkingHours: (branchId: string) => `branch:${branchId}:hours`,
};

// Event Listeners for Cache Invalidation
EventBus.on(DomainEvents.ORGANIZATION_UPDATED, ({ organizationId }) => {
  CacheService.delete(CacheKeys.organizationProfile(organizationId));
});

EventBus.on(DomainEvents.MODULE_TOGGLED, ({ organizationId }) => {
  CacheService.delete(CacheKeys.organizationModules(organizationId));
});

EventBus.on(DomainEvents.BRANCH_UPDATED, ({ branchId }) => {
  CacheService.delete(CacheKeys.branchDetails(branchId));
  CacheService.delete(CacheKeys.branchWorkingHours(branchId));
});

EventBus.on(DomainEvents.BRANCH_DELETED, ({ branchId }) => {
  CacheService.delete(CacheKeys.branchDetails(branchId));
  CacheService.delete(CacheKeys.branchWorkingHours(branchId));
});

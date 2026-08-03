import { EventEmitter } from 'events';

export const DomainEvents = {
  ORGANIZATION_UPDATED: 'ORGANIZATION_UPDATED',
  BRANCH_CREATED: 'BRANCH_CREATED',
  BRANCH_UPDATED: 'BRANCH_UPDATED',
  BRANCH_DELETED: 'BRANCH_DELETED',
  TAX_GROUP_CREATED: 'TAX_GROUP_CREATED',
  TAX_GROUP_UPDATED: 'TAX_GROUP_UPDATED',
  BRANDING_UPDATED: 'BRANDING_UPDATED',
  INVOICE_CONFIG_UPDATED: 'INVOICE_CONFIG_UPDATED',
  MODULE_TOGGLED: 'MODULE_TOGGLED'
} as const;

export type DomainEvent = typeof DomainEvents[keyof typeof DomainEvents];

class EventBusService extends EventEmitter {
  constructor() {
    super();
    // Max listeners can be increased if many modules subscribe
    this.setMaxListeners(20);
  }

  publish(event: DomainEvent, payload: any) {
    this.emit(event, payload);
  }
}

export const EventBus = new EventBusService();

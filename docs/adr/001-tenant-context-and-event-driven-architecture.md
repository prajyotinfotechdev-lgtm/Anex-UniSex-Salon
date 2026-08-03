# ADR 001: Settings Service, Tenant Context, and Event-Driven Architecture

## Status
Accepted

## Context
The ANEX Salon OS handles configuration for potentially multiple branches and modules. Initially, settings were stored in a generic `BusinessSetting` JSON blob. This anti-pattern prevents strict typing, validation, and historical auditing. Furthermore, reading configurations directly from the database on every request introduces a performance bottleneck. Finally, different layers of the application need to react to configuration changes (e.g., refreshing a cache, emitting webhooks) without creating tight coupling.

## Decision
1. **Strictly Typed Relational Settings**: We will migrate away from generic JSON blobs and instead use strictly typed tables for critical configuration (e.g., `TaxGroup`, `BrandingConfiguration`, `InvoiceConfiguration`).
2. **Settings Service Layer**: Business logic for modifying settings is centralized in a `SettingsService`. Controllers will not interact with Prisma directly for configuration updates.
3. **Tenant Context**: The `organizationId` will be resolved at the middleware level (from the authenticated user's session) and injected into a Context object passed to services, mitigating the risk of cross-tenant data leakage.
4. **Optimistic Concurrency**: Core tables include a `version` field. Updates must include the expected version to prevent "last write wins" overwriting anomalies between concurrent admins.
5. **Event-Driven Side Effects**: A domain event catalogue (`OrganizationUpdated`, `TaxGroupCreated`, etc.) is published to an `EventBus`.
6. **Configuration Caching**: Settings are cached in-memory (or Redis). The cache is invalidated strictly by listening to the `EventBus` for relevant domain events, entirely decoupling caching from the core update logic.

## Consequences
- **Positive**: High data integrity, extremely fast read times for configuration, scalable SaaS architecture, robust audit trails.
- **Negative**: Increased complexity in the backend layer (EventBus, CacheServices, TenantContext logic). Developers must remember to publish events and bump versions when extending the system.

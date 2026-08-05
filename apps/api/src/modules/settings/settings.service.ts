import { BaseService } from '../../services/BaseService';
import { prisma } from '../../database/prisma.client';
import { getTenantContext } from '../../context/RequestContext';
import { EventBus, DomainEvents } from '../../events/EventBus';
import { ConflictError, NotFoundError } from '../../errors/AppErrors';
import { AuditService } from '../../services/AuditService';
import { ActionType } from '@anex/database';
import { UpdateModuleDto, UpdateBrandingDto, UpdateInvoiceConfigDto } from './settings.dto';

export class SettingsService extends BaseService {
  private async auditLogHistory(
    organizationId: string,
    moduleName: string,
    field: string,
    oldValue: any,
    newValue: any,
    userId: string
  ) {
    // 1. Audit Table for historical rollbacks (OrganizationSettingHistory)
    await prisma.organizationSettingHistory.create({
      data: {
        organizationId,
        module: moduleName,
        field,
        oldValue: oldValue ? oldValue : {},
        newValue: newValue ? newValue : {},
        changedBy: userId,
      }
    });

    // 2. Standard AuditService log
    await AuditService.log({
      organizationId,
      userId,
      action: ActionType.UPDATE,
      entityName: 'Settings',
      entityId: `${moduleName}_${field}`,
      oldValue,
      newValue
    });
  }

  // --- MODULES ---
  async listOrganizationModules() {
    const { organizationId } = getTenantContext();
    return prisma.organizationModule.findMany({
      where: { organizationId },
      include: { module: true }
    });
  }

  async updateOrganizationModule(moduleId: string, data: UpdateModuleDto) {
    const { organizationId, userId } = getTenantContext();

    const existing = await prisma.organizationModule.findUnique({
      where: { organizationId_moduleId: { organizationId, moduleId } }
    });

    if (!existing) throw new NotFoundError('Module not found for organization');
    if (existing.version !== data.version) throw new ConflictError('Module has been updated by another user');

    const updated = await prisma.organizationModule.update({
      where: { organizationId_moduleId: { organizationId, moduleId } },
      data: {
        enabled: data.enabled,
        plan: data.plan !== undefined ? data.plan : existing.plan,
        version: { increment: 1 }
      }
    });

    await this.auditLogHistory(organizationId, 'Modules', moduleId, existing, updated, userId);
    EventBus.publish(DomainEvents.MODULE_TOGGLED, { organizationId, moduleId, enabled: data.enabled });

    return updated;
  }

  // --- BRANDING ---
  async getBranding() {
    const { organizationId } = getTenantContext();
    let branding = await prisma.brandingConfiguration.findUnique({
      where: { organizationId }
    });
    if (!branding) {
       branding = await prisma.brandingConfiguration.create({
         data: { organizationId, designTokens: {} }
       });
    }
    return branding;
  }

  async updateBranding(data: UpdateBrandingDto) {
    const { organizationId, userId } = getTenantContext();

    const existing = await prisma.brandingConfiguration.findUnique({
      where: { organizationId }
    });

    if (!existing) throw new NotFoundError('Branding not found');
    if (existing.version !== data.version) throw new ConflictError('Branding has been updated by another user');

    const updated = await prisma.brandingConfiguration.update({
      where: { organizationId },
      data: {
        designTokens: data.designTokens,
        version: { increment: 1 }
      }
    });

    await this.auditLogHistory(organizationId, 'Branding', 'designTokens', existing.designTokens, updated.designTokens, userId);
    EventBus.publish(DomainEvents.BRANDING_UPDATED, { organizationId });

    return updated;
  }

  // --- INVOICE CONFIG ---
  async getInvoiceConfig() {
    const { organizationId } = getTenantContext();
    let config = await prisma.invoiceConfiguration.findUnique({
      where: { organizationId }
    });
    if (!config) {
       config = await prisma.invoiceConfiguration.create({
         data: { organizationId }
       });
    }
    return config;
  }

  async updateInvoiceConfig(data: UpdateInvoiceConfigDto) {
    const { organizationId, userId } = getTenantContext();

    const existing = await prisma.invoiceConfiguration.findUnique({
      where: { organizationId }
    });

    if (!existing) throw new NotFoundError('Invoice Config not found');
    if (existing.version !== data.version) throw new ConflictError('Invoice Config has been updated by another user');

    // Remove version from the update payload
    const { version, ...updateFields } = data;

    const updated = await prisma.invoiceConfiguration.update({
      where: { organizationId },
      data: {
        ...updateFields,
        version: { increment: 1 }
      }
    });

    await this.auditLogHistory(organizationId, 'InvoiceConfig', 'all', existing, updated, userId);
    EventBus.publish(DomainEvents.INVOICE_CONFIG_UPDATED, { organizationId });

    return updated;
  }
  // --- TAX GROUPS ---
  async listTaxGroups() {
    const { organizationId } = getTenantContext();
    return prisma.taxGroup.findMany({
      where: { organizationId, deletedAt: null },
      include: { rates: true }
    });
  }

  async createTaxGroup(data: { name: string, description?: string, isInclusive: boolean, isActive?: boolean }) {
    const { organizationId, userId } = getTenantContext();
    const group = await prisma.taxGroup.create({
      data: {
        organizationId,
        ...data
      }
    });
    EventBus.publish(DomainEvents.TAX_GROUP_CREATED, { organizationId, taxGroupId: group.id });
    return group;
  }

  async updateTaxGroup(taxGroupId: string, data: { version: number, name?: string, description?: string, isInclusive?: boolean, isActive?: boolean }) {
    const { organizationId, userId } = getTenantContext();
    const existing = await prisma.taxGroup.findUnique({ where: { id: taxGroupId } });
    if (!existing || existing.organizationId !== organizationId || existing.deletedAt !== null) {
      throw new NotFoundError('Tax Group not found');
    }
    if (existing.version !== data.version) throw new ConflictError('Tax Group has been updated by another user');

    const { version, ...updateFields } = data;
    const updated = await prisma.taxGroup.update({
      where: { id: taxGroupId },
      data: { ...updateFields, version: { increment: 1 } }
    });
    EventBus.publish(DomainEvents.TAX_GROUP_UPDATED, { organizationId, taxGroupId });
    return updated;
  }

  async deleteTaxGroup(taxGroupId: string) {
    const { organizationId, userId } = getTenantContext();
    const existing = await prisma.taxGroup.findUnique({ where: { id: taxGroupId } });
    if (!existing || existing.organizationId !== organizationId || existing.deletedAt !== null) {
      throw new NotFoundError('Tax Group not found');
    }

    await prisma.taxGroup.update({
      where: { id: taxGroupId },
      data: { deletedAt: new Date() }
    });
    // Can optionally emit event here
  }

  // --- CLOSURES & WORKING HOURS ---
  async listClosures() {
    const { organizationId } = getTenantContext();
    const branch = await prisma.branch.findFirst({ where: { organizationId } });
    if (!branch) return [];

    return prisma.calendarException.findMany({
      where: { branchId: branch.id },
      orderBy: { date: 'asc' }
    });
  }

  async createClosure(data: { date: string; reason?: string; isClosed: boolean; startTime?: string; endTime?: string }) {
    const { organizationId } = getTenantContext();
    const branch = await prisma.branch.findFirst({ where: { organizationId } });
    if (!branch) throw new NotFoundError('Branch not found');

    return prisma.calendarException.create({
      data: {
        branchId: branch.id,
        date: new Date(data.date),
        isClosed: data.isClosed ?? true,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        reason: data.reason || null
      }
    });
  }

  async deleteClosure(closureId: string) {
    const { organizationId } = getTenantContext();
    const branch = await prisma.branch.findFirst({ where: { organizationId } });
    if (!branch) throw new NotFoundError('Branch not found');

    const existing = await prisma.calendarException.findFirst({
      where: { id: closureId, branchId: branch.id }
    });
    if (!existing) throw new NotFoundError('Closure exception not found');

    await prisma.calendarException.delete({
      where: { id: closureId }
    });
  }

  async getEmployeeAvailability(employeeId: string) {
    const { organizationId } = getTenantContext();
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId }
    });
    if (!employee) throw new NotFoundError('Employee not found');

    return prisma.employeeAvailability.findMany({
      where: { employeeId },
      orderBy: { dayOfWeek: 'asc' }
    });
  }

  async updateEmployeeAvailability(employeeId: string, availabilities: { dayOfWeek: string; startTime: string; endTime: string }[]) {
    const { organizationId } = getTenantContext();
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId }
    });
    if (!employee) throw new NotFoundError('Employee not found');

    // Delete existing availability for employee to write clean
    await prisma.employeeAvailability.deleteMany({
      where: { employeeId }
    });

    // Create new ones
    const created = await Promise.all(
      availabilities.map(a =>
        prisma.employeeAvailability.create({
          data: {
            employeeId,
            dayOfWeek: a.dayOfWeek as any,
            startTime: a.startTime,
            endTime: a.endTime
          }
        })
      )
    );

    return created;
  }

  // --- AUDS ---
  async getAuditLogs(organizationId: string) {
    return prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });
  }
}

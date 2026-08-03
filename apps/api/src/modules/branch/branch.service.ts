import { BaseService } from '../../services/BaseService';
import { prisma } from '../../database/prisma.client';
import { getTenantContext } from '../../context/RequestContext';
import { ConflictError, NotFoundError, ValidationError } from '../../errors/AppErrors';
import { AuditService } from '../../services/AuditService';
import { ActionType } from '@anex/database';
import {
  CreateBranchDto,
  UpdateBranchDto,
  UpsertWorkingHoursDto,
  CreateHolidayDto,
  UpdateHolidayDto
} from './branch.dto';

// Helper to reliably parse "HH:mm:ss" or "HH:mm" into a Prisma @db.Time compatible Date (1970-01-01 UTC)
function parseTimeString(timeStr?: string | null): Date | null {
  if (!timeStr) return null;
  // If it's already an ISO string containing 'T', try extracting just the time
  if (timeStr.includes('T')) {
    const match = timeStr.match(/T(\d{2}:\d{2}(:\d{2})?)/);
    if (match) timeStr = match[1];
  }
  // Pad seconds if missing
  if (timeStr.split(':').length === 2) {
    timeStr += ':00';
  }
  return new Date(`1970-01-01T${timeStr}Z`);
}

export class BranchService extends BaseService {
  // --- BRANCHES ---

  async listBranches() {
    const { organizationId } = getTenantContext();
    return prisma.branch.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { isDefault: 'desc' },
      include: {
        _count: {
          select: { employees: true }
        }
      }
    });
  }

  async getBranch(branchId: string) {
    const { organizationId } = getTenantContext();
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        workingHours: true,
        holidays: {
          where: { date: { gte: new Date() } },
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!branch || branch.organizationId !== organizationId || branch.deletedAt !== null) {
      throw new NotFoundError('Branch not found');
    }
    return branch;
  }

  async createBranch(data: CreateBranchDto) {
    const { organizationId, userId } = getTenantContext();

    // If this is the first branch, make it default automatically
    const existingCount = await prisma.branch.count({
      where: { organizationId, deletedAt: null }
    });

    const isDefault = existingCount === 0 ? true : data.isDefault;

    // If setting as default, unset others (transaction handled at a higher level or here)
    if (isDefault && existingCount > 0) {
      await prisma.branch.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false, version: { increment: 1 } }
      });
    }

    const branch = await prisma.branch.create({
      data: {
        organizationId,
        ...data,
        isDefault
      }
    });

    await AuditService.log({
      organizationId,
      userId,
      action: ActionType.CREATE,
      entityName: 'Branch',
      entityId: branch.id,
      newValue: branch
    });

    return branch;
  }

  async updateBranch(branchId: string, data: UpdateBranchDto) {
    const { organizationId, userId } = getTenantContext();
    
    const existing = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!existing || existing.organizationId !== organizationId || existing.deletedAt !== null) {
      throw new NotFoundError('Branch not found');
    }
    if (existing.version !== data.version) {
      throw new ConflictError('Branch has been updated by another user');
    }

    const { version, ...updateFields } = data;

    if (updateFields.isDefault && !existing.isDefault) {
      await prisma.branch.updateMany({
        where: { organizationId, isDefault: true, id: { not: branchId } },
        data: { isDefault: false, version: { increment: 1 } }
      });
    } else if (updateFields.isDefault === false && existing.isDefault) {
      // Prevent unsetting default if it's the only default
      const defaultCount = await prisma.branch.count({
        where: { organizationId, isDefault: true, deletedAt: null }
      });
      if (defaultCount === 1) {
        throw new ValidationError('Organization must have at least one default branch');
      }
    }

    const updated = await prisma.branch.update({
      where: { id: branchId },
      data: { ...updateFields, version: { increment: 1 } }
    });

    await AuditService.log({
      organizationId,
      userId,
      action: ActionType.UPDATE,
      entityName: 'Branch',
      entityId: branchId,
      oldValue: existing,
      newValue: updated
    });

    return updated;
  }

  async deleteBranch(branchId: string) {
    const { organizationId, userId } = getTenantContext();
    
    const existing = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!existing || existing.organizationId !== organizationId || existing.deletedAt !== null) {
      throw new NotFoundError('Branch not found');
    }

    if (existing.isDefault) {
      throw new ValidationError('Cannot delete the default branch. Assign another branch as default first.');
    }

    await prisma.branch.update({
      where: { id: branchId },
      data: { deletedAt: new Date() }
    });

    await AuditService.log({
      organizationId,
      userId,
      action: ActionType.DELETE,
      entityName: 'Branch',
      entityId: branchId
    });
  }

  // --- WORKING HOURS ---

  async upsertWorkingHours(branchId: string, data: UpsertWorkingHoursDto) {
    const { organizationId, userId } = getTenantContext();

    // Verify branch belongs to tenant
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch || branch.organizationId !== organizationId) throw new NotFoundError('Branch not found');

    const ops = data.hours.map(hour => {
      const open = parseTimeString(hour.openTime);
      const close = parseTimeString(hour.closeTime);

      if (hour.isOpen && open && close && open >= close) {
        throw new ValidationError(`Open time must be before close time for ${hour.dayOfWeek}`);
      }

      return prisma.branchWorkingHour.upsert({
        where: { branchId_dayOfWeek: { branchId, dayOfWeek: hour.dayOfWeek as any } },
        create: {
          branchId,
          dayOfWeek: hour.dayOfWeek as any,
          isOpen: hour.isOpen,
          openTime: open,
          closeTime: close
        },
        update: {
          isOpen: hour.isOpen,
          openTime: open,
          closeTime: close
        }
      });
    });

    await prisma.$transaction(ops);

    await AuditService.log({
      organizationId,
      userId,
      action: ActionType.UPDATE,
      entityName: 'BranchWorkingHour',
      entityId: branchId,
      newValue: data.hours
    });

    return prisma.branchWorkingHour.findMany({ where: { branchId } });
  }

  // --- HOLIDAYS ---

  async createHoliday(branchId: string, data: CreateHolidayDto) {
    const { organizationId, userId } = getTenantContext();
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch || branch.organizationId !== organizationId) throw new NotFoundError('Branch not found');

    const holiday = await prisma.holiday.create({
      data: {
        branchId,
        date: new Date(data.date),
        title: data.title,
        recurring: data.recurring,
        fullDay: data.fullDay,
        startTime: parseTimeString(data.startTime),
        endTime: parseTimeString(data.endTime)
      }
    });

    await AuditService.log({
      organizationId,
      userId,
      action: ActionType.CREATE,
      entityName: 'Holiday',
      entityId: holiday.id,
      newValue: holiday
    });

    return holiday;
  }

  async deleteHoliday(branchId: string, holidayId: string) {
    const { organizationId, userId } = getTenantContext();
    const holiday = await prisma.holiday.findUnique({ where: { id: holidayId } });
    if (!holiday || holiday.branchId !== branchId) throw new NotFoundError('Holiday not found');

    // Tenant check implicit through branchId -> branch relation
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch || branch.organizationId !== organizationId) throw new NotFoundError('Holiday not found');

    await prisma.holiday.delete({ where: { id: holidayId } });

    await AuditService.log({
      organizationId,
      userId,
      action: ActionType.DELETE,
      entityName: 'Holiday',
      entityId: holidayId
    });
  }
}

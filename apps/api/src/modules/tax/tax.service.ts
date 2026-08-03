import { prisma } from '../../database/prisma.client';
import { getTenantContext } from '../../context/RequestContext';
import { NotFoundError, ValidationError, ConflictError } from '../../errors/AppErrors';
import { AuditService } from '../../services/AuditService';
import { ActionType } from '@anex/database';
import { CreateTaxCategoryDtoType, UpdateTaxCategoryDtoType } from './tax.dto';

export class TaxService {
  async getTaxCategories() {
    const { organizationId } = getTenantContext();
    return prisma.taxCategory.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { isDefault: 'desc' },
      include: {
        taxRates: {
          orderBy: { priority: 'asc' }
        },
        _count: {
          select: { services: true, products: true }
        }
      }
    });
  }

  async getTaxCategory(taxCategoryId: string) {
    const { organizationId } = getTenantContext();
    const category = await prisma.taxCategory.findFirst({
      where: { id: taxCategoryId, organizationId, deletedAt: null },
      include: {
        taxRates: {
          orderBy: { priority: 'asc' }
        }
      }
    });

    if (!category) throw new NotFoundError('Tax category not found');
    return category;
  }

  async createTaxCategory(data: CreateTaxCategoryDtoType) {
    const { organizationId, userId } = getTenantContext();
    
    // Check if duplicate name
    const existing = await prisma.taxCategory.findFirst({
      where: { organizationId, name: data.name, deletedAt: null }
    });
    if (existing) throw new ConflictError('Tax category with this name already exists');

    const existingCount = await prisma.taxCategory.count({
      where: { organizationId, deletedAt: null }
    });

    const isDefault = existingCount === 0 ? true : data.isDefault;

    // Start Transaction
    const category = await prisma.$transaction(async (tx) => {
      if (isDefault && existingCount > 0) {
        await tx.taxCategory.updateMany({
          where: { organizationId, isDefault: true },
          data: { isDefault: false }
        });
      }

      return tx.taxCategory.create({
        data: {
          organizationId,
          name: data.name,
          description: data.description,
          isActive: data.isActive,
          isDefault,
          taxRates: {
            create: data.rates.map(rate => ({
              name: rate.name,
              rate: rate.rate,
              type: rate.type,
              priority: rate.priority
            }))
          }
        },
        include: { taxRates: true }
      });
    });

    await AuditService.log({
      organizationId,
      userId,
      action: ActionType.CREATE,
      entityName: 'TaxCategory',
      entityId: category.id,
      newValue: category
    });

    return category;
  }

  async updateTaxCategory(taxCategoryId: string, data: UpdateTaxCategoryDtoType) {
    const { organizationId, userId } = getTenantContext();

    const existing = await prisma.taxCategory.findFirst({
      where: { id: taxCategoryId, organizationId, deletedAt: null }
    });
    if (!existing) throw new NotFoundError('Tax category not found');

    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.taxCategory.findFirst({
        where: { organizationId, name: data.name, deletedAt: null, id: { not: taxCategoryId } }
      });
      if (duplicate) throw new ConflictError('Tax category with this name already exists');
    }

    const category = await prisma.$transaction(async (tx) => {
      if (data.isDefault && !existing.isDefault) {
        await tx.taxCategory.updateMany({
          where: { organizationId, isDefault: true, id: { not: taxCategoryId } },
          data: { isDefault: false }
        });
      } else if (data.isDefault === false && existing.isDefault) {
        const defaultCount = await tx.taxCategory.count({
          where: { organizationId, isDefault: true, deletedAt: null }
        });
        if (defaultCount === 1) {
          throw new ValidationError('Organization must have at least one default tax category');
        }
      }

      // Update basic fields
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

      // Handle rates update (delete existing and recreate)
      if (data.rates) {
        await tx.taxRate.deleteMany({
          where: { taxCategoryId }
        });
        
        updateData.taxRates = {
          create: data.rates.map(rate => ({
            name: rate.name,
            rate: rate.rate,
            type: rate.type,
            priority: rate.priority
          }))
        };
      }

      return tx.taxCategory.update({
        where: { id: taxCategoryId },
        data: updateData,
        include: { taxRates: true }
      });
    });

    await AuditService.log({
      organizationId,
      userId,
      action: ActionType.UPDATE,
      entityName: 'TaxCategory',
      entityId: category.id,
      oldValue: existing,
      newValue: category
    });

    return category;
  }

  async deleteTaxCategory(taxCategoryId: string) {
    const { organizationId, userId } = getTenantContext();

    const existing = await prisma.taxCategory.findFirst({
      where: { id: taxCategoryId, organizationId, deletedAt: null },
      include: {
        _count: {
          select: { services: true, products: true }
        }
      }
    });

    if (!existing) throw new NotFoundError('Tax category not found');
    if (existing.isDefault) {
      throw new ValidationError('Cannot delete the default tax category. Assign another category as default first.');
    }
    if (existing._count.services > 0 || existing._count.products > 0) {
      throw new ValidationError('Cannot delete a tax category that is assigned to services or products.');
    }

    await prisma.taxCategory.update({
      where: { id: taxCategoryId },
      data: { deletedAt: new Date() }
    });

    await AuditService.log({
      organizationId,
      userId,
      action: ActionType.DELETE,
      entityName: 'TaxCategory',
      entityId: taxCategoryId,
      oldValue: existing
    });

    return { success: true };
  }
}

export const taxService = new TaxService();

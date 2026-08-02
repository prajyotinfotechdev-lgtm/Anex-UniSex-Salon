import { Prisma, Service } from '@anex/database';
import { BaseRepository } from '../../repositories/BaseRepository';
import { PricingType } from '@anex/database';

export class ServiceRepository extends BaseRepository<Service, Prisma.ServiceCreateInput, Prisma.ServiceUpdateInput> {
  async findById(id: string): Promise<Service | null> {
    return this.db.service.findUnique({
      where: { id },
    });
  }

  async findByIdWithDetails(id: string, organizationId: string): Promise<Service | null> {
    return this.db.service.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        serviceCategory: true,
        employeeServices: true,
        serviceBranches: true,
      },
    });
  }

  async findMany(params: Prisma.ServiceFindManyArgs): Promise<Service[]> {
    return this.db.service.findMany(params);
  }

  async findByName(name: string, organizationId: string): Promise<Service | null> {
    return this.db.service.findFirst({
      where: { name, organizationId, deletedAt: null },
    });
  }

  async search(
    organizationId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
      employeeId?: string;
      branchId?: string;
      isActive?: boolean;
      pricingType?: PricingType;
      minPrice?: number;
      maxPrice?: number;
      minDuration?: number;
      maxDuration?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      employeeId,
      branchId,
      isActive,
      pricingType,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.ServiceWhereInput = {
      organizationId,
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(categoryId && { serviceCategoryId: categoryId }),
      ...(pricingType && { pricingType }),
      ...(employeeId && { employeeServices: { some: { employeeId } } }),
      ...(branchId && { serviceBranches: { some: { branchId } } }),
      ...(minPrice !== undefined || maxPrice !== undefined ? {
        basePrice: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        }
      } : {}),
      ...(minDuration !== undefined || maxDuration !== undefined ? {
        durationMinutes: {
          ...(minDuration !== undefined && { gte: minDuration }),
          ...(maxDuration !== undefined && { lte: maxDuration }),
        }
      } : {}),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.db.service.count({ where }),
      this.db.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { serviceCategory: true },
      }),
    ]);

    return { total, page, limit, data };
  }

  async create(data: Prisma.ServiceCreateInput): Promise<Service> {
    return this.db.service.create({
      data,
      include: { serviceCategory: true, employeeServices: true, serviceBranches: true },
    });
  }

  async update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return this.db.service.update({
      where: { id },
      data,
      include: { serviceCategory: true, employeeServices: true, serviceBranches: true },
    });
  }

  async delete(id: string): Promise<Service> {
    return this.db.service.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<Service> {
    return this.update(id, { deletedAt: new Date(), isActive: false });
  }

  async checkCategoryExists(categoryId: string, organizationId: string) {
    return this.db.serviceCategory.findFirst({
      where: { id: categoryId, organizationId, isActive: true, deletedAt: null },
    });
  }

  async checkEmployeesExist(employeeIds: string[], organizationId: string) {
    return this.db.employee.findMany({
      where: {
        id: { in: employeeIds },
        organizationId,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async checkBranchesExist(branchIds: string[], organizationId: string) {
    return this.db.branch.findMany({
      where: {
        id: { in: branchIds },
        organizationId,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async setEmployees(serviceId: string, employeeIds: string[]) {
    await this.db.employeeService.deleteMany({
      where: { serviceId },
    });

    if (employeeIds.length > 0) {
      await this.db.employeeService.createMany({
        data: employeeIds.map(employeeId => ({
          serviceId,
          employeeId,
        })),
        skipDuplicates: true,
      });
    }
  }

  async setBranches(serviceId: string, branches: { branchId: string; price: number }[]) {
    await this.db.serviceBranch.deleteMany({
      where: { serviceId },
    });

    if (branches.length > 0) {
      await this.db.serviceBranch.createMany({
        data: branches.map(branch => ({
          serviceId,
          branchId: branch.branchId,
          price: branch.price,
        })),
        skipDuplicates: true,
      });
    }
  }
}

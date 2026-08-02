import { PrismaClient } from '@anex/database';
import { prisma as defaultPrisma } from '../../database/prisma.client';
import { SearchCategoriesQueryDto } from './service-category.dto';

export class ServiceCategoryRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaClient: PrismaClient = defaultPrisma) {
    this.prisma = prismaClient;
  }

  async listCategories(
    organizationId: string,
    params: SearchCategoriesQueryDto
  ) {
    const { page = 1, limit = 10, search, isActive } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [total, categories] = await Promise.all([
      this.prisma.serviceCategory.count({ where }),
      this.prisma.serviceCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
        },
      }),
    ]);

    return { total, categories };
  }
}

export const serviceCategoryRepository = new ServiceCategoryRepository();

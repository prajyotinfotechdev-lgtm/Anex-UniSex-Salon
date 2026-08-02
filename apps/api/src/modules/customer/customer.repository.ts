import { Prisma, Customer } from '@anex/database';
import { BaseRepository } from '../../repositories/BaseRepository';

export class CustomerRepository extends BaseRepository<Customer, Prisma.CustomerCreateInput, Prisma.CustomerUpdateInput> {
  async findById(id: string): Promise<Customer | null> {
    return this.db.customer.findUnique({
      where: { id },
    });
  }

  async findByIdWithHistory(id: string, organizationId: string): Promise<Customer | null> {
    return this.db.customer.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        tags: true,
        appointments: true,
        invoices: true,
        memberships: true,
        packages: true,
        walletTransactions: true,
        loyaltyTransactions: true,
      },
    });
  }

  async findMany(params: Prisma.CustomerFindManyArgs): Promise<Customer[]> {
    return this.db.customer.findMany(params);
  }

  async findByEmail(email: string, organizationId: string): Promise<Customer | null> {
    return this.db.customer.findFirst({
      where: { email, organizationId, deletedAt: null },
    });
  }

  async findByPhone(primaryPhone: string, organizationId: string): Promise<Customer | null> {
    return this.db.customer.findFirst({
      where: { primaryPhone, organizationId, deletedAt: null },
    });
  }

  async search(
    organizationId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      phone?: string;
      email?: string;
      gender?: string;
      isActive?: boolean;
      tagId?: string;
      createdAtFrom?: string;
      createdAtTo?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      phone,
      email,
      gender,
      isActive,
      tagId,
      createdAtFrom,
      createdAtTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;
    
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      organizationId,
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(gender && { gender: gender as any }),
      ...(phone && { primaryPhone: { contains: phone } }),
      ...(email && { email: { contains: email, mode: 'insensitive' } }),
      ...(tagId && { tags: { some: { tagId } } }),
      ...(createdAtFrom || createdAtTo ? {
        createdAt: {
          ...(createdAtFrom && { gte: new Date(createdAtFrom) }),
          ...(createdAtTo && { lte: new Date(createdAtTo) }),
        }
      } : {}),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { primaryPhone: { contains: search } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.db.customer.count({ where }),
      this.db.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { tags: true },
      }),
    ]);

    return { total, page, limit, data };
  }

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return this.db.customer.create({
      data,
      include: { tags: true },
    });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    return this.db.customer.update({
      where: { id },
      data,
      include: { tags: true },
    });
  }

  async delete(id: string): Promise<Customer> {
    return this.db.customer.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<Customer> {
    return this.update(id, { deletedAt: new Date(), isActive: false });
  }

  async checkTagsExist(tagIds: string[], organizationId: string) {
    return this.db.tag.findMany({
      where: {
        id: { in: tagIds },
        organizationId,
      },
    });
  }

  async setTags(customerId: string, tagIds: string[]) {
    await this.db.customerTag.deleteMany({
      where: { customerId },
    });

    if (tagIds.length > 0) {
      await this.db.customerTag.createMany({
        data: tagIds.map((tagId) => ({
          customerId,
          tagId,
        })),
        skipDuplicates: true,
      });
    }
  }
}

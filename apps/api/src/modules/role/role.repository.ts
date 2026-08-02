import { Prisma, Role } from '@anex/database';
import { BaseRepository } from '../../repositories/BaseRepository';

export class RoleRepository extends BaseRepository<Role, Prisma.RoleCreateInput, Prisma.RoleUpdateInput> {
  async findById(id: string): Promise<Role | null> {
    return this.db.role.findUnique({
      where: { id },
    });
  }

  async findMany(params: { organizationId: string; isActive?: boolean }): Promise<Role[]> {
    const { organizationId, isActive } = params;
    return this.db.role.findMany({
      where: {
        organizationId,
        ...(isActive !== undefined && { isActive }),
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async create(data: Prisma.RoleCreateInput): Promise<Role> {
    return this.db.role.create({
      data,
    });
  }

  async update(id: string, data: Prisma.RoleUpdateInput): Promise<Role> {
    return this.db.role.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Role> {
    return this.db.role.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<Role> {
    return this.db.role.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}

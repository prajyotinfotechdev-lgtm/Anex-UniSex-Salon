import { Prisma, User } from '@prisma/client';
import { BaseRepository } from '../../repositories/BaseRepository';

export class AuthRepository extends BaseRepository<User, Prisma.UserCreateInput, Prisma.UserUpdateInput> {
  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async findMany(params: any): Promise<User[]> {
    return this.db.user.findMany(params);
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.db.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.db.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User> {
    return this.db.user.delete({ where: { id } });
  }

  async softDelete(id: string): Promise<User> {
    return this.update(id, { deletedAt: new Date(), isActive: false });
  }

  async findUserForAuth(email: string) {
    return this.db.user.findUnique({
      where: { email },
      include: {
        employee: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findUserByIdWithDetails(userId: string) {
    return this.db.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          include: {
            organization: true,
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    return this.db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}

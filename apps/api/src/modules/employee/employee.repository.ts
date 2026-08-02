import { Prisma, Employee } from '@anex/database';
import { BaseRepository } from '../../repositories/BaseRepository';

export class EmployeeRepository extends BaseRepository<Employee, Prisma.EmployeeCreateInput, Prisma.EmployeeUpdateInput> {

  async findById(id: string): Promise<Employee | null> {
    return this.db.employee.findUnique({
      where: { id },
      include: {
        employeeBranches: true,
      },
    });
  }

  async findByIdAndOrg(id: string, organizationId: string): Promise<Employee | null> {
    return this.db.employee.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        employeeBranches: true,
      },
    });
  }

  async findByEmail(email: string, organizationId: string): Promise<Employee | null> {
    return this.db.employee.findFirst({
      where: { email, organizationId, deletedAt: null },
    });
  }

  async findByPhone(phone: string, organizationId: string): Promise<Employee | null> {
    return this.db.employee.findFirst({
      where: { phone, organizationId, deletedAt: null },
    });
  }

  async findMany(params: Prisma.EmployeeFindManyArgs): Promise<Employee[]> {
    return this.db.employee.findMany(params);
  }

  async search(
    organizationId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      branchId?: string;
      roleId?: string;
      isActive?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const { page = 1, limit = 10, search, branchId, roleId, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {
      organizationId,
      deletedAt: null,
      ...(roleId && { roleId }),
      ...(isActive !== undefined && { isActive }),
      ...(branchId && {
        employeeBranches: {
          some: { branchId },
        },
      }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.db.employee.count({ where }),
      this.db.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { employeeBranches: true },
      }),
    ]);

    return { total, page, limit, data };
  }

  async create(data: Prisma.EmployeeCreateInput): Promise<Employee> {
    return this.db.employee.create({
      data,
      include: { employeeBranches: true },
    });
  }

  async update(id: string, data: Prisma.EmployeeUpdateInput): Promise<Employee> {
    return this.db.employee.update({
      where: { id },
      data,
      include: { employeeBranches: true },
    });
  }

  async delete(id: string): Promise<Employee> {
    return this.db.employee.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<Employee> {
    return this.update(id, { deletedAt: new Date(), isActive: false });
  }

  async checkUserLinked(userId: string, excludeEmployeeId?: string): Promise<Employee | null> {
    return this.db.employee.findFirst({
      where: {
        userId,
        ...(excludeEmployeeId && { id: { not: excludeEmployeeId } })
      },
    });
  }

  async checkUserExists(userId: string, organizationId: string) {
    return this.db.user.findFirst({
      where: { id: userId, organizationId, isActive: true },
    });
  }

  async checkRoleExists(roleId: string, organizationId: string) {
    return this.db.role.findFirst({
      where: { id: roleId, organizationId, isActive: true },
    });
  }

  async checkBranchesExist(branchIds: string[], organizationId: string) {
    const branches = await this.db.branch.findMany({
      where: {
        id: { in: branchIds },
        organizationId,
        isActive: true,
        deletedAt: null
      }
    });
    return branches;
  }

  async setBranches(employeeId: string, branches: { branchId: string; isPrimary: boolean }[]) {
    // Delete existing
    await this.db.employeeBranch.deleteMany({
      where: { employeeId },
    });

    // Create new
    if (branches.length > 0) {
      await this.db.employeeBranch.createMany({
        data: branches.map(b => ({
          employeeId,
          branchId: b.branchId,
          isPrimary: b.isPrimary
        }))
      });
    }
  }
}

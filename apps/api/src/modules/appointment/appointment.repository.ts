import { Prisma, Appointment, AppointmentStatus, AppointmentSource } from '@anex/database';
import { BaseRepository } from '../../repositories/BaseRepository';
import { prisma } from '../../database/prisma.client';

export class AppointmentRepository extends BaseRepository<Appointment, Prisma.AppointmentCreateInput, Prisma.AppointmentUpdateInput> {
  async findById(id: string): Promise<Appointment | null> {
    return this.db.appointment.findUnique({
      where: { id },
    });
  }

  async findByIdWithDetails(id: string, organizationId: string): Promise<Appointment | null> {
    return this.db.appointment.findFirst({
      where: { id, branch: { organizationId }, isActive: true, deletedAt: null },
      include: {
        customer: true,
        branch: true,
        items: {
          include: {
            service: true,
            employee: true,
          }
        },
        inspirationPost: {
          include: {
            heroMedia: true
          }
        }
      },
    });
  }

  async findMany(params: Prisma.AppointmentFindManyArgs): Promise<Appointment[]> {
    return this.db.appointment.findMany(params);
  }

  async search(
    organizationId: string,
    params: {
      page?: number;
      limit?: number;
      customerId?: string;
      employeeId?: string;
      branchId?: string;
      serviceId?: string;
      status?: AppointmentStatus;
      source?: AppointmentSource;
      dateFrom?: string;
      dateTo?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const {
      page = 1,
      limit = 10,
      customerId,
      employeeId,
      branchId,
      serviceId,
      status,
      source,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentWhereInput = {
      branch: { organizationId },
      deletedAt: null,
      ...(customerId && { customerId }),
      ...(branchId && { branchId }),
      ...(status ? { status } : { status: { not: 'PENDING' } }),
      ...(source && { source }),
      ...(dateFrom || dateTo ? {
        date: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        }
      } : {}),
      ...((employeeId || serviceId) && {
        items: {
          some: {
            ...(employeeId && { employeeId }),
            ...(serviceId && { serviceId }),
          }
        }
      })
    };

    const [total, data] = await Promise.all([
      this.db.appointment.count({ where }),
      this.db.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: true,
          branch: true,
          items: {
            include: {
              service: true,
              employee: true,
            }
          }
        },
      }),
    ]);

    return { total, page, limit, data };
  }

  // Uses transactions for creation
  async createWithItems(data: Prisma.AppointmentCreateInput, items: Prisma.AppointmentItemCreateWithoutAppointmentInput[]): Promise<Appointment> {
    return prisma.$transaction(async (tx) => {
      return tx.appointment.create({
        data: {
          ...data,
          items: {
            create: items,
          }
        },
        include: {
          customer: true,
          branch: true,
          items: {
            include: {
              service: true,
              employee: true,
            }
          }
        },
      });
    });
  }

  // Uses transactions for updating
  async updateWithItems(id: string, data: Prisma.AppointmentUpdateInput, itemsToSet?: Prisma.AppointmentItemCreateWithoutAppointmentInput[]): Promise<Appointment> {
    return prisma.$transaction(async (tx) => {
      if (itemsToSet) {
        // Clear existing items
        await tx.appointmentItem.deleteMany({
          where: { appointmentId: id },
        });
        
        data.items = {
          create: itemsToSet
        };
      }

      return tx.appointment.update({
        where: { id },
        data,
        include: {
          customer: true,
          branch: true,
          items: {
            include: {
              service: true,
              employee: true,
            }
          }
        },
      });
    });
  }

  async checkCustomerExists(customerId: string, organizationId: string) {
    return this.db.customer.findFirst({
      where: { id: customerId, organizationId, isActive: true, deletedAt: null },
    });
  }

  async checkUserEmployee(userId: string) {
    return this.db.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });
  }

  async checkBranchExists(branchId: string, organizationId: string) {
    return this.db.branch.findFirst({
      where: { id: branchId, organizationId, isActive: true, deletedAt: null },
    });
  }

  async checkServicesExist(serviceIds: string[], organizationId: string) {
    return this.db.service.findMany({
      where: {
        id: { in: serviceIds },
        organizationId,
        isActive: true,
        deletedAt: null,
      },
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

  /** @deprecated Not implemented directly since we want transactions */
  async create(data: Prisma.AppointmentCreateInput): Promise<Appointment> {
    throw new Error('Method not implemented. Use createWithItems.');
  }

  /** @deprecated Not implemented directly since we want transactions */
  async update(id: string, data: Prisma.AppointmentUpdateInput): Promise<Appointment> {
    throw new Error('Method not implemented. Use updateWithItems.');
  }

  async delete(id: string): Promise<Appointment> {
    return this.db.appointment.delete({
      where: { id },
    });
  }

  async hardDelete(id: string): Promise<Appointment> {
    return this.db.appointment.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<Appointment> {
    return this.db.appointment.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false, status: AppointmentStatus.CANCELLED, cancelledAt: new Date() }
    });
  }
}

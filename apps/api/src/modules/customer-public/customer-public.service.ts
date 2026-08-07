import { prisma } from '../../database/prisma.client';
import { SchedulingService } from '../scheduling/scheduling.service';
import { ValidationError } from '../../errors/AppErrors';

const schedulingService = new SchedulingService();

export class CustomerPublicService {
  static async getBranches(organizationId: string) {
    return prisma.branch.findMany({
      where: { organizationId, isActive: true },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        addressLine1: true,
        addressLine2: true,
        zipCode: true,
        contactEmail: true,
        contactPhone: true
      }
    });
  }

  static async getServices(organizationId: string) {
    return prisma.service.findMany({
      where: { organizationId, isActive: true },
      include: {
        serviceCategory: { select: { id: true, name: true } }
      }
    });
  }

  static async getEmployees(organizationId: string, branchId?: string, serviceId?: string) {
    let resolvedBranchId = branchId;
    if (resolvedBranchId === 'cl_default_branch') {
      const b = await prisma.branch.findFirst({ where: { organizationId } });
      if (b) resolvedBranchId = b.id;
    }

    const where: any = { organizationId, isActive: true };
    if (resolvedBranchId) {
      where.branches = { some: { branchId: resolvedBranchId } };
    }
    if (serviceId && !serviceId.startsWith('srv_')) {
      where.services = { some: { serviceId } };
    }
    
    return prisma.employee.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    });
  }

  static async getSlots(
    organizationId: string,
    branchId: string,
    employeeId?: string,
    serviceId?: string,
    date?: string,
    intervalMinutes?: number
  ) {
    let resolvedBranchId = branchId;
    if (resolvedBranchId === 'cl_default_branch') {
      const b = await prisma.branch.findFirst({ where: { organizationId } });
      if (b) resolvedBranchId = b.id;
    }
    
    let resolvedEmployeeId = employeeId;
    if (resolvedEmployeeId === 'any' || resolvedEmployeeId?.startsWith('emp_')) {
       const e = await prisma.employee.findFirst({ where: { organizationId } });
       if (e) resolvedEmployeeId = e.id;
    }
    
    let resolvedServiceId = serviceId;
    if (resolvedServiceId?.startsWith('srv_')) {
       const s = await prisma.service.findFirst({ where: { organizationId } });
       if (s) resolvedServiceId = s.id;
    }

    if (!resolvedEmployeeId || !resolvedServiceId) {
      return { availableSlots: [], unavailableSlots: [] };
    }

    return schedulingService.generateSlots(
      organizationId,
      resolvedBranchId,
      resolvedEmployeeId,
      resolvedServiceId,
      date ? new Date(date) : new Date(),
      intervalMinutes
    );
  }

  static async getInvoice(organizationId: string, id: string) {
    return prisma.appointment.findFirst({
      where: {
        id,
        branch: { organizationId },
        status: 'COMPLETED',
        isActive: true,
        deletedAt: null
      },
      select: {
        id: true,
        date: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
            primaryPhone: true,
            email: true
          }
        },
        items: {
          select: {
            id: true,
            price: true,
            startTime: true,
            endTime: true,
            service: {
              select: {
                name: true
              }
            },
            employee: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
  }
}

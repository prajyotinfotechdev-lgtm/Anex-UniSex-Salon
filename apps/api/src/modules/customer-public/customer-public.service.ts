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
    const where: any = { organizationId, isActive: true };
    if (branchId) {
      where.branches = { some: { branchId } };
    }
    if (serviceId) {
      where.services = { some: { serviceId } };
    }
    
    return prisma.employee.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        title: true
      }
    });
  }

  static async getSlots(
    organizationId: string,
    branchId: string,
    employeeId: string,
    serviceId: string,
    dateString: string,
    intervalMinutes?: number
  ) {
    if (!branchId || !employeeId || !serviceId || !dateString) {
      throw new ValidationError('Missing required parameters: branchId, employeeId, serviceId, date');
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new ValidationError('Invalid date format');
    }

    return schedulingService.generateSlots(
      organizationId,
      branchId,
      employeeId,
      serviceId,
      date,
      intervalMinutes
    );
  }
}

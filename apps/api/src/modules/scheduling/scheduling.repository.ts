import { Prisma, EmployeeAvailability, CalendarException, AppointmentItem, Service, Branch, Employee, Customer } from '@anex/database';
import { BaseRepository } from '../../repositories/BaseRepository';
import { prisma } from '../../database/prisma.client';

export class SchedulingRepository {
  async getEmployeeAvailability(employeeId: string, dayOfWeek: Prisma.EnumDayOfWeekFilter | any): Promise<EmployeeAvailability[]> {
    return prisma.employeeAvailability.findMany({
      where: { employeeId, dayOfWeek },
    });
  }

  async getCalendarExceptions(branchId: string, startDate: Date, endDate: Date): Promise<CalendarException[]> {
    return prisma.calendarException.findMany({
      where: {
        branchId,
        date: { gte: startDate, lte: endDate },
      },
    });
  }

  async getAppointmentsForEmployee(employeeId: string, startDate: Date, endDate: Date): Promise<(AppointmentItem & { service: Service })[]> {
    return prisma.appointmentItem.findMany({
      where: {
        employeeId,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
        appointment: {
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          deletedAt: null,
          isActive: true,
        }
      },
      include: {
        service: true,
      }
    });
  }

  async getBranch(branchId: string, organizationId: string): Promise<Branch | null> {
    return prisma.branch.findFirst({
      where: { id: branchId, organizationId, isActive: true, deletedAt: null },
    });
  }

  async getEmployee(employeeId: string, organizationId: string): Promise<Employee | null> {
    return prisma.employee.findFirst({
      where: { id: employeeId, organizationId, isActive: true, deletedAt: null },
    });
  }

  async getCustomer(customerId: string, organizationId: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: { id: customerId, organizationId, isActive: true, deletedAt: null },
    });
  }

  async getService(serviceId: string, organizationId: string): Promise<Service | null> {
    return prisma.service.findFirst({
      where: { id: serviceId, organizationId, isActive: true, deletedAt: null },
    });
  }

  async getBranchWorkingHours(branchId: string, dayOfWeek: any) {
    return prisma.branchWorkingHour.findUnique({
      where: {
        branchId_dayOfWeek: { branchId, dayOfWeek }
      }
    });
  }
}

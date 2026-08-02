import { Prisma, PaymentStatus, InvoiceStatus, AppointmentStatus } from '@anex/database';
import { prisma } from '../../database/prisma.client';
import { BaseReportFilters } from './reports.types';

export class ReportsRepository {
  
  async getDashboardSummary(organizationId: string, todayStart: Date, todayEnd: Date, branchId?: string) {
    const branchFilter = branchId ? { branchId } : {};
    
    // 1. Today's Revenue (from Payments)
    const todaysRevenueResult = await prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        paymentDate: { gte: todayStart, lte: todayEnd },
        invoice: {
          branch: {
            organizationId,
            ...branchFilter
          }
        }
      },
      _sum: { amount: true }
    });

    // 2. Today's Appointments
    const todaysAppointments = await prisma.appointment.count({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        branch: { organizationId, ...branchFilter },
        isActive: true,
        deletedAt: null
      }
    });

    // 3. Upcoming Appointments (Pending/Confirmed, >= todayStart)
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        date: { gte: todayStart },
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        branch: { organizationId, ...branchFilter },
        isActive: true,
        deletedAt: null
      }
    });

    // 4. Completed Appointments (Today)
    const completedAppointments = await prisma.appointment.count({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        status: AppointmentStatus.COMPLETED,
        branch: { organizationId, ...branchFilter },
        isActive: true,
        deletedAt: null
      }
    });

    // 5. Cancelled Appointments (Today)
    const cancelledAppointments = await prisma.appointment.count({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        status: AppointmentStatus.CANCELLED,
        branch: { organizationId, ...branchFilter },
        isActive: true,
        deletedAt: null
      }
    });

    // 6. No Shows (Today)
    const noShows = await prisma.appointment.count({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        status: AppointmentStatus.NO_SHOW,
        branch: { organizationId, ...branchFilter },
        isActive: true,
        deletedAt: null
      }
    });

    // 7. Outstanding Payments (All time, up to todayEnd)
    const outstandingPaymentsResult = await prisma.invoice.aggregate({
      where: {
        status: { notIn: [InvoiceStatus.PAID, InvoiceStatus.VOIDED, InvoiceStatus.REFUNDED] },
        amountDue: { gt: 0 },
        issueDate: { lte: todayEnd },
        branch: { organizationId, ...branchFilter },
        isActive: true,
        deletedAt: null
      },
      _sum: { amountDue: true }
    });

    // 8. New Customers (Created Today)
    const newCustomers = await prisma.customer.count({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
        organizationId,
        isActive: true,
        deletedAt: null
      }
    });

    return {
      todaysRevenue: Number(todaysRevenueResult._sum.amount || 0),
      todaysAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
      noShows,
      outstandingPayments: Number(outstandingPaymentsResult._sum.amountDue || 0),
      newCustomers,
    };
  }

  async getRevenueSummary(organizationId: string, filters: BaseReportFilters) {
    const branchFilter = filters.branchId ? { branchId: filters.branchId } : {};
    
    // Revenue collected via payments
    const revenue = await prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        paymentDate: { gte: filters.startDate, lte: filters.endDate },
        invoice: {
          branch: { organizationId, ...branchFilter }
        }
      },
      _sum: { amount: true }
    });

    return {
      totalRevenue: Number(revenue._sum.amount || 0)
    };
  }

  async getPaymentMethodBreakdown(organizationId: string, filters: BaseReportFilters) {
    const branchFilter = filters.branchId ? { branchId: filters.branchId } : {};
    
    const breakdown = await prisma.payment.groupBy({
      by: ['method'],
      where: {
        status: PaymentStatus.COMPLETED,
        paymentDate: { gte: filters.startDate, lte: filters.endDate },
        invoice: {
          branch: { organizationId, ...branchFilter }
        }
      },
      _sum: { amount: true }
    });

    return breakdown.map(b => ({
      method: b.method,
      amount: Number(b._sum.amount || 0)
    }));
  }

  async getAppointmentsByStatus(organizationId: string, filters: BaseReportFilters) {
    const branchFilter = filters.branchId ? { branchId: filters.branchId } : {};
    
    const breakdown = await prisma.appointment.groupBy({
      by: ['status'],
      where: {
        date: { gte: filters.startDate, lte: filters.endDate },
        branch: { organizationId, ...branchFilter },
        isActive: true,
        deletedAt: null
      },
      _count: { _all: true }
    });

    return breakdown.map(b => ({
      status: b.status,
      count: b._count._all
    }));
  }

  async getServicePerformance(organizationId: string, filters: BaseReportFilters) {
    const branchFilter = filters.branchId ? { branchId: filters.branchId } : {};
    
    // Aggregating over AppointmentItem
    const performance = await prisma.appointmentItem.groupBy({
      by: ['serviceId'],
      where: {
        appointment: {
          date: { gte: filters.startDate, lte: filters.endDate },
          status: AppointmentStatus.COMPLETED,
          branch: { organizationId, ...branchFilter },
          isActive: true,
          deletedAt: null
        }
      },
      _count: { _all: true },
      _sum: { price: true }
    });

    return performance.map(p => ({
      serviceId: p.serviceId,
      count: p._count._all,
      revenue: Number(p._sum.price || 0)
    }));
  }

  async getEmployeePerformance(organizationId: string, filters: BaseReportFilters) {
    const branchFilter = filters.branchId ? { branchId: filters.branchId } : {};
    
    // Aggregating over AppointmentItem to determine employee revenue (Service Revenue)
    const performance = await prisma.appointmentItem.groupBy({
      by: ['employeeId'],
      where: {
        appointment: {
          date: { gte: filters.startDate, lte: filters.endDate },
          status: AppointmentStatus.COMPLETED,
          branch: { organizationId, ...branchFilter },
          isActive: true,
          deletedAt: null
        }
      },
      _count: { _all: true },
      _sum: { price: true }
    });

    return performance.map(p => ({
      employeeId: p.employeeId,
      appointmentsCount: p._count._all, // This is actually items count, but we can call it services provided
      serviceRevenue: Number(p._sum.price || 0)
    }));
  }

  async getTopCustomers(organizationId: string, limit: number = 10) {
    // Top customers by Lifetime Value (using paid amounts)
    const result = await prisma.invoice.groupBy({
      by: ['customerId'],
      where: {
        customerId: { not: null },
        status: { notIn: [InvoiceStatus.VOIDED] },
        branch: { organizationId },
        isActive: true,
        deletedAt: null
      },
      _sum: { amountPaid: true },
      orderBy: {
        _sum: { amountPaid: 'desc' }
      },
      take: limit
    });
    
    return result.map(r => ({
      customerId: r.customerId,
      lifetimeValue: Number(r._sum.amountPaid || 0)
    }));
  }
}

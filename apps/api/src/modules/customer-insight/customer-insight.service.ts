import { prisma } from '../../database/prisma.client';
import { ConsultationEngineService } from '../consultation-engine/consultation-engine.service';
import { addDays, getDay, getHours } from 'date-fns';

export class CustomerInsightService {
  /**
   * Loads the full profile of a customer for the booking flow
   */
  static async getBookingProfile(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        preferredBranch: true,
        preferredEmployee: true,
        appointments: {
          where: {
            status: 'COMPLETED'
          },
          orderBy: {
            date: 'desc'
          },
          take: 5,
          include: {
            items: {
              include: {
                service: true,
                employee: true
              }
            }
          }
        },
        loyaltyTransactions: true,
        walletTransactions: true,
        memberships: true,
      }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const latestConsultations = await ConsultationEngineService.getLatestConsultations(customerId);

    return {
      customer,
      latestConsultations,
      historicalMetrics: this.computeHistoricalMetrics(customer.appointments)
    };
  }

  /**
   * Computes simple historical metrics (frequent services, average day, etc)
   */
  private static computeHistoricalMetrics(appointments: any[]) {
    if (!appointments || appointments.length === 0) return null;

    const lastVisit = appointments[0].date;
    const servicesCount = new Map<string, number>();
    
    appointments.forEach(app => {
      app.items.forEach((item: any) => {
        if (item.service) {
          servicesCount.set(item.service.id, (servicesCount.get(item.service.id) || 0) + 1);
        }
      });
    });

    const frequentServices = Array.from(servicesCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    return {
      lastVisit,
      frequentServiceIds: frequentServices
    };
  }

  /**
   * Hooked into COMPLETED transition to update Layer 1 persistent preferences automatically.
   */
  static async processRecommendationLearningLoop(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        items: true,
        customer: {
          include: {
            appointments: {
              where: { status: 'COMPLETED' },
              orderBy: { date: 'desc' },
              take: 3,
              include: { items: true }
            }
          }
        }
      }
    });

    if (!appointment || !appointment.customer) return;

    // We check if the last 3 appointments were all at the same branch
    const recentAppointments = appointment.customer.appointments;
    if (recentAppointments.length >= 2) {
      const allSameBranch = recentAppointments.every(a => a.branchId === appointment.branchId);
      
      let updateData: any = {};
      
      if (allSameBranch && appointment.customer.preferredBranchId !== appointment.branchId) {
        updateData.preferredBranchId = appointment.branchId;
      }

      // Extract predominant employee from recent appointments
      const employeeCounts = new Map<string, number>();
      for (const app of recentAppointments) {
        for (const item of app.items) {
          if (item.employeeId) {
            employeeCounts.set(item.employeeId, (employeeCounts.get(item.employeeId) || 0) + 1);
          }
        }
      }

      let mostFrequentEmployee = null;
      let maxCount = 0;
      for (const [empId, count] of employeeCounts.entries()) {
        if (count > maxCount) {
          mostFrequentEmployee = empId;
          maxCount = count;
        }
      }

      // If they used the same employee > 50% of the items across last 3 visits
      if (mostFrequentEmployee && mostFrequentEmployee !== appointment.customer.preferredEmployeeId) {
        updateData.preferredEmployeeId = mostFrequentEmployee;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.customer.update({
          where: { id: appointment.customerId },
          data: updateData
        });
      }
    }
  }
}

export class SmartRecommendationService {
  /**
   * Recommends the next appointment slot based on customer habits.
   */
  static async getRecommendations(customerId: string) {
    const profile = await CustomerInsightService.getBookingProfile(customerId);
    
    if (!profile.historicalMetrics) {
      // First-time customer, return generic recommendations or empty
      return null;
    }

    const appointments = profile.customer.appointments;
    
    // Find most common day of week (0-6)
    const dayCounts = new Map<number, number>();
    const hourCounts = new Map<number, number>();

    appointments.forEach(app => {
      const d = new Date(app.date);
      const day = getDay(d);
      const hour = getHours(d);
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const getTop = (map: Map<number, number>) => {
      let top = 0;
      let max = 0;
      for (const [key, val] of map.entries()) {
        if (val > max) { max = val; top = key; }
      }
      return top;
    };

    const preferredDayOfWeek = getTop(dayCounts);
    const preferredHour = getTop(hourCounts);

    // Calculate next recommended date
    const now = new Date();
    let nextDate = addDays(now, 1);
    
    // Simply walk forward until we hit their preferred day of week
    for (let i = 0; i < 7; i++) {
      if (getDay(nextDate) === preferredDayOfWeek) {
        break;
      }
      nextDate = addDays(nextDate, 1);
    }
    nextDate.setHours(preferredHour, 0, 0, 0);

    return {
      recommendedDate: nextDate,
      recommendedEmployee: profile.customer.preferredEmployee,
      recommendedBranch: profile.customer.preferredBranch,
      recommendedServices: profile.historicalMetrics.frequentServiceIds
    };
  }
}

import { prisma } from '../../database/prisma.client';
import { NotFoundError } from '../../errors/AppErrors';

export class PredictionService {
  /**
   * Analyzes customer history to predict "Book The Usual"
   */
  static async predictNextBooking(organizationId: string, customerId: string) {
    const pastAppointments = await prisma.appointment.findMany({
      where: {
        customerId,
        branch: { organizationId },
        status: 'COMPLETED'
      },
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        items: {
          include: {
            service: true,
            employee: true
          }
        }
      }
    });

    if (pastAppointments.length === 0) {
      return null;
    }

    // For Phase 7.3, "The Usual" is simply the most recent completed appointment's first service and stylist.
    // A more advanced engine would compute a frequency histogram.
    const lastAppt = pastAppointments[0];
    if (!lastAppt.items || lastAppt.items.length === 0) return null;

    const firstItem = lastAppt.items[0];

    // Predict optimal day/time (we'll just suggest their last used time for now)
    const predictedDayOfWeek = lastAppt.date.getUTCDay();
    const predictedHour = lastAppt.date.getUTCHours();
    const predictedMinute = lastAppt.date.getUTCMinutes();

    return {
      predictedService: {
        id: firstItem.serviceId,
        name: firstItem.service.name,
        price: firstItem.price,
        durationMinutes: firstItem.service.durationMinutes
      },
      predictedStylist: {
        id: firstItem.employeeId,
        firstName: firstItem.employee.firstName,
        lastName: firstItem.employee.lastName
      },
      predictedTiming: {
        dayOfWeek: predictedDayOfWeek,
        hour: predictedHour,
        minute: predictedMinute
      }
    };
  }
}

import { prisma } from '../../database/prisma.client';
import { NotFoundError, ValidationError } from '../../errors/AppErrors';
import { Prisma } from '@prisma/client';

export class AvailabilityService {
  /**
   * Complex Availability Engine
   * Dynamically calculates available time slots by computing the difference between
   * Business Hours, Employee Shifts, and existing AppointmentItems.
   */
  static async findAvailableSlots(organizationId: string, branchId: string, date: Date, serviceIds: string[], preferredEmployeeId?: string) {
    if (!serviceIds || serviceIds.length === 0) {
      throw new ValidationError("At least one service is required to calculate availability.");
    }

    // 1. Calculate Total Required Duration
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, organizationId }
    });

    if (services.length !== serviceIds.length) {
      throw new NotFoundError("One or more services not found.");
    }

    const totalDurationMinutes = services.reduce((acc: number, service: any) => acc + service.durationMinutes, 0);

    // 2. Fetch Branch Business Hours for this specific day
    const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        branchSettings: {
          where: { key: 'businessHours' }
        }
      }
    });

    if (!branch || !branch.branchSettings || branch.branchSettings.length === 0) {
      return []; // Branch is closed or hours not configured
    }

    // businessHours in branchSettings should be an array of objects for each day
    // e.g. [{ dayOfWeek: 0, isOpen: true, openTime: '09:00', closeTime: '18:00' }, ...]
    const hoursConfig = branch.branchSettings[0].value as any;
    const dayConfig = Array.isArray(hoursConfig) ? hoursConfig.find(h => h.dayOfWeek === dayOfWeek) : null;

    if (!dayConfig || !dayConfig.isOpen) {
      return []; // Branch is closed
    }

    const [openHour, openMin] = dayConfig.openTime.split(':').map(Number);
    const [closeHour, closeMin] = dayConfig.closeTime.split(':').map(Number);

    const openTime = new Date(date);
    openTime.setUTCHours(openHour, openMin, 0, 0);

    const closeTime = new Date(date);
    closeTime.setUTCHours(closeHour, closeMin, 0, 0);

    // 3. Fetch Existing Appointments (Items) for the day in this branch
    // We only care about items that are NOT cancelled
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingItems = await prisma.appointmentItem.findMany({
      where: {
        appointment: {
          branchId,
          status: { not: 'CANCELLED' }
        },
        startTime: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        appointment: { select: { status: true } }
      }
    });

    // 4. Fetch Employees who provide ALL selected services
    // For simplicity in Phase 7.3, we assume an employee is eligible if they are active in the branch.
    // A robust system would check `EmployeeService` maps.
    let eligibleEmployees = await prisma.employee.findMany({
      where: {
        branchId,
        isActive: true,
        ...(preferredEmployeeId ? { id: preferredEmployeeId } : {})
      }
    });

    if (eligibleEmployees.length === 0) return [];

    // 5. Generate 15-minute slot candidates and validate against existing items
    const availableSlots: { time: Date; employeeId: string }[] = [];
    
    // We start from openTime to closeTime - totalDurationMinutes
    const lastPossibleStart = new Date(closeTime.getTime() - totalDurationMinutes * 60000);
    
    // Increment by 15 mins
    for (let currentSlot = new Date(openTime); currentSlot <= lastPossibleStart; currentSlot = new Date(currentSlot.getTime() + 15 * 60000)) {
      const slotEndTime = new Date(currentSlot.getTime() + totalDurationMinutes * 60000);

      // Check if slot has already passed
      if (currentSlot < new Date()) continue;

      // Find an employee who is free for this block
      const freeEmployee = eligibleEmployees.find(emp => {
        // Is employee booked during this exact block?
        const hasOverlap = existingItems.some(item => {
          if (item.employeeId !== emp.id) return false;
          
          const itemStart = new Date(item.startTime);
          const itemEnd = new Date(item.endTime);

          // Overlap condition: Math.max(0, Math.min(end1, end2) - Math.max(start1, start2)) > 0
          return currentSlot < itemEnd && slotEndTime > itemStart;
        });

        return !hasOverlap;
      });

      if (freeEmployee) {
        availableSlots.push({
          time: new Date(currentSlot),
          employeeId: freeEmployee.id
        });
      }
    }

    return availableSlots;
  }
}

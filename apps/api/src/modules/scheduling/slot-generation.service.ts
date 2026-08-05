import { SchedulingRepository } from './scheduling.repository';
import { CalendarService } from './calendar.service';
import { TimeBlockCalculator } from './time-block.calculator';
import { OccupiedTimeBlock, ServiceDurationMetrics, TimeBlock } from './scheduling.types';
import { NotFoundError } from '../../errors/AppErrors';

export class SlotGenerationService {
  private repo = new SchedulingRepository();
  private calendarService = new CalendarService();

  async generateSlots(
    organizationId: string,
    branchId: string,
    employeeId: string,
    serviceId: string,
    date: Date,
    intervalMinutes: number = 15
  ): Promise<{ availableSlots: Date[]; unavailableSlots: Date[] }> {
    
    // 1. Fetch and validate Service
    const service = await this.repo.getService(serviceId, organizationId);
    if (!service) throw new NotFoundError('Service not found or inactive');

    const metrics: ServiceDurationMetrics = {
      durationMinutes: service.durationMinutes,
      processingMinutes: service.processingMinutes || 0,
      cleanupMinutes: service.cleanupMinutes || 0,
      beforeBufferMinutes: service.beforeBufferMinutes,
      afterBufferMinutes: service.afterBufferMinutes,
    };

    // 2. Fetch Open Blocks from CalendarService
    const openBlocks = await this.calendarService.getEmployeeOpenBlocks(branchId, employeeId, date);
    if (openBlocks.length === 0) {
      return { availableSlots: [], unavailableSlots: [] }; // No schedule
    }

    // 3. Fetch Existing Appointments and calculate occupied regions
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingItems = await this.repo.getAppointmentsForEmployee(employeeId, startOfDay, endOfDay);
    
    const existingOccupiedBlocks: OccupiedTimeBlock[] = existingItems.map(item => {
      const itemMetrics: ServiceDurationMetrics = {
        durationMinutes: item.service.durationMinutes,
        processingMinutes: item.service.processingMinutes || 0,
        cleanupMinutes: item.service.cleanupMinutes || 0,
        beforeBufferMinutes: item.service.beforeBufferMinutes,
        afterBufferMinutes: item.service.afterBufferMinutes,
      };
      return TimeBlockCalculator.calculateOccupiedWindow(item.startTime, itemMetrics);
    });

    const mergedOccupiedBlocks = TimeBlockCalculator.mergeBlocks(existingOccupiedBlocks);

    // 4. Generate Slots
    const availableSlots: Date[] = [];
    const unavailableSlots: Date[] = [];

    // For every open shift block, generate candidate slots every intervalMinutes
    for (const block of openBlocks) {
      let currentSlot = new Date(block.startTime);
      
      while (currentSlot < block.endTime) {
        // Filter out past slots
        if (currentSlot.getTime() < Date.now()) {
          currentSlot = new Date(currentSlot.getTime() + intervalMinutes * 60000);
          continue;
        }
        // Calculate the theoretical occupied window if the slot was booked here
        const requestedWindow = TimeBlockCalculator.calculateOccupiedWindow(currentSlot, metrics);

        // Check if the theoretical window fits entirely within the open block
        if (TimeBlockCalculator.isContained(requestedWindow, block)) {
          
          // Check against merged occupied blocks
          const overlaps = mergedOccupiedBlocks.some(occupied => 
            TimeBlockCalculator.doBlocksOverlap(requestedWindow, occupied)
          );

          if (overlaps) {
            unavailableSlots.push(new Date(currentSlot));
          } else {
            availableSlots.push(new Date(currentSlot));
          }
        } else {
          // Exceeds shift boundary
          unavailableSlots.push(new Date(currentSlot));
        }

        // Increment currentSlot
        currentSlot = new Date(currentSlot.getTime() + intervalMinutes * 60000);
      }
    }

    return { availableSlots, unavailableSlots };
  }
}

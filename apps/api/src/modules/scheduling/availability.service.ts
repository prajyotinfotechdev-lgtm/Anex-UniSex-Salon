import { SchedulingRepository } from './scheduling.repository';
import { CalendarService } from './calendar.service';
import { ConflictDetectionService } from './conflict-detection.service';
import { TimeBlockCalculator } from './time-block.calculator';
import { OccupiedTimeBlock, ServiceDurationMetrics, ConflictReason } from './scheduling.types';
import { NotFoundError, ValidationError } from '../../errors/AppErrors';

export class AvailabilityService {
  private repo = new SchedulingRepository();
  private calendarService = new CalendarService();
  private conflictDetection = new ConflictDetectionService();

  async checkAvailability(
    organizationId: string,
    branchId: string,
    employeeId: string,
    serviceId: string,
    startTime: Date,
    customerId?: string
  ): Promise<{ available: boolean; conflicts: ConflictReason[] }> {
    
    // 1. Validate Entities
    const [branch, employee, service, customer] = await Promise.all([
      this.repo.getBranch(branchId, organizationId),
      this.repo.getEmployee(employeeId, organizationId),
      this.repo.getService(serviceId, organizationId),
      customerId ? this.repo.getCustomer(customerId, organizationId) : Promise.resolve(null),
    ]);

    if (!branch) throw new NotFoundError('Branch not found or inactive');
    if (!employee) throw new NotFoundError('Employee not found or inactive');
    if (!service) throw new NotFoundError('Service not found or inactive');
    if (customerId && !customer) throw new NotFoundError('Customer not found or inactive');

    // Determine the full occupied window (including buffers)
    const metrics: ServiceDurationMetrics = {
      durationMinutes: service.durationMinutes,
      processingMinutes: service.processingMinutes || 0,
      cleanupMinutes: service.cleanupMinutes || 0,
      beforeBufferMinutes: service.beforeBufferMinutes,
      afterBufferMinutes: service.afterBufferMinutes,
    };

    const requestedWindow = TimeBlockCalculator.calculateOccupiedWindow(startTime, metrics);

    // 2. Validate against Calendar (Employee Availability & Calendar Exceptions)
    // We check if the requested block is fully contained within ANY of the open shift blocks for that day.
    const date = new Date(startTime);
    const openBlocks = await this.calendarService.getEmployeeOpenBlocks(branchId, employeeId, date);
    
    const isContainedInShift = openBlocks.some(block => 
      TimeBlockCalculator.isContained(requestedWindow, block)
    );

    if (!isContainedInShift) {
      return {
        available: false,
        conflicts: [{
          type: 'EXACT',
          message: 'Requested time is outside of employee shift hours or falls on a closed calendar exception.',
          conflictingBlock: { startTime: new Date(), endTime: new Date(), type: 'EXCEPTION' }, // Dummy block for reporting
        }]
      };
    }

    // 3. Detect Conflicts with Existing Appointments
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
      
      const block = TimeBlockCalculator.calculateOccupiedWindow(item.startTime, itemMetrics);
      block.appointmentId = item.appointmentId;
      return block;
    });

    const conflicts = this.conflictDetection.detectConflicts(requestedWindow, existingOccupiedBlocks);

    return {
      available: conflicts.length === 0,
      conflicts,
    };
  }
}

import { AvailabilityService } from './availability.service';
import { SlotGenerationService } from './slot-generation.service';

export class SchedulingService {
  private availabilityService = new AvailabilityService();
  private slotGenerationService = new SlotGenerationService();

  async checkAvailability(
    organizationId: string,
    branchId: string,
    employeeId: string,
    serviceId: string,
    startTime: Date,
    customerId?: string
  ) {
    return this.availabilityService.checkAvailability(
      organizationId,
      branchId,
      employeeId,
      serviceId,
      startTime,
      customerId
    );
  }

  async generateSlots(
    organizationId: string,
    branchId: string,
    employeeId: string,
    serviceId: string,
    date: Date,
    intervalMinutes?: number
  ) {
    return this.slotGenerationService.generateSlots(
      organizationId,
      branchId,
      employeeId,
      serviceId,
      date,
      intervalMinutes
    );
  }
}

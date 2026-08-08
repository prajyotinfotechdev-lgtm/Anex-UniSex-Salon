import { AppointmentStatus, ActionType, AppointmentSource } from '@anex/database';
import { BaseService } from '../../services/BaseService';
import { AppointmentCoreService } from '../../modules/appointment/appointment.service';
import { AppointmentItemDto } from '../../modules/appointment/appointment.dto';
import { SchedulingService } from '../../modules/scheduling/scheduling.service';
import { StatusTransitionValidator } from './status-transition.validator';
import { AuditService } from '../../services/AuditService';
import { NotFoundError, ConflictError, ValidationError } from '../../errors/AppErrors';
import { prisma } from '../../database/prisma.client';
import {
  CancelAppointmentRequestDto,
  UpdateNotesRequestDto,
  RescheduleAppointmentRequestDto,
  ChangeEmployeeRequestDto,
  ChangeServiceRequestDto,
} from './appointment-operations.dto';

export class AppointmentOperationsService extends BaseService {
  private coreService = new AppointmentCoreService();
  private schedulingService = new SchedulingService();

  private async auditLog(
    organizationId: string,
    action: ActionType,
    entityId: string,
    userId: string,
    details?: Record<string, any>
  ) {
    try {
      await AuditService.log({
        organizationId,
        action,
        entityName: 'Appointment',
        entityId,
        userId,
        newValue: details,
      });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  }

  // --- Status Transitions ---

  private async transitionStatus(
    organizationId: string,
    appointmentId: string,
    actorUserId: string,
    newStatus: AppointmentStatus,
    additionalUpdates?: Record<string, any>
  ) {
    const existing = await this.coreService.getAppointmentById(organizationId, appointmentId);
    
    StatusTransitionValidator.validate(existing.status, newStatus);

    const result = await this.coreService.updateAppointment(organizationId, appointmentId, actorUserId, {
      status: newStatus,
      ...additionalUpdates
    });

    await this.auditLog(organizationId, ActionType.UPDATE, appointmentId, actorUserId, {
      note: `Appointment ${newStatus}`,
      oldStatus: existing.status,
      newStatus
    });

    return result;
  }

  async confirm(organizationId: string, appointmentId: string, actorUserId: string) {
    return this.transitionStatus(organizationId, appointmentId, actorUserId, AppointmentStatus.CONFIRMED);
  }

  async checkIn(organizationId: string, appointmentId: string, actorUserId: string) {
    return this.transitionStatus(organizationId, appointmentId, actorUserId, AppointmentStatus.ARRIVED);
  }

  async start(organizationId: string, appointmentId: string, actorUserId: string) {
    return this.transitionStatus(organizationId, appointmentId, actorUserId, AppointmentStatus.IN_PROGRESS);
  }

  async complete(organizationId: string, appointmentId: string, actorUserId: string) {
    const appointment = await this.transitionStatus(organizationId, appointmentId, actorUserId, AppointmentStatus.COMPLETED);
    
    // Trigger Learning Loop in the background
    import('../customer-insight/customer-insight.service').then(({ CustomerInsightService }) => {
      CustomerInsightService.processRecommendationLearningLoop(appointmentId).catch(console.error);
    });

    return appointment;
  }

  async cancel(organizationId: string, appointmentId: string, actorUserId: string, data: CancelAppointmentRequestDto) {
    return this.transitionStatus(organizationId, appointmentId, actorUserId, AppointmentStatus.CANCELLED, {
      cancellationReason: data.cancellationReason
    });
  }

  async noShow(organizationId: string, appointmentId: string, actorUserId: string) {
    return this.transitionStatus(organizationId, appointmentId, actorUserId, AppointmentStatus.NO_SHOW);
  }

  // --- Non-Scheduling Updates ---

  async updateNotes(organizationId: string, appointmentId: string, actorUserId: string, data: UpdateNotesRequestDto) {
    const appointment = await this.coreService.updateAppointment(organizationId, appointmentId, actorUserId, {
      notes: data.notes,
      internalNotes: data.internalNotes
    });

    await this.auditLog(organizationId, ActionType.UPDATE, appointmentId, actorUserId, {
      note: 'Notes Updated',
    });

    return appointment;
  }

  // --- Scheduling Operations ---

  async reschedule(organizationId: string, appointmentId: string, actorUserId: string, data: RescheduleAppointmentRequestDto) {
    const existing = await this.coreService.getAppointmentById(organizationId, appointmentId);
    if (!existing.items || existing.items.length === 0) throw new NotFoundError('Appointment has no items');

    const newStartDate = new Date(data.startTime);
    let currentStartTime = newStartDate;

    // We assume sequential execution of items for multi-service
    for (const item of existing.items) {
      // Need duration from original service.
      const service = await prisma.service.findUnique({ where: { id: item.serviceId } });
      if (!service) throw new NotFoundError('Service not found');

      const { available, conflicts } = await this.schedulingService.checkAvailability(
        organizationId,
        existing.branchId,
        item.employeeId,
        item.serviceId,
        currentStartTime,
        existing.customerId ?? undefined
      );

      // In reschedule, we must ignore conflicts that are just overlapping with our CURRENT appointment.
      const trueConflicts = conflicts.filter(c => c.conflictingBlock.appointmentId !== appointmentId);

      if (!available && trueConflicts.length > 0) {
        throw new ConflictError(`Rescheduling failed due to scheduling conflicts: ${trueConflicts[0].message}`);
      }

      const totalMinutes = service.durationMinutes + (service.processingMinutes || 0) + (service.cleanupMinutes || 0);
      const newEndTime = new Date(currentStartTime.getTime() + totalMinutes * 60000);

      // Update each item's startTime/endTime in-place — this PRESERVES snapshotData and all
      // other required fields so the DB transaction does not roll back.
      await prisma.appointmentItem.update({
        where: { id: item.id },
        data: {
          startTime: currentStartTime,
          endTime: newEndTime,
        }
      });

      currentStartTime = newEndTime;
    }

    // Only update the top-level date on the appointment (no items rebuild)
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { date: new Date(data.date) },
      include: {
        customer: true,
        branch: true,
        items: {
          include: { service: true, employee: true }
        }
      }
    });

    await this.auditLog(organizationId, ActionType.UPDATE, appointmentId, actorUserId, {
      note: 'Appointment Rescheduled',
    });

    return appointment;
  }

  async changeEmployee(organizationId: string, appointmentId: string, actorUserId: string, data: ChangeEmployeeRequestDto) {
    const existing = await this.coreService.getAppointmentById(organizationId, appointmentId);
    
    const targetItem = existing.items?.find(i => i.id === data.appointmentItemId);
    if (!targetItem) throw new NotFoundError('Appointment item not found');

    const newEmployee = await prisma.employee.findFirst({
      where: { id: data.newEmployeeId, organizationId, isActive: true, deletedAt: null }
    });
    if (!newEmployee) throw new NotFoundError('New employee not found or inactive');

    const { available, conflicts } = await this.schedulingService.checkAvailability(
      organizationId,
      existing.branchId,
      data.newEmployeeId,
      targetItem.serviceId,
      new Date(targetItem.startTime),
      existing.customerId ?? undefined
    );

    const trueConflicts = conflicts.filter(c => c.conflictingBlock.appointmentId !== appointmentId);
    if (!available && trueConflicts.length > 0) {
      throw new ConflictError(`Employee change failed due to conflicts: ${trueConflicts[0].message}`);
    }

    const newItems: AppointmentItemDto[] = existing.items!.map(item => {
      if (item.id === data.appointmentItemId) {
        return {
          serviceId: item.serviceId,
          employeeId: data.newEmployeeId,
          startTime: item.startTime.toISOString(),
          endTime: item.endTime.toISOString(),
          price: Number(item.price)
        };
      }
      return {
        serviceId: item.serviceId,
        employeeId: item.employeeId,
        startTime: item.startTime.toISOString(),
        endTime: item.endTime.toISOString(),
        price: Number(item.price)
      };
    });

    const appointment = await this.coreService.updateAppointment(organizationId, appointmentId, actorUserId, {
      items: newItems
    });

    await this.auditLog(organizationId, ActionType.UPDATE, appointmentId, actorUserId, {
      note: 'Employee Changed',
      itemId: data.appointmentItemId,
      newEmployeeId: data.newEmployeeId
    });

    return appointment;
  }

  async changeService(organizationId: string, appointmentId: string, actorUserId: string, data: ChangeServiceRequestDto) {
    const existing = await this.coreService.getAppointmentById(organizationId, appointmentId);
    
    const targetItem = existing.items?.find(i => i.id === data.appointmentItemId);
    if (!targetItem) throw new NotFoundError('Appointment item not found');

    const newService = await prisma.service.findFirst({
      where: { id: data.newServiceId, organizationId, isActive: true, deletedAt: null }
    });
    if (!newService) throw new NotFoundError('New service not found or inactive');

    const { available, conflicts } = await this.schedulingService.checkAvailability(
      organizationId,
      existing.branchId,
      targetItem.employeeId,
      data.newServiceId,
      new Date(targetItem.startTime),
      existing.customerId ?? undefined
    );

    const trueConflicts = conflicts.filter(c => c.conflictingBlock.appointmentId !== appointmentId);
    if (!available && trueConflicts.length > 0) {
      throw new ConflictError(`Service change failed due to scheduling conflicts: ${trueConflicts[0].message}`);
    }

    const totalMinutes = newService.durationMinutes + (newService.processingMinutes || 0) + (newService.cleanupMinutes || 0);
    const newEndTime = new Date(new Date(targetItem.startTime).getTime() + totalMinutes * 60000);

    const newItems: AppointmentItemDto[] = existing.items!.map(item => {
      if (item.id === data.appointmentItemId) {
        return {
          serviceId: data.newServiceId,
          employeeId: item.employeeId,
          startTime: item.startTime.toISOString(),
          endTime: newEndTime.toISOString(),
          price: Number(newService.basePrice)
        };
      }
      return {
        serviceId: item.serviceId,
        employeeId: item.employeeId,
        startTime: item.startTime.toISOString(),
        endTime: item.endTime.toISOString(),
        price: Number(item.price)
      };
    });

    const appointment = await this.coreService.updateAppointment(organizationId, appointmentId, actorUserId, {
      items: newItems
    });

    await this.auditLog(organizationId, ActionType.UPDATE, appointmentId, actorUserId, {
      note: 'Service Changed',
      itemId: data.appointmentItemId,
      newServiceId: data.newServiceId
    });

    return appointment;
  }
}

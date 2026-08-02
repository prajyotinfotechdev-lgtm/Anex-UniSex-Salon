import { BaseService } from '../../services/BaseService';
import { AppointmentRepository } from './appointment.repository';
import { AuditService } from '../../services/AuditService';
import { ActionType, AppointmentStatus, AppointmentSource, Prisma } from '@anex/database';
import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from '../../errors/AppErrors';
import { StatusTransitionValidator } from '../appointment-operations/status-transition.validator';
import {
  CreateAppointmentRequestDto,
  UpdateAppointmentRequestDto,
  SearchAppointmentsQueryDto,
  AppointmentResponseDto,
  AppointmentItemDto,
} from './appointment.dto';

export class AppointmentCoreService extends BaseService {
  private repo: AppointmentRepository;

  constructor() {
    super();
    this.repo = new AppointmentRepository();
  }

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

  private async validateBranch(organizationId: string, branchId: string) {
    const branch = await this.repo.checkBranchExists(branchId, organizationId);
    if (!branch) {
      throw new NotFoundError('Branch not found or is inactive in this organization');
    }
  }

  private async validateCustomer(organizationId: string, customerId?: string | null) {
    if (!customerId) return;
    const customer = await this.repo.checkCustomerExists(customerId, organizationId);
    if (!customer) {
      throw new NotFoundError('Customer not found or is inactive in this organization');
    }
  }

  private async validateItems(organizationId: string, items: AppointmentItemDto[]) {
    if (!items || items.length === 0) return [];

    const serviceIds = [...new Set(items.map(i => i.serviceId))];
    const employeeIds = [...new Set(items.map(i => i.employeeId))];

    const [services, employees] = await Promise.all([
      this.repo.checkServicesExist(serviceIds, organizationId),
      this.repo.checkEmployeesExist(employeeIds, organizationId),
    ]);

    if (services.length !== serviceIds.length) {
      throw new ValidationError('One or more services do not exist or are inactive in this organization');
    }
    if (employees.length !== employeeIds.length) {
      throw new ValidationError('One or more employees do not exist or are inactive in this organization');
    }

    const serviceMap = services.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {} as Record<string, any>);

    const employeeMap = employees.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {} as Record<string, any>);

    return items.map(item => {
      const svc = serviceMap[item.serviceId];
      const emp = employeeMap[item.employeeId];
      return {
        service: { connect: { id: item.serviceId } },
        employee: { connect: { id: item.employeeId } },
        startTime: new Date(item.startTime),
        endTime: new Date(item.endTime),
        price: item.price,
        snapshottedServiceName: svc.name,
        snapshottedEmployeeName: emp.firstName + ' ' + emp.lastName,
        snapshottedDuration: svc.durationMinutes,
        snapshottedPrice: svc.basePrice,
        snapshotData: {
          pricingType: svc.pricingType,
          originalBasePrice: svc.basePrice,
          serviceCategory: svc.serviceCategoryId,
          employeeDisplay: emp.firstName + ' ' + emp.lastName,
          timestamp: new Date().toISOString(),
        }
      };
    }) as Prisma.AppointmentItemCreateWithoutAppointmentInput[];
  }

  // Removed duplicate validateStatusTransition

  async searchAppointments(organizationId: string, params: SearchAppointmentsQueryDto) {
    return this.repo.search(organizationId, params);
  }

  async getAppointmentById(organizationId: string, appointmentId: string): Promise<AppointmentResponseDto> {
    const appointment = await this.repo.findByIdWithDetails(appointmentId, organizationId);
    if (!appointment) throw new NotFoundError('Appointment not found');
    return appointment as unknown as AppointmentResponseDto;
  }

  async createAppointment(organizationId: string, actorUserId: string, data: CreateAppointmentRequestDto): Promise<AppointmentResponseDto> {
    await this.validateBranch(organizationId, data.branchId);
    await this.validateCustomer(organizationId, data.customerId);
    
    const validatedItems = await this.validateItems(organizationId, data.items);

    const status = data.status ?? AppointmentStatus.PENDING;
    const now = new Date();

    // Fetch actor's employeeId
    let employeeId: string | undefined;
    const actorUser = await this.repo.checkUserEmployee(actorUserId);
    if (actorUser?.employee) {
      employeeId = actorUser.employee.id;
    }

    const appointmentData: Prisma.AppointmentCreateInput = {
      branch: { connect: { id: data.branchId } },
      ...(data.customerId && { customer: { connect: { id: data.customerId } } }),
      source: data.source ?? AppointmentSource.MANUAL,
      status,
      date: new Date(data.date),
      notes: data.notes,
      internalNotes: data.internalNotes,
      ...(employeeId && { createdByEmployee: { connect: { id: employeeId } } }),
      ...(status === AppointmentStatus.CONFIRMED && { confirmedAt: now }),
      ...(status === AppointmentStatus.ARRIVED && { checkedInAt: now }),
      ...(status === AppointmentStatus.COMPLETED && { completedAt: now }),
      ...(status === AppointmentStatus.CANCELLED && { cancelledAt: now }),
    };

    const appointment = await this.repo.createWithItems(appointmentData, validatedItems);

    await this.auditLog(organizationId, ActionType.CREATE, appointment.id, actorUserId, { status: appointment.status, itemsCount: validatedItems.length });
    return appointment as unknown as AppointmentResponseDto;
  }

  async updateAppointment(organizationId: string, appointmentId: string, actorUserId: string, data: UpdateAppointmentRequestDto): Promise<AppointmentResponseDto> {
    const existing = await this.repo.findByIdWithDetails(appointmentId, organizationId);
    if (!existing) throw new NotFoundError('Appointment not found');

    if (data.branchId) await this.validateBranch(organizationId, data.branchId);
    if (data.customerId !== undefined) await this.validateCustomer(organizationId, data.customerId);

    let itemsToSet;
    if (data.items) {
      itemsToSet = await this.validateItems(organizationId, data.items);
    }

    const newStatus = data.status ?? existing.status;
    if (data.status && data.status !== existing.status) {
      StatusTransitionValidator.validate(existing.status, data.status);
    }

    const now = new Date();

    const updateData: Prisma.AppointmentUpdateInput = {
      ...(data.branchId && { branch: { connect: { id: data.branchId } } }),
      ...(data.customerId !== undefined && (data.customerId ? { customer: { connect: { id: data.customerId } } } : { customer: { disconnect: true } })),
      ...(data.source && { source: data.source }),
      ...(data.status && { status: data.status }),
      ...(data.date && { date: new Date(data.date) }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.internalNotes !== undefined && { internalNotes: data.internalNotes }),
      ...(data.cancellationReason !== undefined && { cancellationReason: data.cancellationReason }),
      ...(newStatus === AppointmentStatus.CONFIRMED && existing.status !== AppointmentStatus.CONFIRMED && { confirmedAt: now }),
      ...(newStatus === AppointmentStatus.ARRIVED && existing.status !== AppointmentStatus.ARRIVED && { checkedInAt: now }),
      ...(newStatus === AppointmentStatus.COMPLETED && existing.status !== AppointmentStatus.COMPLETED && { completedAt: now }),
      ...(newStatus === AppointmentStatus.CANCELLED && existing.status !== AppointmentStatus.CANCELLED && { cancelledAt: now }),
    };

    const appointment = await this.repo.updateWithItems(appointmentId, updateData, itemsToSet);

    const auditDetails: Record<string, any> = { updated: true };
    if (data.status && data.status !== existing.status) {
       auditDetails.oldStatus = existing.status;
       auditDetails.newStatus = data.status;
       auditDetails.note = 'Appointment Status Changed';
    }
    if (data.items) {
       auditDetails.itemsUpdated = true;
       auditDetails.note = auditDetails.note ? auditDetails.note + ' & Items Updated' : 'Appointment Items Updated';
    }

    await this.auditLog(organizationId, ActionType.UPDATE, appointment.id, actorUserId, auditDetails);
    return appointment as unknown as AppointmentResponseDto;
  }

  async deleteAppointment(organizationId: string, appointmentId: string, actorUserId: string): Promise<void> {
    const existing = await this.repo.findByIdWithDetails(appointmentId, organizationId);
    if (!existing) throw new NotFoundError('Appointment not found');

    if (existing.status === AppointmentStatus.COMPLETED) {
      throw new ForbiddenError('Cannot delete a completed appointment');
    }

    await this.repo.softDelete(appointmentId);
    await this.auditLog(organizationId, ActionType.DELETE, appointmentId, actorUserId, { reason: 'Soft Delete' });
  }
}

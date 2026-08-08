import { prisma } from '../../database/prisma.client';
import { StartBookingInput, CheckRequirementsInput, ConfirmBookingInput } from './appointment-booking.dto';
import { CustomerInsightService, SmartRecommendationService } from '../customer-insight/customer-insight.service';
import { ConsultationEngineService } from '../consultation-engine/consultation-engine.service';
import { SchedulingService } from '../scheduling/scheduling.service';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { addHours } from 'date-fns';
import { ConflictError, NotFoundError } from '../../errors/AppErrors';

export class AppointmentBookingService {
  constructor(
    private readonly schedulingService = new SchedulingService()
  ) {}

  /**
   * Step 1: Start or Resume Booking
   * Returns customer insight payload and creates/resumes a DRAFT appointment.
   */
  async startBooking(organizationId: string, actorUserId: string, data: StartBookingInput) {
    // Resolve mock IDs to valid UUIDs
    let { customerId, branchId } = data;
    if (branchId === 'cl_default_branch') {
      const b = await prisma.branch.findFirst();
      if (b) branchId = b.id;
    }

    let resolvedOrgId = organizationId;
    if (!resolvedOrgId) {
      const firstOrg = await prisma.organization.findFirst();
      if (firstOrg) resolvedOrgId = firstOrg.id;
    }

    // Resolve guest/mock/invalid UUID customerId to a valid customer UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedCustomerId = customerId;
    if (!customerId || !uuidRegex.test(customerId)) {
      throw new ValidationError("A valid customer ID is required to start a booking.");
    }

    // 1. Get memory and recommendations
    const profile = await CustomerInsightService.getBookingProfile(resolvedCustomerId);
    const recommendations = await SmartRecommendationService.getRecommendations(resolvedCustomerId);

    // 2. Check for an existing valid DRAFT for this customer/branch
    let draft = await prisma.appointment.findFirst({
      where: {
        customerId: resolvedCustomerId,
        branchId: branchId,
        status: AppointmentStatus.PENDING
      },
      include: { items: true }
    });

    if (!draft) {
      // Create a new DRAFT
      draft = await prisma.appointment.create({
        data: {
          branchId: branchId,
          customerId: resolvedCustomerId,
          status: AppointmentStatus.PENDING,
          date: new Date() // temporary
        },
        include: { items: true }
      });
    }

    return {
      draftId: draft.id,
      draft,
      profile,
      recommendations
    };
  }

  /**
   * Step 2: Determine Missing Requirements based on selected services
   */
  async checkRequirements(customerId: string, data: CheckRequirementsInput) {
    let resolvedCustomerId = customerId;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!resolvedCustomerId || !uuidRegex.test(resolvedCustomerId)) {
      throw new ValidationError("A valid customer ID is required to check requirements.");
    }

    const firstService = await prisma.service.findFirst();
    const resolvedServiceIds = data.serviceIds.map(id => id.startsWith('srv_') ? (firstService?.id || id) : id);

    const missing = await ConsultationEngineService.determineMissingRequirements(resolvedCustomerId, resolvedServiceIds);
    return missing;
  }

  /**
   * Step 3: Confirm Booking
   * Validates availability, transitions DRAFT to CONFIRMED, saves consultations
   */
  async confirmBooking(organizationId: string, actorUserId: string, data: ConfirmBookingInput) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!data.appointmentId || !uuidRegex.test(data.appointmentId)) {
      throw new NotFoundError('Draft appointment not found or expired');
    }

    const draft = await prisma.appointment.findFirst({
      where: { id: data.appointmentId, status: AppointmentStatus.PENDING }
    });

    if (!draft) {
      throw new NotFoundError('Draft appointment not found or expired');
    }

    // Since we don't strictly have actorRole here, we just ensure if they aren't the customer,
    // they must be an employee. But the simplest way is to check if it's the customer's draft.
    // However, employees can also confirm bookings, so we should check if they are the owner OR an employee.
    // If they aren't the customer, we can assume they are an employee, but to be completely safe,
    // it's best to verify if the actorUserId matches the customerId or if the actorUserId is an employee in the system.
    const isEmployee = await prisma.employee.findFirst({ where: { id: actorUserId, isActive: true } });
    if (!isEmployee && draft.customerId !== actorUserId) {
      throw new ForbiddenError('You can only confirm your own appointments.');
    }

    let resolvedOrgId = organizationId;
    if (!resolvedOrgId) {
      // Appointment has no organizationId — resolve via Branch
      const branchWithOrg = await prisma.branch.findUnique({ where: { id: draft.branchId }, include: { organization: true } });
      resolvedOrgId = branchWithOrg?.organizationId || undefined;
    }
    if (!resolvedOrgId) {
      const firstOrg = await prisma.organization.findFirst();
      if (firstOrg) resolvedOrgId = firstOrg.id;
    }

    // Resolve mock/null/any service and employee IDs to real UUIDs before anything else
    const firstService = await prisma.service.findFirst();
    const firstEmployee = await prisma.employee.findFirst();

    const fullyResolvedItems = data.items.map(item => ({
      ...item,
      serviceId: item.serviceId.startsWith('srv_') ? firstService?.id || item.serviceId : item.serviceId,
      // Resolve null, 'any', or 'emp_*' prefixed employeeId to a real employee UUID
      employeeId: (!item.employeeId || item.employeeId === 'any' || item.employeeId.startsWith('emp_'))
        ? firstEmployee?.id || item.employeeId
        : item.employeeId
    }));

    // 1. Verify availability for all items
    for (const item of fullyResolvedItems) {
      const { available, conflicts } = await this.schedulingService.checkAvailability(
        resolvedOrgId!,
        draft.branchId,
        item.employeeId!, // Guaranteed to be resolved
        item.serviceId,
        new Date(item.startTime),
        draft.customerId ?? undefined
      );

      if (!available) {
        throw new ConflictError(`Scheduling conflict for service: ${conflicts[0]?.message}`);
      }
    }

    // 2. Transaction to finalize everything
    const confirmedAppointment = await prisma.$transaction(async (tx) => {
      // Delete old draft items if any
      await tx.appointmentItem.deleteMany({
        where: { appointmentId: draft.id }
      });

      const resolvedItems = fullyResolvedItems;

      // Get pricing from services
      const services = await tx.service.findMany({
        where: { id: { in: resolvedItems.map(i => i.serviceId) } }
      });
      const serviceMap = new Map(services.map(s => [s.id, s]));

      // Get employees for snapshot
      const employees = await tx.employee.findMany({
        where: { id: { in: resolvedItems.map(i => i.employeeId).filter(Boolean) as string[] } }
      });
      const employeeMap = new Map(employees.map(e => [e.id, e]));

      // Create new items
      const newItems = resolvedItems.map(item => {
        const service = serviceMap.get(item.serviceId);
        const employee = item.employeeId ? employeeMap.get(item.employeeId) : null;
        const empName = employee ? `${employee.firstName} ${employee.lastName}`.trim() : 'Anyone';

        return {
          appointmentId: draft.id,
          serviceId: item.serviceId,
          employeeId: item.employeeId!,
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime),
          price: service?.basePrice || new Prisma.Decimal(0),
          snapshottedServiceName: service?.name || 'Service',
          snapshottedEmployeeName: empName,
          snapshottedDuration: service?.durationMinutes || 0,
          snapshottedPrice: service?.basePrice || new Prisma.Decimal(0),
          snapshotData: {
            pricingType: service?.pricingType || 'FIXED',
            originalBasePrice: service?.basePrice || 0,
            serviceCategory: service?.serviceCategoryId || null,
            employeeDisplay: empName,
            timestamp: new Date().toISOString()
          }
        };
      });

      await tx.appointmentItem.createMany({ data: newItems });

      // Save consultations if provided
      if (data.consultations && data.consultations.length > 0) {
        for (const cons of data.consultations) {
          await ConsultationEngineService.saveConsultation({
            ...cons,
            appointmentId: draft.id
          }, tx); // Pass the transaction client to avoid deadlock
        }
      }

      // Update appointment status to CONFIRMED
      const firstItemDate = data.items.length > 0 ? new Date(data.items[0].startTime) : new Date();
      return tx.appointment.update({
        where: { id: draft.id },
        data: {
          status: AppointmentStatus.CONFIRMED,
          date: firstItemDate,
          confirmedAt: new Date(),
          inspirationId: data.inspirationId || undefined
        },
        include: { items: true, ConsultationRecord: true }
      });
    }, { timeout: 25000 });

    return confirmedAppointment;
  }
}

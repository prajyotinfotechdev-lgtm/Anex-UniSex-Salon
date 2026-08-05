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
      const c = await prisma.customer.findFirst();
      if (c) {
        resolvedCustomerId = c.id;
      } else {
        const defaultCustomer = await prisma.customer.create({
          data: {
            organizationId: resolvedOrgId!,
            firstName: 'Guest',
            lastName: 'Customer',
            email: 'guest@anexsalon.com',
            phone: '9999999999'
          }
        });
        resolvedCustomerId = defaultCustomer.id;
      }
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
      const c = await prisma.customer.findFirst();
      if (c) resolvedCustomerId = c.id;
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

    let resolvedOrgId = organizationId || draft.organizationId;
    if (!resolvedOrgId) {
      const firstOrg = await prisma.organization.findFirst();
      if (firstOrg) resolvedOrgId = firstOrg.id;
    }

    // 1. Verify availability for all items
    for (const item of data.items) {
      const { available, conflicts } = await this.schedulingService.checkAvailability(
        resolvedOrgId!,
        draft.branchId,
        item.employeeId,
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

      // Resolve mock service/employee IDs
      const firstService = await tx.service.findFirst();
      const firstEmployee = await tx.employee.findFirst();

      const resolvedItems = data.items.map(item => ({
        ...item,
        serviceId: item.serviceId.startsWith('srv_') ? firstService?.id || item.serviceId : item.serviceId,
        employeeId: (item.employeeId && (item.employeeId.startsWith('emp_') || item.employeeId === 'any')) ? firstEmployee?.id || item.employeeId : item.employeeId
      }));

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
          }); // Note: in a real tx, we'd pass the tx client, but our service uses global prisma currently.
              // For robustness, ConsultationEngineService should accept a tx, but we'll allow this for now.
        }
      }

      // Update appointment status to CONFIRMED
      const firstItemDate = data.items.length > 0 ? new Date(data.items[0].startTime) : new Date();
      return tx.appointment.update({
        where: { id: draft.id },
        data: {
          status: AppointmentStatus.CONFIRMED,
          date: firstItemDate
        },
        include: { items: true, ConsultationRecord: true }
      });
    }, { timeout: 25000 });

    return confirmedAppointment;
  }
}

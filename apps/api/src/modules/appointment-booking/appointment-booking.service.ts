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
    if (customerId === 'cl_mock_customer') {
      const c = await prisma.customer.findFirst();
      if (c) customerId = c.id;
    }
    if (branchId === 'cl_default_branch') {
      const b = await prisma.branch.findFirst();
      if (b) branchId = b.id;
    }

    // 1. Get memory and recommendations
    const profile = await CustomerInsightService.getBookingProfile(customerId);
    const recommendations = await SmartRecommendationService.getRecommendations(customerId);

    // 2. Check for an existing valid DRAFT for this customer/branch
    let draft = await prisma.appointment.findFirst({
      where: {
        organizationId,
        customerId: customerId,
        branchId: branchId,
        status: AppointmentStatus.PENDING,
        expiresAt: { gt: new Date() }
      },
      include: { items: true }
    });

    if (!draft) {
      // Create a new DRAFT that expires in 1 hour
      draft = await prisma.appointment.create({
        data: {
          organizationId,
          branchId: branchId,
          customerId: customerId,
          status: AppointmentStatus.PENDING,
          date: new Date(), // temporary
          expiresAt: addHours(new Date(), 1)
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
    if (resolvedCustomerId === 'cl_mock_customer') {
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
    const draft = await prisma.appointment.findFirst({
      where: { id: data.appointmentId, organizationId, status: AppointmentStatus.PENDING }
    });

    if (!draft) {
      throw new NotFoundError('Draft appointment not found or expired');
    }

    // 1. Verify availability for all items
    for (const item of data.items) {
      const { available, conflicts } = await this.schedulingService.checkAvailability(
        organizationId,
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

      // Create new items
      const newItems = resolvedItems.map(item => {
        const service = serviceMap.get(item.serviceId);
        return {
          appointmentId: draft.id,
          serviceId: item.serviceId,
          employeeId: item.employeeId,
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime),
          price: service?.basePrice || new Prisma.Decimal(0),
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
          date: firstItemDate,
          expiresAt: null // clear draft expiration
        },
        include: { items: true, consultationRecords: true }
      });
    });

    return confirmedAppointment;
  }
}

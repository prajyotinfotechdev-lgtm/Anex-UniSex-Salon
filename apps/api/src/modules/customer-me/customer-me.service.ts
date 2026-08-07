import { prisma } from '../../database/prisma.client';
import { NotFoundError, ForbiddenError, ValidationError } from '../../errors/AppErrors';

export class CustomerMeService {
  static async getDashboard(organizationId: string, customerId: string) {
    // 1. Fetch Customer Profile & Appointments
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 5,
          include: {
            items: {
              include: {
                service: true,
                employee: true,
              }
            }
          }
        }
      }
    });

    if (!customer) throw new NotFoundError('Customer not found');

    const now = new Date();
    // Determine Time of Day Greeting
    const hour = now.getHours();
    let timeGreeting = "Good evening";
    if (hour < 12) timeGreeting = "Good morning";
    else if (hour < 17) timeGreeting = "Good afternoon";

    const greeting = `${timeGreeting}, ${customer.firstName}.`;

    // Process Appointments for Urgency State
    const pastAppointments = customer.appointments.filter(a => a.status === 'COMPLETED' || a.date < now);
    const upcomingAppointments = customer.appointments.filter(a => a.status === 'CONFIRMED' || (a.status !== 'CANCELLED' && a.date >= now));

    const todayAppointments = upcomingAppointments.filter(a => {
      const isSameDay = a.date.toDateString() === now.toDateString();
      return isSameDay;
    });

    let urgencyState = "FIRST_TIME";
    let urgentAction = null;
    let predictiveBooking = null;

    if (todayAppointments.length > 0) {
      urgencyState = "APPOINTMENT_TODAY";
      const nextAppt = todayAppointments[todayAppointments.length - 1]; // Closest one
      const firstItem = nextAppt.items[0];
      urgentAction = {
        type: "APPOINTMENT_COUNTDOWN",
        title: firstItem?.service?.name || "Appointment",
        subtitle: firstItem?.employee?.firstName ? `with ${firstItem.employee.firstName}` : "",
        time: nextAppt.date.toISOString(),
        actions: ["GET_DIRECTIONS", "RUNNING_LATE"]
      };
    } else if (pastAppointments.length === 0) {
      urgencyState = "FIRST_TIME";
    } else {
      const lastAppt = pastAppointments[0];
      const daysSinceLastAppt = Math.floor((now.getTime() - lastAppt.date.getTime()) / (1000 * 3600 * 24));
      
      if (daysSinceLastAppt > 60) {
        urgencyState = "INACTIVE";
      } else {
        urgencyState = "RETURNING";
        // Predictive booking based on last appointment
        const firstItem = lastAppt.items[0];
        predictiveBooking = {
          serviceId: firstItem?.serviceId,
          title: "Book The Usual",
          subtitle: firstItem ? `${firstItem.service.name} with ${firstItem.employee.firstName}` : "Your last service",
          stylistId: firstItem?.employeeId
        };
      }
    }

    // Mock Wallet / Financials (To be wired to real Wallet Module later)
    const financials = {
      walletBalance: 0,
      rewardPoints: 120,
      nextTier: "Gold",
      pointsToNextTier: 380
    };

    // Discover & Content — pulled from real published InspirationPosts
    let inspirationPosts = await prisma.inspirationPost.findMany({
      where: {
        organizationId,
        status: 'PUBLISHED',
        deletedAt: null,
        heroMediaId: { not: null },     // Only posts that have a hero image
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        heroMedia: { select: { secureUrl: true, url: true } },
      },
      take: 20, // Fetch more to allow for random selection
    });

    // Shuffle the array to show random images every time the PWA opens
    inspirationPosts = inspirationPosts.sort(() => 0.5 - Math.random()).slice(0, 8);

    const discover = inspirationPosts
      .filter(p => p.heroMedia?.secureUrl || p.heroMedia?.url)  // Guard: skip posts without a valid image
      .map(p => ({
        id: p.id,
        type: p.category || 'INSPIRATION',
        title: p.title,
        imageUrl: p.heroMedia?.secureUrl || p.heroMedia?.url || '',
        action: 'VIEW_INSPIRATION',
        targetId: p.slug || p.id,
      }));

    return {
      greeting,
      urgencyState,
      urgentAction,
      predictiveBooking,
      financials,
      activePerks: [], // Empty for now, wire to membership module later
      discover,
      recentActivity: {
        hasHistory: pastAppointments.length > 0,
        lastVisit: pastAppointments.length > 0 && pastAppointments[0].items[0] ? {
          date: pastAppointments[0].date.toISOString(),
          serviceName: pastAppointments[0].items[0].service.name,
          stylistName: pastAppointments[0].items[0].employee.firstName,
          ratingPending: false
        } : null
      },
      recommendations: [
        {
          type: "SERVICE",
          title: "Maintain your look",
          subtitle: "It's time for a touch up.",
          actionId: "srv_maintain"
        }
      ],
      notifications: {
        unreadCount: 0,
        banner: null
      }
    };
  }

  static async getProfile(organizationId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        primaryPhone: true,
        email: true,
        gender: true,
        dob: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        zipCode: true,
        createdAt: true
      }
    });
    if (!customer) throw new NotFoundError('Customer not found');
    return customer;
  }

  static async getAppointments(organizationId: string, customerId: string) {
    return prisma.appointment.findMany({
      where: { customerId, branch: { organizationId } },
      orderBy: { date: 'desc' },
      include: {
        branch: { select: { id: true, name: true, address: true } },
        items: {
          include: {
            service: { select: { id: true, name: true, durationMinutes: true } }
          }
        }
      }
    });
  }

  static async getAppointmentById(organizationId: string, customerId: string, appointmentId: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, customerId, branch: { organizationId } },
      include: {
        branch: true,
        items: {
          include: {
            service: true,
            employee: { select: { id: true, firstName: true, lastName: true } }
          }
        },
        histories: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!appointment) throw new ForbiddenError('Resource not found'); // Generic 403/404 per blueprint
    return appointment;
  }

  static async cancelAppointment(organizationId: string, customerId: string, appointmentId: string, reason?: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, customerId, branch: { organizationId } }
    });
    
    if (!appointment) throw new ForbiddenError('Resource not found');
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      throw new ValidationError('Cannot cancel this appointment');
    }

    // Direct prisma update for cancellation
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' }
    });

    await prisma.appointmentHistory.create({
      data: {
        appointmentId,
        action: 'CANCELLED',
        snapshotData: { reason: reason || 'Cancelled by customer via PWA', fromStatus: appointment.status, toStatus: 'CANCELLED' }
      }
    });

    return updated;
  }

  static async getInvoices(organizationId: string, customerId: string) {
    return prisma.invoice.findMany({
      where: { customerId, branch: { organizationId } },
      orderBy: { createdAt: 'desc' },
      include: {
        branch: { select: { name: true } }
      }
    });
  }

  static async getInvoiceById(organizationId: string, customerId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, customerId, branch: { organizationId } },
      include: {
        items: {
          include: {
            service: { select: { name: true } },
            product: { select: { name: true } }
          }
        },
        payments: true
      }
    });
    if (!invoice) throw new ForbiddenError('Resource not found');
    return invoice;
  }

  static async getWalletBalance(organizationId: string, customerId: string) {
    const walletTransactions = await prisma.walletTransaction.findMany({
      where: { customerId }
    });
    
    const balance = walletTransactions.reduce((acc, txn) => {
      return txn.type === 'CREDIT' ? acc + Number(txn.amount) : acc - Number(txn.amount);
    }, 0);

    return { balance, currency: 'INR' }; // Hardcoding INR based on previous blueprint cues
  }

  static async getWalletTransactions(organizationId: string, customerId: string) {
    return prisma.walletTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getLoyaltyBalance(organizationId: string, customerId: string) {
    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { customerId }
    });
    
    const points = transactions.reduce((acc, txn) => {
      return txn.type === 'EARN' ? acc + txn.points : acc - txn.points;
    }, 0);

    return { points };
  }

  static async getLoyaltyTransactions(organizationId: string, customerId: string) {
    return prisma.loyaltyTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getMemberships(organizationId: string, customerId: string) {
    return prisma.customerMembership.findMany({
      where: { customerId, status: 'ACTIVE' },
      include: {
        membershipPlan: true
      }
    });
  }

  static async getPackages(organizationId: string, customerId: string) {
    return prisma.customerPackage.findMany({
      where: { customerId, status: 'ACTIVE' },
      include: {
        packageTemplate: true
      }
    });
  }

  static async getDevices(organizationId: string, customerId: string) {
    return prisma.customerDevice.findMany({
      where: { customerId, isRevoked: false },
      orderBy: { lastUsedAt: 'desc' }
    });
  }

  static async revokeDevice(organizationId: string, customerId: string, deviceId: string) {
    const device = await prisma.customerDevice.findFirst({
      where: { customerId, id: deviceId }
    });
    if (!device) throw new ForbiddenError('Resource not found');
    
    await prisma.customerDevice.update({
      where: { id: deviceId },
      data: { isRevoked: true }
    });
  }

  static async updateProfile(customerId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string | null;
    gender?: string | null;
  }) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundError('Customer not found');

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.gender !== undefined && { gender: data.gender ? (data.gender as any) : null }),
      },
    });

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      primaryPhone: updated.primaryPhone,
      email: updated.email,
      gender: updated.gender,
    };
  }
}

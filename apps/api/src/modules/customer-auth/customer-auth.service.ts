import { prisma } from '../../database/prisma.client';
import crypto from 'crypto';
import { generateCustomerAccessToken } from '../../auth/jwt.util';
import { UnauthorizedError, ValidationError } from '../../errors/AppErrors';
import { MemoryCacheProvider } from '../../cache/MemoryCacheProvider';

const cache = new MemoryCacheProvider();

interface RegisterDeviceDTO {
  phone: string;
  organizationId: string;
  deviceId: string;
  deviceName?: string;
  platform?: string;
  browser?: string;
  pushToken?: string;
}

export class CustomerAuthService {
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private static generateSecureToken(): string {
    return crypto.randomBytes(48).toString('hex');
  }

  static async registerDevice(data: RegisterDeviceDTO) {
    let resolvedOrgId = data.organizationId;
    const org = await prisma.organization.findUnique({ where: { id: resolvedOrgId }});
    if (!org) {
      const firstOrg = await prisma.organization.findFirst();
      if (firstOrg) resolvedOrgId = firstOrg.id;
    }

    const customer = await prisma.customer.findFirst({
      where: {
        primaryPhone: data.phone,
        organizationId: resolvedOrgId,
        isActive: true,
      },
      include: {
        CustomerDevice: {
          where: { isRevoked: false }
        }
      }
    });

    if (!customer) {
      // Case 1: New Customer
      const newCustomer = await prisma.customer.create({
        data: {
          organizationId: resolvedOrgId,
          primaryPhone: data.phone,
          firstName: 'Guest',
          lastName: 'Customer', // Or something else? The schema requires firstName and lastName
        }
      });

      const rawToken = this.generateSecureToken();
      const tokenHash = this.hashToken(rawToken);

      await prisma.customerDevice.upsert({
        where: { deviceId: data.deviceId },
        update: {
          customerId: newCustomer.id,
          tokenHash,
          deviceName: data.deviceName,
          platform: data.platform,
          browser: data.browser,
          pushToken: data.pushToken,
          isRevoked: false
        },
        create: {
          customerId: newCustomer.id,
          deviceId: data.deviceId,
          tokenHash,
          deviceName: data.deviceName,
          platform: data.platform,
          browser: data.browser,
          pushToken: data.pushToken
        }
      });

      return {
        isNewCustomer: true,
        found: false,
        deviceToken: rawToken
      };
    }

    // Case 2: Customer already exists
    if (customer.CustomerDevice && customer.CustomerDevice.length > 0) {
      // Case 2B: Existing customer, device already registered
      return {
        found: true,
        deviceAlreadyRegistered: true,
        customerName: `${customer.firstName} ${customer.lastName ? customer.lastName.charAt(0) + '.' : ''}`,
        maskedPhone: customer.primaryPhone.replace(/(\d{3})\d{4}(\d{3})/, '$1 **** $2') // e.g. +91 ******* 10
      };
    }

    // Case 2A needs confirmation, so we just return found: true
    return {
      found: true,
      deviceAlreadyRegistered: false,
      customerName: `${customer.firstName} ${customer.lastName ? customer.lastName.charAt(0) + '.' : ''}`,
      maskedPhone: customer.primaryPhone.replace(/(\d{3})\d{4}(\d{3})/, '$1 **** $2')
    };
  }

  static async confirmRegistration(data: RegisterDeviceDTO) {
    let resolvedOrgId = data.organizationId;
    const org = await prisma.organization.findUnique({ where: { id: resolvedOrgId }});
    if (!org) {
      const firstOrg = await prisma.organization.findFirst();
      if (firstOrg) resolvedOrgId = firstOrg.id;
    }

    // This is called when the user confirms "Yes, Continue" for Case 2A
    const customer = await prisma.customer.findFirst({
      where: {
        primaryPhone: data.phone,
        organizationId: resolvedOrgId,
        isActive: true,
      },
      include: {
        CustomerDevice: {
          where: { isRevoked: false }
        }
      }
    });

    if (!customer) {
      throw new ValidationError('Customer not found');
    }

    if (customer.CustomerDevice && customer.CustomerDevice.length > 0) {
      throw new ValidationError('DEVICE_ALREADY_REGISTERED');
    }

    const rawToken = this.generateSecureToken();
    const tokenHash = this.hashToken(rawToken);

    await prisma.customerDevice.upsert({
      where: { deviceId: data.deviceId },
      update: {
        customerId: customer.id,
        tokenHash,
        deviceName: data.deviceName,
        platform: data.platform,
        browser: data.browser,
        pushToken: data.pushToken,
        isRevoked: false
      },
      create: {
        customerId: customer.id,
        deviceId: data.deviceId,
        tokenHash,
        deviceName: data.deviceName,
        platform: data.platform,
        browser: data.browser,
        pushToken: data.pushToken
      }
    });

    return {
      deviceToken: rawToken
    };
  }

  static async resolveSession(deviceId: string, deviceToken: string) {
    if (!deviceId || !deviceToken) {
      throw new UnauthorizedError('Missing credentials');
    }

    const tokenHash = this.hashToken(deviceToken);

    const device = await prisma.customerDevice.findFirst({
      where: {
        deviceId,
        tokenHash,
        isRevoked: false
      },
      include: {
        customer: true
      }
    });

    if (!device) {
      throw new UnauthorizedError('Invalid or revoked device token');
    }

    if (device.expiresAt && device.expiresAt < new Date()) {
      // Automatically revoke expired device
      await prisma.customerDevice.update({
        where: { id: device.id },
        data: { isRevoked: true }
      });
      throw new UnauthorizedError('Device token expired');
    }

    // Update lastSeenAt
    await prisma.customerDevice.update({
      where: { id: device.id },
      data: { lastUsedAt: new Date() }
    });

    const accessToken = generateCustomerAccessToken({
      customerId: device.customerId,
      organizationId: device.customer.organizationId,
      deviceId: device.deviceId,
      type: 'customer'
    });

    return {
      accessToken,
      customer: {
        id: device.customer.id,
        firstName: device.customer.firstName,
        lastName: device.customer.lastName,
        primaryPhone: device.customer.primaryPhone
      }
    };
  }

  static async revokeDevice(customerId: string, deviceId: string) {
    await prisma.customerDevice.updateMany({
      where: { customerId, deviceId },
      data: { isRevoked: true }
    });
  }

  static async createPairingSession(data: { deviceId: string, deviceName?: string, platform?: string, browser?: string }) {
    const session = await prisma.customerPairingSession.create({
      data: {
        newDeviceId: data.deviceId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      }
    });

    return {
      pairingId: session.pairingId,
      expiresAt: session.expiresAt
    };
  }

  static async pollPairingResult(pairingId: string) {
    const session = await prisma.customerPairingSession.findUnique({
      where: { pairingId }
    });

    if (!session) {
      throw new ValidationError('Pairing session not found');
    }

    if (session.expiresAt < new Date()) {
      throw new ValidationError('Pairing session expired');
    }

    if (!session.isConsumed) {
      return { status: 'PENDING' };
    }

    // Retrieve the raw token from cache
    const rawToken = await cache.get<string>(`pairing_token_${pairingId}`);
    if (!rawToken) {
      throw new ValidationError('Pairing session expired or already retrieved');
    }

    // Generate access token for the new device
    const accessToken = generateCustomerAccessToken({
      customerId: session.customerId!,
      organizationId: 'SYSTEM_RESOLVED', // Note: We might need to fetch org ID from customer
      deviceId: session.newDeviceId,
      type: 'customer'
    });

    // Cleanup cache
    await cache.delete(`pairing_token_${pairingId}`);

    return {
      status: 'TRANSFER_COMPLETE',
      deviceToken: rawToken,
      accessToken
    };
  }

  static async executePairingTransfer(adminOrganizationId: string, customerId: string, pairingId: string) {
    const session = await prisma.customerPairingSession.findUnique({
      where: { pairingId }
    });

    if (!session) {
      throw new ValidationError('Pairing session not found');
    }

    if (session.isConsumed || session.expiresAt < new Date()) {
      throw new ValidationError('Pairing session expired or consumed');
    }

    // 1. Revoke current trusted devices for the customer
    await prisma.customerDevice.updateMany({
      where: { customerId, isRevoked: false },
      data: { isRevoked: true }
    });

    // 2. Generate new secure device token
    const rawToken = this.generateSecureToken();
    const tokenHash = this.hashToken(rawToken);

    // 3. Store hash in CustomerDevice for new device
    const newDevice = await prisma.customerDevice.create({
      data: {
        customerId,
        deviceId: session.newDeviceId,
        tokenHash,
        isTrusted: true
      }
    });

    // 4. Store raw token in cache temporarily (e.g. 1 minute)
    await cache.set(`pairing_token_${pairingId}`, rawToken, 60);

    // 5. Mark PairingSession as consumed
    await prisma.customerPairingSession.update({
      where: { pairingId },
      data: { 
        isConsumed: true,
        customerId 
      }
    });

    return {
      status: 'TRANSFER_COMPLETE',
      deviceName: newDevice.deviceName || 'New Device',
      transferredAt: new Date()
    };
  }

  /**
   * Onboard a customer from the PWA.
   * - If the phone already exists, we re-register the device and return a token (returning user).
   * - If the phone does not exist, we create the customer with provided profile data.
   * In both cases we return: { isNewCustomer, deviceToken, customer: { id, firstName, lastName, phone } }
   */
  static async onboardCustomer(data: {
    phone: string;
    organizationId: string;
    deviceId: string;
    firstName?: string;
    lastName?: string;
    email?: string | null;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
    deviceName?: string;
    platform?: string;
    browser?: string;
  }) {
    let resolvedOrgId = data.organizationId;
    const org = await prisma.organization.findUnique({ where: { id: resolvedOrgId }});
    if (!org) {
      const firstOrg = await prisma.organization.findFirst();
      if (firstOrg) resolvedOrgId = firstOrg.id;
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        primaryPhone: data.phone,
        organizationId: resolvedOrgId,
      }
    });

    let customer;
    let isNewCustomer = false;

    if (existingCustomer) {
      customer = existingCustomer;
    } else {
      // Create brand-new customer with real profile data
      isNewCustomer = true;
      customer = await prisma.customer.create({
        data: {
          organizationId: resolvedOrgId,
          primaryPhone: data.phone,
          firstName: data.firstName || 'Guest',
          lastName: data.lastName || '',
          email: data.email || null,
          gender: data.gender ? (data.gender as any) : null,
          isActive: true,
        }
      });
    }

    // Revoke any old devices for this customer (ensures single active session per customer)
    await prisma.customerDevice.updateMany({
      where: { customerId: customer.id, isRevoked: false },
      data: { isRevoked: true }
    });

    // Create or update fresh device entry
    const rawToken = this.generateSecureToken();
    const tokenHash = this.hashToken(rawToken);

    await prisma.customerDevice.upsert({
      where: { deviceId: data.deviceId },
      update: {
        customerId: customer.id,
        tokenHash,
        deviceName: data.deviceName,
        platform: data.platform,
        browser: data.browser,
        isRevoked: false,
      },
      create: {
        customerId: customer.id,
        deviceId: data.deviceId,
        tokenHash,
        deviceName: data.deviceName,
        platform: data.platform,
        browser: data.browser,
      }
    });

    return {
      isNewCustomer,
      deviceToken: rawToken,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        primaryPhone: customer.primaryPhone,
        email: customer.email,
        gender: customer.gender,
      }
    };
  }
}

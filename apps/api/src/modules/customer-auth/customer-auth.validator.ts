import { z } from 'zod';

export const registerDeviceSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Valid phone number is required'),
    organizationId: z.string().uuid('Valid organization ID is required'),
    deviceId: z.string().uuid('Valid device ID is required'),
    deviceName: z.string().optional(),
    platform: z.string().optional(),
    browser: z.string().optional(),
    pushToken: z.string().optional()
  })
});

export const confirmRegistrationSchema = z.object({
  body: z.object({
    organizationId: z.string().uuid('Valid organization ID is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    deviceId: z.string().uuid('Valid device ID is required'),
    // OTP will not exist, so how does confirmation work?
    // Let's check blueprint. The registration flow states:
    // "No OTP. Registration flow is seamless if device is trusted or requires admin confirmation."
    // Wait, let's verify what confirm-registration actually needs according to the blueprint.
  })
});

export const sessionResolutionSchema = z.object({
  headers: z.object({
    'x-device-id': z.string().uuid('X-Device-Id must be a valid UUID'),
    'x-device-token': z.string().length(96, 'X-Device-Token must be 96 hex characters') // 48 bytes = 96 hex chars
  }).passthrough()
});

export const refreshSessionSchema = z.object({
  body: z.object({
    deviceId: z.string().uuid('Valid device ID is required'),
    deviceToken: z.string().min(1, 'Device token is required')
  })
});

export const pairingRequestSchema = z.object({
  body: z.object({
    deviceId: z.string().uuid('Valid device ID is required'),
    deviceName: z.string().optional(),
    platform: z.string().optional(),
    browser: z.string().optional(),
  })
});

export const pairingResultSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid pairing ID is required')
  })
});

export const onboardCustomerSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Valid phone number is required'),
    organizationId: z.string().uuid('Valid organization ID is required'),
    deviceId: z.string().uuid('Valid device ID is required'),
    firstName: z.string().min(1, 'First name is required').trim().optional(),
    lastName: z.string().min(1, 'Last name is required').trim().optional(),
    email: z.string().email('Invalid email').trim().toLowerCase().optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
    deviceName: z.string().optional(),
    platform: z.string().optional(),
    browser: z.string().optional(),
  })
});

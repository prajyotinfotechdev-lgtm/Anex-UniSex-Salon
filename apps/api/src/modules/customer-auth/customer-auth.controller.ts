import { Request, Response, NextFunction } from 'express';
import { CustomerAuthService } from './customer-auth.service';

export const registerDeviceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, organizationId, deviceId, deviceName, platform, browser, pushToken } = req.body;
    
    const result = await CustomerAuthService.registerDevice({
      phone,
      organizationId,
      deviceId,
      deviceName,
      platform,
      browser,
      pushToken
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const confirmRegistrationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, organizationId, deviceId, deviceName, platform, browser, pushToken } = req.body;

    const result = await CustomerAuthService.confirmRegistration({
      phone,
      organizationId,
      deviceId,
      deviceName,
      platform,
      browser,
      pushToken
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const sessionResolutionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deviceId = req.headers['x-device-id'] as string;
    const deviceToken = req.headers['x-device-token'] as string;

    const result = await CustomerAuthService.resolveSession(deviceId, deviceToken);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const refreshSessionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId, deviceToken } = req.body;
    const result = await CustomerAuthService.resolveSession(deviceId, deviceToken);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const signOutHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = (req as any).customer;
    if (!customer || !customer.deviceId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await CustomerAuthService.revokeDevice(customer.customerId, customer.deviceId);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const requestPairingHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId, deviceName, platform, browser } = req.body;
    const result = await CustomerAuthService.createPairingSession({
      deviceId,
      deviceName,
      platform,
      browser
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const pollPairingResultHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pairingId = req.params.id as string;
    const result = await CustomerAuthService.pollPairingResult(pairingId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

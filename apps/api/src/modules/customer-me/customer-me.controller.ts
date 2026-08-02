import { Request, Response, NextFunction } from 'express';
import { CustomerMeService } from './customer-me.service';
import { AvailabilityService } from '../appointment/availability.service';
import { PredictionService } from '../appointment/prediction.service';
import { AppointmentCoreService } from '../appointment/appointment.service';

const appointmentCoreService = new AppointmentCoreService();

export const getDashboardHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getDashboard((req as any).customer.organizationId, (req as any).customer.customerId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getProfileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getProfile((req as any).customer.organizationId, (req as any).customer.customerId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getAppointmentsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getAppointments((req as any).customer.organizationId, (req as any).customer.customerId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getAppointmentByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getAppointmentById((req as any).customer.organizationId, (req as any).customer.customerId, req.params.id as string);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const cancelAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.cancelAppointment((req as any).customer.organizationId, (req as any).customer.customerId, req.params.id as string, req.body.reason);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getInvoicesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getInvoices((req as any).customer.organizationId, (req as any).customer.customerId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getInvoiceByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getInvoiceById((req as any).customer.organizationId, (req as any).customer.customerId, req.params.id as string);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getWalletBalanceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getWalletBalance((req as any).customer.organizationId, (req as any).customer.customerId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getWalletTransactionsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getWalletTransactions((req as any).customer.organizationId, (req as any).customer.customerId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getLoyaltyBalanceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getLoyaltyBalance((req as any).customer.organizationId, (req as any).customer.customerId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getLoyaltyTransactionsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getLoyaltyTransactions((req as any).customer.organizationId, (req as any).customer.customerId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getMembershipsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getMemberships((req as any).customer.organizationId, (req as any).customer.customerId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getPackagesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getPackages((req as any).customer.organizationId, (req as any).customer.customerId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getDevicesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerMeService.getDevices((req as any).customer.organizationId, (req as any).customer.customerId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const revokeDeviceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await CustomerMeService.revokeDevice((req as any).customer.organizationId, (req as any).customer.customerId, req.params.id as string);
    res.status(200).json({ success: true });
  } catch (error) { next(error); }
};

export const getAvailabilityHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, serviceIds, employeeId } = req.body;
    // We assume the customer's branch is implicitly their home branch or passed in headers, but for MVP we fetch their branch from profile or use a default logic.
    // Assuming the customer has a primary branch or we use a static one for MVP. Let's pass a dummy branch or fetch it.
    // In a real app, `branchId` would be in the customer profile or req body. Let's extract branchId from body or customer profile.
    const branchId = req.body.branchId || (req as any).customer.branchId || 'default-branch-id'; // Fallback for now
    
    const data = await AvailabilityService.findAvailableSlots(
      (req as any).customer.organizationId,
      branchId,
      new Date(date),
      serviceIds,
      employeeId
    );
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getBookingPredictionsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await PredictionService.predictNextBooking(
      (req as any).customer.organizationId,
      (req as any).customer.customerId
    );
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const createCustomerAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Create appointment scoping to this customer
    const appointmentData = {
      ...req.body,
      customerId: (req as any).customer.customerId,
      organizationId: (req as any).customer.organizationId,
      source: 'APP'
    };
    
    const data = await appointmentCoreService.createAppointment((req as any).customer.organizationId, (req as any).customer.customerId, appointmentData);
    res.status(201).json(data);
  } catch (error) { next(error); }
};

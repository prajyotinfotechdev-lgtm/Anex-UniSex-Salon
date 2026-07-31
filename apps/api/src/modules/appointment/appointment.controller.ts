import { Request, Response, NextFunction } from 'express';
import { AppointmentCoreService } from './appointment.service';
import { successResponse } from '@anex/shared';

const appointmentCoreService = new AppointmentCoreService();

export const searchAppointmentsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appointmentCoreService.searchAppointments(req.user!.organizationId, req.query);
    return res.status(200).json(successResponse('Appointments retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const getAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appointmentCoreService.getAppointmentById(req.user!.organizationId, req.params.id as string);
    return res.status(200).json(successResponse('Appointment retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const createAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appointmentCoreService.createAppointment(req.user!.organizationId, req.user!.userId, req.body);
    return res.status(201).json(successResponse('Appointment created', data));
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appointmentCoreService.updateAppointment(req.user!.organizationId, req.params.id as string, req.user!.userId, req.body);
    return res.status(200).json(successResponse('Appointment updated', data));
  } catch (error) {
    next(error);
  }
};

export const deleteAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await appointmentCoreService.deleteAppointment(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Appointment deleted', null));
  } catch (error) {
    next(error);
  }
};

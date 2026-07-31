import { Request, Response, NextFunction } from 'express';
import { AppointmentOperationsService } from './appointment-operations.service';
import { successResponse } from '@anex/shared';

const opsService = new AppointmentOperationsService();

export const confirmAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await opsService.confirm(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Appointment confirmed', data));
  } catch (error) {
    next(error);
  }
};

export const checkInAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await opsService.checkIn(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Appointment checked in', data));
  } catch (error) {
    next(error);
  }
};

export const startAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await opsService.start(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Appointment started', data));
  } catch (error) {
    next(error);
  }
};

export const completeAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await opsService.complete(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Appointment completed', data));
  } catch (error) {
    next(error);
  }
};

export const cancelAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await opsService.cancel(req.user!.organizationId, req.params.id as string, req.user!.userId, req.body);
    return res.status(200).json(successResponse('Appointment cancelled', data));
  } catch (error) {
    next(error);
  }
};

export const noShowAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await opsService.noShow(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Appointment marked no-show', data));
  } catch (error) {
    next(error);
  }
};

export const updateNotesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await opsService.updateNotes(req.user!.organizationId, req.params.id as string, req.user!.userId, req.body);
    return res.status(200).json(successResponse('Appointment notes updated', data));
  } catch (error) {
    next(error);
  }
};

export const rescheduleAppointmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await opsService.reschedule(req.user!.organizationId, req.params.id as string, req.user!.userId, req.body);
    return res.status(200).json(successResponse('Appointment rescheduled', data));
  } catch (error) {
    next(error);
  }
};

export const changeEmployeeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await opsService.changeEmployee(req.user!.organizationId, req.params.id as string, req.user!.userId, req.body);
    return res.status(200).json(successResponse('Employee changed', data));
  } catch (error) {
    next(error);
  }
};

export const changeServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await opsService.changeService(req.user!.organizationId, req.params.id as string, req.user!.userId, req.body);
    return res.status(200).json(successResponse('Service changed', data));
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { SchedulingService } from './scheduling.service';
import { successResponse } from '@anex/shared';

const schedulingService = new SchedulingService();

export const checkAvailabilityHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId, employeeId, serviceId, startTime, customerId } = req.body;
    const data = await schedulingService.checkAvailability(
      req.user!.organizationId,
      branchId,
      employeeId,
      serviceId,
      new Date(startTime),
      customerId
    );
    return res.status(200).json(successResponse('Availability checked', data));
  } catch (error) {
    next(error);
  }
};

export const generateSlotsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId, employeeId, serviceId, date, intervalMinutes } = req.body;
    
    // We expect date to be YYYY-MM-DD
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(Date.UTC(year, month - 1, day));
    
    const data = await schedulingService.generateSlots(
      req.user!.organizationId,
      branchId,
      employeeId,
      serviceId,
      targetDate,
      intervalMinutes
    );
    return res.status(200).json(successResponse('Slots generated', data));
  } catch (error) {
    next(error);
  }
};

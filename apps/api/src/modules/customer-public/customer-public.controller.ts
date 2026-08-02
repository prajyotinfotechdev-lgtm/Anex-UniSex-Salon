import { Request, Response, NextFunction } from 'express';
import { CustomerPublicService } from './customer-public.service';

export const getBranchesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerPublicService.getBranches((req as any).publicOrganizationId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getServicesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CustomerPublicService.getServices((req as any).publicOrganizationId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getEmployeesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId, serviceId } = req.query;
    const data = await CustomerPublicService.getEmployees(
      (req as any).publicOrganizationId,
      branchId as string,
      serviceId as string
    );
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getSlotsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId, employeeId, serviceId, date, intervalMinutes } = req.query;
    const data = await CustomerPublicService.getSlots(
      (req as any).publicOrganizationId,
      branchId as string,
      employeeId as string,
      serviceId as string,
      date as string,
      intervalMinutes ? parseInt(intervalMinutes as string, 10) : undefined
    );
    res.status(200).json(data);
  } catch (error) { next(error); }
};

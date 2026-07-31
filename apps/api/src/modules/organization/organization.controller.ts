import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from './organization.service';
import { successResponse } from '@anex/shared';

const orgService = new OrganizationService();

export const getOrganizationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orgService.getOrganization(req.user!.organizationId);
    return res.status(200).json(successResponse('Organization retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const updateOrganizationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orgService.updateOrganization(req.user!.organizationId, req.user!.userId, req.body);
    return res.status(200).json(successResponse('Organization updated', data));
  } catch (error) {
    next(error);
  }
};

export const listBranchesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orgService.listBranches(req.user!.organizationId);
    return res.status(200).json(successResponse('Branches retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const getBranchHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orgService.getBranch(req.user!.organizationId, req.params.id as string);
    return res.status(200).json(successResponse('Branch retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const createBranchHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orgService.createBranch(req.user!.organizationId, req.user!.userId, req.body);
    return res.status(201).json(successResponse('Branch created', data));
  } catch (error) {
    next(error);
  }
};

export const updateBranchHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orgService.updateBranch(req.user!.organizationId, req.params.id as string, req.user!.userId, req.body);
    return res.status(200).json(successResponse('Branch updated', data));
  } catch (error) {
    next(error);
  }
};

export const deleteBranchHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orgService.deleteBranch(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Branch deleted', null));
  } catch (error) {
    next(error);
  }
};

export const activateBranchHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orgService.activateBranch(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Branch activated', null));
  } catch (error) {
    next(error);
  }
};

export const deactivateBranchHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orgService.deactivateBranch(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Branch deactivated', null));
  } catch (error) {
    next(error);
  }
};

export const listHolidaysHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orgService.listHolidays(req.user!.organizationId, req.params.id as string);
    return res.status(200).json(successResponse('Holidays retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const createHolidayHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orgService.createHoliday(req.user!.organizationId, req.params.id as string, req.user!.userId, req.body);
    return res.status(201).json(successResponse('Holiday created', data));
  } catch (error) {
    next(error);
  }
};

export const updateHolidayHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orgService.updateHoliday(req.user!.organizationId, req.params.id as string, req.params.holidayId as string, req.user!.userId, req.body);
    return res.status(200).json(successResponse('Holiday updated', data));
  } catch (error) {
    next(error);
  }
};

export const deleteHolidayHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orgService.deleteHoliday(req.user!.organizationId, req.params.id as string, req.params.holidayId as string, req.user!.userId);
    return res.status(200).json(successResponse('Holiday deleted', null));
  } catch (error) {
    next(error);
  }
};

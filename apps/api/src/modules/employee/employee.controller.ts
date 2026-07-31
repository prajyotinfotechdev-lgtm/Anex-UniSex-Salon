import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from './employee.service';
import { successResponse } from '@anex/shared';

const empService = new EmployeeService();

export const searchEmployeesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await empService.searchEmployees(req.user!.organizationId, req.query);
    return res.status(200).json(successResponse('Employees retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const getEmployeeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await empService.getEmployeeById(req.user!.organizationId, req.params.id as string);
    return res.status(200).json(successResponse('Employee retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const createEmployeeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await empService.createEmployee(req.user!.organizationId, req.user!.userId, req.body);
    return res.status(201).json(successResponse('Employee created', data));
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await empService.updateEmployee(req.user!.organizationId, req.params.id as string, req.user!.userId, req.body);
    return res.status(200).json(successResponse('Employee updated', data));
  } catch (error) {
    next(error);
  }
};

export const deleteEmployeeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await empService.deleteEmployee(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Employee deleted', null));
  } catch (error) {
    next(error);
  }
};

export const activateEmployeeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await empService.activateEmployee(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Employee activated', null));
  } catch (error) {
    next(error);
  }
};

export const deactivateEmployeeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await empService.deactivateEmployee(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Employee deactivated', null));
  } catch (error) {
    next(error);
  }
};

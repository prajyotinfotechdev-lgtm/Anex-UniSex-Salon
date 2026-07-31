import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { successResponse } from '@anex/shared';

const customerService = new CustomerService();

export const searchCustomersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customerService.searchCustomers(req.user!.organizationId, req.query);
    return res.status(200).json(successResponse('Customers retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const getCustomerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customerService.getCustomerById(req.user!.organizationId, req.params.id as string);
    return res.status(200).json(successResponse('Customer retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const createCustomerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customerService.createCustomer(req.user!.organizationId, req.user!.userId, req.body);
    return res.status(201).json(successResponse('Customer created', data));
  } catch (error) {
    next(error);
  }
};

export const updateCustomerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customerService.updateCustomer(req.user!.organizationId, req.params.id as string, req.user!.userId, req.body);
    return res.status(200).json(successResponse('Customer updated', data));
  } catch (error) {
    next(error);
  }
};

export const deleteCustomerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await customerService.deleteCustomer(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Customer deleted', null));
  } catch (error) {
    next(error);
  }
};

export const activateCustomerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await customerService.activateCustomer(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Customer activated', null));
  } catch (error) {
    next(error);
  }
};

export const deactivateCustomerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await customerService.deactivateCustomer(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Customer deactivated', null));
  } catch (error) {
    next(error);
  }
};

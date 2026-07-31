import { Request, Response, NextFunction } from 'express';
import { ServiceCatalogService } from './service.service';
import { successResponse } from '@anex/shared';

const serviceCatalog = new ServiceCatalogService();

export const searchServicesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await serviceCatalog.searchServices(req.user!.organizationId, req.query);
    return res.status(200).json(successResponse('Services retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const getServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await serviceCatalog.getServiceById(req.user!.organizationId, req.params.id as string);
    return res.status(200).json(successResponse('Service retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const createServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await serviceCatalog.createService(req.user!.organizationId, req.user!.userId, req.body);
    return res.status(201).json(successResponse('Service created', data));
  } catch (error) {
    next(error);
  }
};

export const updateServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await serviceCatalog.updateService(req.user!.organizationId, req.params.id as string, req.user!.userId, req.body);
    return res.status(200).json(successResponse('Service updated', data));
  } catch (error) {
    next(error);
  }
};

export const deleteServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await serviceCatalog.deleteService(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Service deleted', null));
  } catch (error) {
    next(error);
  }
};

export const activateServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await serviceCatalog.activateService(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Service activated', null));
  } catch (error) {
    next(error);
  }
};

export const deactivateServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await serviceCatalog.deactivateService(req.user!.organizationId, req.params.id as string, req.user!.userId);
    return res.status(200).json(successResponse('Service deactivated', null));
  } catch (error) {
    next(error);
  }
};

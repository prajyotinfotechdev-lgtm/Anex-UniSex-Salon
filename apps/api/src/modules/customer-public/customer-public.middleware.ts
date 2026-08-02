import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../errors/AppErrors';

export const requireOrganizationId = (req: Request, res: Response, next: NextFunction) => {
  const orgId = req.headers['x-organization-id'];
  if (!orgId || typeof orgId !== 'string') {
    return next(new ValidationError('Missing or invalid x-organization-id header'));
  }

  (req as any).publicOrganizationId = orgId;
  next();
};

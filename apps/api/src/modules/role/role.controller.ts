import { Request, Response, NextFunction } from 'express';
import { RoleService } from './role.service';
import { successResponse } from '@anex/shared';

const roleService = new RoleService();

export const listRolesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user?.organizationId as string;
    const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;

    const roles = await roleService.listRoles(organizationId, isActive);

    return res.status(200).json(successResponse('Roles retrieved successfully', roles));
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppErrors';
import { PermissionType } from '@anex/shared';
import { hasPermission } from './permission.helper';

export const requirePermission = (requiredPermission: PermissionType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const roleId = req.user?.roleId;

      if (!userId || !roleId) {
        throw new ForbiddenError('Authentication required to verify permissions');
      }

      const isAllowed = await hasPermission(userId, roleId, requiredPermission);
      if (!isAllowed) {
        throw new ForbiddenError('You do not have the required permissions to perform this action');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

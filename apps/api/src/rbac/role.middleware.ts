import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppErrors';
import { RoleType } from '@anex/database';

import { PrismaClient } from '@anex/database';

const db = new PrismaClient();

export const requireRole = (allowedRoles: RoleType[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return next(new ForbiddenError('User not authenticated'));
      }
      
      const role = await db.role.findUnique({
        where: { id: user.roleId },
        select: { type: true }
      });

      if (!role || !allowedRoles.includes(role.type)) {
        return next(new ForbiddenError('You do not have the required role to perform this action'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

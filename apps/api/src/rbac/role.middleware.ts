import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppErrors';
import { RoleType } from '@prisma/client';

export const requireRole = (allowedRoles: RoleType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // In a real application, you would fetch the user's role from the database or JWT
    // This is a simplified check. Assuming req.user.roleType is injected during auth
    // Note: Schema stores Role ID in user/employee, not RoleType in JWT directly by default.
    // If you need RoleType in JWT, ensure it's part of the payload, or look it up.
    
    // Placeholder implementation for requireRole:
    const userRoleType = (req.user as any)?.roleType;
    
    if (!userRoleType || !allowedRoles.includes(userRoleType)) {
      return next(new ForbiddenError('You do not have the required role to perform this action'));
    }
    
    next();
  };
};

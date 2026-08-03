import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '../context/RequestContext';

// Note: This middleware must be placed AFTER the authentication middleware
// so that req.user is populated.
export const tenantContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore - Assuming req.user is populated by auth middleware
  const user = req.user;
  
  if (!user || !user.organizationId) {
    // If it's a public route or unauthenticated, we just proceed without context
    return next();
  }

  const contextData = {
    organizationId: user.organizationId,
    userId: user.id,
    userRole: user.role, // Or roleId
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  };

  RequestContext.run(contextData, () => {
    next();
  });
};

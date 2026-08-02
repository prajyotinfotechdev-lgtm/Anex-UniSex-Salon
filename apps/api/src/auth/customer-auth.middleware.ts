import { Request, Response, NextFunction } from 'express';
import { verifyCustomerAccessToken } from './jwt.util';

export const requireCustomerDevice = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not found' });
    }

    const payload = verifyCustomerAccessToken(token);

    // Attach customer payload to request
    (req as any).customer = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
};

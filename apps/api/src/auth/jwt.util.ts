import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';

export interface JwtPayload {
  userId: string;
  employeeId: string;
  organizationId: string;
  roleId: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};

export interface CustomerSessionPayload {
  customerId: string;
  organizationId: string;
  deviceId: string;
  type: 'customer';
}

export const generateCustomerAccessToken = (payload: CustomerSessionPayload): string => {
  return jwt.sign(payload, env.CUSTOMER_JWT_SECRET, { expiresIn: '15m' }); // Short-lived access token
};

export const verifyCustomerAccessToken = (token: string): CustomerSessionPayload => {
  const decoded = jwt.verify(token, env.CUSTOMER_JWT_SECRET) as CustomerSessionPayload;
  if (decoded.type !== 'customer') {
    throw new Error('Invalid token type');
  }
  return decoded;
};

import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse } from '@anex/shared';

const authService = new AuthService();

export const loginHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.login(req.body, req.ip);
    return res.status(200).json(successResponse('Login successful', data));
  } catch (error) {
    next(error);
  }
};

export const logoutHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.user!.userId, req.user!.organizationId);
    return res.status(200).json(successResponse('Logout successful', null));
  } catch (error) {
    next(error);
  }
};

export const refreshHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.refreshToken(req.body.refreshToken);
    return res.status(200).json(successResponse('Token refreshed successfully', data));
  } catch (error) {
    next(error);
  }
};

export const meHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.getCurrentUser(req.user!.userId);
    return res.status(200).json(successResponse('Current user retrieved', data));
  } catch (error) {
    next(error);
  }
};

export const changePasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.changePassword(req.user!.userId, req.user!.organizationId, req.body);
    return res.status(200).json(successResponse('Password changed successfully', null));
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.forgotPassword(req.body);
    return res.status(200).json(successResponse('If the email exists, a password reset link has been sent', data));
  } catch (error) {
    next(error);
  }
};

export const resetPasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.resetPassword(req.body);
    return res.status(200).json(successResponse('Password reset successfully', null));
  } catch (error) {
    next(error);
  }
};

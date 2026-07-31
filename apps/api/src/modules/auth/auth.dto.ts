import { z } from 'zod';
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from './auth.validator';

// Requests
export type LoginRequestDto = z.infer<typeof loginSchema>['body'];
export type ChangePasswordRequestDto = z.infer<typeof changePasswordSchema>['body'];
export type ForgotPasswordRequestDto = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordRequestDto = z.infer<typeof resetPasswordSchema>['body'];
export type RefreshTokenRequestDto = z.infer<typeof refreshTokenSchema>['body'];

// Responses
export interface AuthUserResponseDto {
  id: string;
  email: string;
  isActive: boolean;
}

export interface AuthEmployeeResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  profileImageUrl: string | null;
  organizationId: string;
  branchId?: string | null;
}

export interface AuthRoleResponseDto {
  id: string;
  name: string;
  type: string;
}

export interface AuthOrganizationResponseDto {
  id: string;
  name: string;
  currencyCode: string;
  countryCode: string;
}

export interface LoginResponseDto {
  user: AuthUserResponseDto;
  employee: AuthEmployeeResponseDto;
  role: AuthRoleResponseDto;
  permissions: string[];
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface CurrentUserResponseDto {
  user: AuthUserResponseDto;
  employee: AuthEmployeeResponseDto;
  role: AuthRoleResponseDto;
  permissions: string[];
  organization: AuthOrganizationResponseDto;
}

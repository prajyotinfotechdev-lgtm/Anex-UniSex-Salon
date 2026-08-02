import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { BaseService } from '../../services/BaseService';
import { AuthRepository } from './auth.repository';
import { PasswordResetProvider } from './PasswordResetProvider';
import { AuditService } from '../../services/AuditService';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtPayload,
} from '../../auth/jwt.util';
import { UnauthorizedError, NotFoundError } from '../../errors/AppErrors';
import { ActionType } from '@anex/database';
import { DBCacheProvider } from '../../cache/DBCacheProvider';
import {
  LoginRequestDto,
  LoginResponseDto,
  ChangePasswordRequestDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  CurrentUserResponseDto,
} from './auth.dto';

export class AuthService extends BaseService {
  private repository: AuthRepository;
  private resetProvider: PasswordResetProvider;
  private cache: DBCacheProvider;

  constructor() {
    super();
    this.repository = new AuthRepository();
    this.resetProvider = new PasswordResetProvider();
    this.cache = new DBCacheProvider();
  }

  private async auditLog(
    organizationId: string,
    action: ActionType,
    entityName: string,
    entityId: string,
    userId?: string,
    details?: Record<string, any>
  ) {
    try {
      await AuditService.log({
        organizationId,
        action,
        entityName,
        entityId,
        userId,
        newValue: details,
      });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  }

  async login(data: LoginRequestDto, ipAddress?: string): Promise<LoginResponseDto> {
    const user = await this.repository.findUserForAuth(data.email);

    if (!user) {
      // Avoid user enumeration
      await this.auditLog(
        'SYSTEM', // Fallback organization ID since we don't know it
        ActionType.LOGIN,
        'User',
        'UNKNOWN',
        undefined,
        { reason: 'Failed login: Invalid credentials', ipAddress, email: data.email }
      );
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      await this.auditLog(
        user.employee?.organizationId || 'SYSTEM',
        ActionType.LOGIN,
        'User',
        user.id,
        user.id,
        { reason: 'Invalid password', ipAddress, email: data.email }
      );
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      await this.auditLog(
        user.employee?.organizationId || 'SYSTEM',
        ActionType.LOGIN,
        'User',
        user.id,
        user.id,
        { reason: 'Account disabled', ipAddress, email: data.email }
      );
      throw new UnauthorizedError('Account is disabled');
    }

    if (!user.employee) {
      throw new UnauthorizedError('No employee profile associated with this user');
    }

    const employee = user.employee;
    const permissions = employee.role.rolePermissions.map((rp: any) => rp.permission.name);

    const payload: JwtPayload = {
      userId: user.id,
      employeeId: employee.id,
      organizationId: employee.organizationId,
      roleId: employee.roleId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.auditLog(
      employee.organizationId,
      ActionType.LOGIN,
      'User',
      user.id,
      user.id,
      { reason: 'Success', ipAddress }
    );

    return {
      user: { id: user.id, email: user.email, isActive: user.isActive },
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        profileImageId: employee.profileImageId,
        organizationId: employee.organizationId,
        branchId: employee.employeeBranches?.[0]?.branchId || null,
      },
      role: { id: employee.role.id, name: employee.role.name, type: employee.role.type },
      permissions,
      tokens: { accessToken, refreshToken },
    };
  }

  async logout(userId: string, organizationId: string): Promise<void> {
    await this.auditLog(
      organizationId,
      ActionType.LOGOUT,
      'User',
      userId,
      userId,
      { reason: 'Success' }
    );
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const isBlacklisted = await this.cache.get(`revoked_token:${token}`);
      if (isBlacklisted) {
        throw new UnauthorizedError('Token has been revoked');
      }

      const payload = verifyRefreshToken(token);
      
      // Blacklist the old token
      // Assuming a default of 7 days in seconds for the TTL if not parsing JWT exp
      await this.cache.set(`revoked_token:${token}`, true, 7 * 24 * 60 * 60);

      const newPayload: JwtPayload = {
        userId: payload.userId,
        employeeId: payload.employeeId,
        organizationId: payload.organizationId,
        roleId: payload.roleId,
      };

      return {
        accessToken: generateAccessToken(newPayload),
        refreshToken: generateRefreshToken(newPayload),
      };
    } catch (error: any) {
      await this.auditLog(
        'SYSTEM',
        ActionType.UPDATE,
        'User',
        'UNKNOWN',
        undefined,
        { reason: error.name === 'TokenExpiredError' ? 'Expired refresh token' : 'Invalid refresh token' }
      );
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async getCurrentUser(userId: string): Promise<CurrentUserResponseDto> {
    const user = await this.repository.findUserByIdWithDetails(userId);
    if (!user || !user.employee) {
      throw new NotFoundError('User profile not found');
    }

    const employee = user.employee;
    const permissions = employee.role.rolePermissions.map((rp: any) => rp.permission.name);

    return {
      user: { id: user.id, email: user.email, isActive: user.isActive },
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        profileImageId: employee.profileImageId,
        organizationId: employee.organizationId,
        branchId: employee.employeeBranches?.[0]?.branchId || null,
      },
      role: { id: employee.role.id, name: employee.role.name, type: employee.role.type },
      permissions,
      organization: {
        id: employee.organization.id,
        name: employee.organization.name,
        currencyCode: employee.organization.currencyCode,
        countryCode: employee.organization.countryCode,
      },
    };
  }

  async changePassword(userId: string, organizationId: string, data: ChangePasswordRequestDto): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Incorrect current password');
    }

    const newPasswordHash = await bcrypt.hash(data.newPassword, 12);
    await this.repository.updateUserPassword(userId, newPasswordHash);

    await this.auditLog(
      organizationId,
      ActionType.UPDATE,
      'User',
      userId,
      userId,
      { reason: 'Password changed' }
    );
  }

  async forgotPassword(data: ForgotPasswordRequestDto): Promise<{ resetToken?: string }> {
    const user = await this.repository.findUserForAuth(data.email);
    
    // Always return success to prevent user enumeration
    if (!user || !user.employee) {
      return {};
    }

    const token = crypto.randomBytes(32).toString('hex');
    await this.resetProvider.saveToken(user.id, token);
    await this.resetProvider.sendResetEmail(user.email, token);

    await this.auditLog(
      user.employee.organizationId,
      ActionType.UPDATE,
      'User',
      user.id,
      user.id,
      { reason: 'Password reset requested' }
    );

    // Return token only in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      return { resetToken: token };
    }
    return {};
  }

  async resetPassword(data: ResetPasswordRequestDto): Promise<void> {
    const userId = await this.resetProvider.getUserIdByToken(data.token);
    if (!userId) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    const user = await this.repository.findUserByIdWithDetails(userId);
    if (!user || !user.employee) {
      throw new NotFoundError('User not found');
    }

    const newPasswordHash = await bcrypt.hash(data.newPassword, 12);
    await this.repository.updateUserPassword(userId, newPasswordHash);
    await this.resetProvider.invalidateToken(data.token);

    await this.auditLog(
      user.employee.organizationId,
      ActionType.UPDATE,
      'User',
      userId,
      userId,
      { reason: 'Password reset completed' }
    );
  }
}

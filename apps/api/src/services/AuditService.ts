import { BaseService } from './BaseService';
import { prisma } from '../database/prisma.client';
import { ActionType } from '@anex/database';

export interface AuditLogData {
  organizationId: string;
  userId?: string;
  action: ActionType;
  entityName: string;
  entityId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class AuditService extends BaseService {
  static async log(data: AuditLogData) {
    try {
      // Validate that organizationId is a valid UUID before creating AuditLog record
      if (!data.organizationId || !UUID_REGEX.test(data.organizationId)) {
        return;
      }

      await prisma.auditLog.create({
        data: {
          organizationId: data.organizationId,
          ...(data.userId && UUID_REGEX.test(data.userId) && { userId: data.userId }),
          action: data.action,
          entityName: data.entityName,
          entityId: data.entityId,
          ...(data.oldValue && { oldValue: data.oldValue }),
          ...(data.newValue && { newValue: data.newValue }),
          ...(data.ipAddress && { ipAddress: data.ipAddress }),
          ...(data.userAgent && { userAgent: data.userAgent }),
        },
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Audit log failure should never block application flow
    }
  }
}

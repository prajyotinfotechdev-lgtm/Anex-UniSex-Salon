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

export class AuditService extends BaseService {
  static async log(data: AuditLogData) {
    try {
      await prisma.auditLog.create({
        data: {
          organizationId: data.organizationId,
          ...(data.userId && { userId: data.userId }),
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
      console.error('Failed to write audit log', error);
      // We generally do not want to throw on audit log failure as it could block the main transaction
    }
  }
}

import { ActionType } from '@prisma/client';
import { BaseService } from '../../services/BaseService';
import { BillingRepository } from './billing.repository';
import { AuditService } from '../../services/AuditService';
import { AddPaymentInput } from './billing.types';

export class PaymentService extends BaseService {
  private repo = new BillingRepository();

  private async auditLog(
    organizationId: string,
    action: ActionType,
    entityId: string,
    userId: string,
    details?: Record<string, any>
  ) {
    try {
      await AuditService.log({
        organizationId,
        action,
        entityName: 'Payment',
        entityId,
        userId,
        newValue: details,
      });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  }

  async addPayment(organizationId: string, userId: string, data: AddPaymentInput) {
    const { payment, invoice } = await this.repo.addPayment(data);

    await this.auditLog(organizationId, ActionType.CREATE, payment.id, userId, {
      note: 'Payment Added',
      amount: payment.amount,
      method: payment.method,
      invoiceId: invoice.id,
    });

    return { payment, invoice };
  }
}

import { ActionType, InvoiceStatus } from '@prisma/client';
import { BaseService } from '../../services/BaseService';
import { BillingRepository } from './billing.repository';
import { AuditService } from '../../services/AuditService';
import { CreateInvoiceInput } from './billing.types';
import { NotFoundError, ConflictError } from '../../errors/AppErrors';

export class InvoiceService extends BaseService {
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
        entityName: 'Invoice',
        entityId,
        userId,
        newValue: details,
      });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  }

  async createInvoice(organizationId: string, userId: string, data: CreateInvoiceInput) {
    // Basic validations could be added here (e.g. check if branch belongs to org)
    
    const invoice = await this.repo.createInvoice(data);

    await this.auditLog(organizationId, ActionType.CREATE, invoice.id, userId, {
      invoiceNumber: invoice.invoiceNumber,
      amountDue: invoice.amountDue,
      status: invoice.status,
    });

    if (data.appointmentId) {
      await this.auditLog(organizationId, ActionType.UPDATE, invoice.id, userId, {
        note: 'Invoice Linked To Appointment',
        appointmentId: data.appointmentId,
      });
    }

    return invoice;
  }

  async getInvoiceById(organizationId: string, invoiceId: string) {
    const invoice = await this.repo.getInvoiceById(invoiceId, organizationId);
    if (!invoice) throw new NotFoundError('Invoice not found');
    return invoice;
  }

  async voidInvoice(organizationId: string, userId: string, invoiceId: string) {
    const invoice = await this.getInvoiceById(organizationId, invoiceId);
    
    if (invoice.status === InvoiceStatus.VOIDED) {
      throw new ConflictError('Invoice is already voided');
    }
    
    if (Number(invoice.amountPaid) > 0) {
      throw new ConflictError('Cannot void an invoice that has payments applied. Refund payments first.');
    }

    const updated = await this.repo.updateInvoiceStatus(invoiceId, InvoiceStatus.VOIDED);

    await this.auditLog(organizationId, ActionType.UPDATE, invoiceId, userId, {
      note: 'Invoice Status Changed',
      oldStatus: invoice.status,
      newStatus: InvoiceStatus.VOIDED,
    });

    return updated;
  }
}

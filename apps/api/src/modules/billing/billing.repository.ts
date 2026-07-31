import { Prisma, InvoiceStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../../database/prisma.client';
import { CreateInvoiceInput, AddPaymentInput } from './billing.types';
import { InvoiceCalculator } from './invoice.calculator';
import { PaymentAllocator } from './payment.allocator';

export class BillingRepository {
  /**
   * Generates a unique invoice number format.
   */
  private async generateInvoiceNumber(branchId: string, tx: Prisma.TransactionClient): Promise<string> {
    const today = new Date();
    const prefix = `INV-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Find the latest invoice for this prefix
    const latest = await tx.invoice.findFirst({
      where: {
        branchId,
        invoiceNumber: { startsWith: prefix },
      },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    let sequence = 1;
    if (latest && latest.invoiceNumber) {
      const lastSeqStr = latest.invoiceNumber.split('-').pop();
      if (lastSeqStr) {
        sequence = parseInt(lastSeqStr, 10) + 1;
      }
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  async createInvoice(data: CreateInvoiceInput, txClient?: Prisma.TransactionClient) {
    const execute = async (tx: Prisma.TransactionClient) => {
      const invoiceNumber = await this.generateInvoiceNumber(data.branchId, tx);
      const totals = InvoiceCalculator.calculateTotals(data.items);
      
      const invoice = await tx.invoice.create({
        data: {
          branchId: data.branchId,
          customerId: data.customerId,
          appointmentId: data.appointmentId,
          invoiceNumber,
          status: InvoiceStatus.DRAFT,
          subtotal: totals.subtotal,
          discountTotal: totals.discountTotal,
          taxTotal: totals.taxTotal,
          tipAmount: totals.tipAmount,
          roundOff: totals.roundOff,
          grandTotal: totals.grandTotal,
          amountPaid: 0,
          amountDue: totals.grandTotal,
          issueDate: data.issueDate || new Date(),
          dueDate: data.dueDate,
          notes: data.notes,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              type: item.type,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
              tax: item.tax || 0,
              total: (item.quantity * item.unitPrice) - (item.discount || 0) + (item.tax || 0),
              snapshottedName: item.snapshottedName,
              snapshottedSku: item.snapshottedSku,
              snapshotData: item.snapshotData || {},
            })),
          },
        },
        include: { items: true },
      });

      return invoice;
    };

    return txClient ? execute(txClient) : prisma.$transaction(execute);
  }

  async getInvoiceById(invoiceId: string, branchId?: string) {
    return prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        ...(branchId && { branchId }),
        isActive: true,
        deletedAt: null,
      },
      include: {
        items: true,
        payments: {
          where: { status: PaymentStatus.COMPLETED }
        },
        customer: true,
      },
    });
  }

  async addPayment(data: AddPaymentInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch invoice and lock it for update if possible (Prisma doesn't easily support row-level locks cleanly without raw queries, but we execute in a transaction)
      const invoice = await tx.invoice.findUniqueOrThrow({
        where: { id: data.invoiceId },
      });

      if (invoice.status === InvoiceStatus.VOIDED || invoice.status === InvoiceStatus.REFUNDED) {
        throw new Error('Cannot add payment to a voided or refunded invoice');
      }

      // 2. Validate using Allocator
      PaymentAllocator.validatePayment(Number(invoice.amountDue), data.amount, data.method);

      // 3. Apply changes to balances
      const { newAmountPaid, newAmountDue } = PaymentAllocator.applyPayment(
        Number(invoice.amountPaid),
        Number(invoice.amountDue),
        data.amount
      );

      // Determine new status
      let newStatus = invoice.status;
      if (newAmountDue <= 0) {
        newStatus = InvoiceStatus.PAID;
      } else if (newAmountPaid > 0) {
        newStatus = InvoiceStatus.PARTIALLY_PAID;
      } else if (newStatus === InvoiceStatus.DRAFT) {
        newStatus = InvoiceStatus.ISSUED; // Transition out of draft when a payment happens
      }

      // 4. Create Payment Record
      const payment = await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amount: data.amount,
          method: data.method,
          status: PaymentStatus.COMPLETED,
          referenceId: data.referenceId,
          transactionId: data.transactionId,
          gateway: data.gateway,
          gatewayResponse: data.gatewayResponse || {},
          receivedByEmployeeId: data.receivedByEmployeeId,
          paymentDate: new Date(),
        },
      });

      // 5. Update Invoice
      const updatedInvoice = await tx.invoice.update({
        where: { id: data.invoiceId },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status: newStatus,
        },
      });

      return { payment, invoice: updatedInvoice };
    });
  }

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
    });
  }
}

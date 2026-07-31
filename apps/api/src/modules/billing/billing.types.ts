import { InvoiceItemType, PaymentMethod, PaymentStatus, PaymentGateway } from '@prisma/client';

export interface CreateInvoiceItemInput {
  productId?: string;
  type: InvoiceItemType;
  quantity: number;
  unitPrice: number;
  discount?: number; // Flat discount amount
  tax?: number; // Flat tax amount
  snapshottedName: string;
  snapshottedSku?: string;
  snapshotData?: Record<string, any>;
}

export interface CreateInvoiceInput {
  branchId: string;
  customerId?: string;
  appointmentId?: string;
  issueDate?: Date;
  dueDate?: Date;
  notes?: string;
  items: CreateInvoiceItemInput[];
}

export interface AddPaymentInput {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  referenceId?: string;
  transactionId?: string;
  gateway?: PaymentGateway;
  gatewayResponse?: Record<string, any>;
  receivedByEmployeeId?: string;
}

export interface InvoiceTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  tipAmount: number;
  roundOff: number;
  grandTotal: number;
}

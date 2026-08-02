import { InvoiceItemType, PaymentMethod, PaymentStatus, PaymentGateway } from '@anex/database';

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

export interface InvoiceListQuery {
  page?: number;
  limit?: number;
  branchId?: string;
  customerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaymentListQuery {
  page?: number;
  limit?: number;
  invoiceId?: string;
  branchId?: string;
  method?: PaymentMethod;
}

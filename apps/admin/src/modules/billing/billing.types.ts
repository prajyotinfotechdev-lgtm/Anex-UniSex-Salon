export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED',
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  GIFT_CARD = 'GIFT_CARD',
  WALLET = 'WALLET',
  LOYALTY_POINTS = 'LOYALTY_POINTS',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum InvoiceItemType {
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
  PACKAGE = 'PACKAGE',
  MEMBERSHIP = 'MEMBERSHIP',
  OTHER = 'OTHER',
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId?: string;
  type: InvoiceItemType;
  quantity: number;
  unitPrice: string | number;
  discount: string | number;
  tax: string | number;
  total: string | number;
  snapshottedName?: string;
  snapshottedSku?: string;
  snapshottedPrice?: string | number;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: string | number;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceId?: string;
  transactionId?: string;
  gateway?: string;
  receivedByEmployeeId?: string;
  paymentDate: string;
  createdAt: string;
  invoice?: {
    invoiceNumber: string;
    branchId: string;
  };
}

export interface Invoice {
  id: string;
  branchId: string;
  customerId?: string;
  appointmentId?: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotal: string | number;
  discountTotal: string | number;
  taxTotal: string | number;
  tipAmount: string | number;
  roundOff: string | number;
  grandTotal: string | number;
  amountPaid: string | number;
  amountDue: string | number;
  issueDate: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface CreateInvoiceItemInput {
  productId?: string;
  type: InvoiceItemType;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total?: number;
}

export interface InvoiceListParams {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  dateRange?: string;
  customerId?: string;
}

export interface CreateInvoiceInput {
  branchId: string;
  customerId?: string;
  appointmentId?: string;
  issueDate?: string;
  dueDate?: string;
  notes?: string;
  items: CreateInvoiceItemInput[];
}

export interface AddPaymentInput {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  referenceId?: string;
  transactionId?: string;
  gateway?: string;
}

export interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {
  status?: InvoiceStatus;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  invoiceId?: string;
  branchId?: string;
  method?: string;
}

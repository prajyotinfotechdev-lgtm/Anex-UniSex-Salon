import { z } from 'zod';
import { InvoiceItemType, PaymentMethod, PaymentGateway } from '@anex/database';

export const createInvoiceItemSchema = z.object({
  productId: z.string().uuid().optional(),
  type: z.nativeEnum(InvoiceItemType),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  discount: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  snapshottedName: z.string().min(1),
  snapshottedSku: z.string().optional(),
  snapshotData: z.record(z.string(), z.any()).optional(),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    branchId: z.string().uuid(),
    customerId: z.string().uuid().optional(),
    appointmentId: z.string().uuid().optional(),
    issueDate: z.string().datetime().optional(),
    dueDate: z.string().datetime().optional(),
    notes: z.string().optional(),
    items: z.array(createInvoiceItemSchema).min(1, 'Invoice must have at least one item'),
  }),
});

export const addPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string().uuid(),
    amount: z.number().positive(),
    method: z.nativeEnum(PaymentMethod),
    referenceId: z.string().optional(),
    transactionId: z.string().optional(),
    gateway: z.nativeEnum(PaymentGateway).optional(),
    gatewayResponse: z.record(z.string(), z.any()).optional(),
  }),
});

export const invoiceListSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    branchId: z.string().uuid().optional(),
    customerId: z.union([z.string().uuid(), z.literal('null')]).optional(),
    status: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    search: z.string().optional(),
    dateRange: z.string().optional(),
  }),
});

export const paymentListSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    invoiceId: z.string().uuid().optional(),
    branchId: z.string().uuid().optional(),
    method: z.nativeEnum(PaymentMethod).optional(),
  }),
});

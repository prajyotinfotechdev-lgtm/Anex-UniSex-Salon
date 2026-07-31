import { z } from 'zod';
import { InvoiceItemType, PaymentMethod, PaymentGateway } from '@prisma/client';

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

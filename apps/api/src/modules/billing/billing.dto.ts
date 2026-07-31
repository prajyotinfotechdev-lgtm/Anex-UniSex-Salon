import { z } from 'zod';
import { createInvoiceSchema, addPaymentSchema } from './billing.validator';

export type CreateInvoiceRequestDto = z.infer<typeof createInvoiceSchema>['body'];
export type AddPaymentRequestDto = z.infer<typeof addPaymentSchema>['body'];

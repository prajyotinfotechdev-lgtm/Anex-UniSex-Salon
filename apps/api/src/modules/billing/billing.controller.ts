import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from './invoice.service';
import { PaymentService } from './payment.service';
import { successResponse } from '@anex/shared';

const invoiceService = new InvoiceService();
const paymentService = new PaymentService();

export const createInvoiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await invoiceService.createInvoice(req.user!.organizationId, req.user!.userId, req.body);
    return res.status(201).json(successResponse('Invoice created successfully', data));
  } catch (error) {
    next(error);
  }
};

export const getInvoiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await invoiceService.getInvoiceById(req.user!.organizationId, req.params.id as string);
    return res.status(200).json(successResponse('Invoice fetched successfully', data));
  } catch (error) {
    next(error);
  }
};

export const voidInvoiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await invoiceService.voidInvoice(req.user!.organizationId, req.user!.userId, req.params.id as string);
    return res.status(200).json(successResponse('Invoice voided successfully', data));
  } catch (error) {
    next(error);
  }
};

export const addPaymentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = {
      ...req.body,
      receivedByEmployeeId: req.user!.employeeId // Optionally default to current employee
    };
    const data = await paymentService.addPayment(req.user!.organizationId, req.user!.userId, payload);
    return res.status(201).json(successResponse('Payment added successfully', data));
  } catch (error) {
    next(error);
  }
};

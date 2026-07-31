import { PaymentMethod } from '@prisma/client';
import { ValidationError, ConflictError } from '../../errors/AppErrors';

export class PaymentAllocator {
  /**
   * Validates a payment against an invoice's outstanding balance.
   */
  static validatePayment(amountDue: number, paymentAmount: number, method: PaymentMethod): void {
    if (paymentAmount <= 0) {
      throw new ValidationError('Payment amount must be greater than zero');
    }

    if (paymentAmount > amountDue) {
      throw new ConflictError(`Payment amount (${paymentAmount}) exceeds the outstanding balance (${amountDue})`);
    }

    // Example of future constraints on specific methods if we wanted them
    // if (method === PaymentMethod.WALLET && ...) { ... }
  }

  /**
   * Determines the new amountDue and amountPaid after a valid payment is applied.
   */
  static applyPayment(currentAmountPaid: number, currentAmountDue: number, paymentAmount: number): {
    newAmountPaid: number;
    newAmountDue: number;
  } {
    return {
      newAmountPaid: this.round(currentAmountPaid + paymentAmount),
      newAmountDue: this.round(currentAmountDue - paymentAmount),
    };
  }

  /**
   * Reverses a payment to calculate the restored balances (e.g. for a refund).
   */
  static reversePayment(currentAmountPaid: number, currentAmountDue: number, refundAmount: number): {
    newAmountPaid: number;
    newAmountDue: number;
  } {
    return {
      newAmountPaid: this.round(Math.max(0, currentAmountPaid - refundAmount)),
      newAmountDue: this.round(currentAmountDue + refundAmount),
    };
  }

  private static round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

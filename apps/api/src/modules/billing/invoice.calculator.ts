import { CreateInvoiceItemInput, InvoiceTotals } from './billing.types';

export class InvoiceCalculator {
  /**
   * Calculates the core totals for an invoice based strictly on its items.
   * Discards any tip amounts or round-offs passed initially as those are applied later.
   */
  static calculateTotals(items: CreateInvoiceItemInput[]): InvoiceTotals {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    for (const item of items) {
      // Base line total before tax and discount
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;
      
      discountTotal += item.discount || 0;
      taxTotal += item.tax || 0;
    }

    // Grand total = (Subtotal - Discount) + Tax
    // Tips are handled separately on the invoice entity
    const grandTotal = (subtotal - discountTotal) + taxTotal;

    return {
      subtotal: this.roundToTwoDecimalPlaces(subtotal),
      discountTotal: this.roundToTwoDecimalPlaces(discountTotal),
      taxTotal: this.roundToTwoDecimalPlaces(taxTotal),
      tipAmount: 0,
      roundOff: 0,
      grandTotal: this.roundToTwoDecimalPlaces(grandTotal),
    };
  }

  /**
   * Updates an existing total with tip and round-off logic.
   */
  static applyAdjustments(totals: InvoiceTotals, tipAmount: number, roundOff: number): InvoiceTotals {
    const grandTotal = (totals.subtotal - totals.discountTotal) + totals.taxTotal + tipAmount + roundOff;

    return {
      ...totals,
      tipAmount: this.roundToTwoDecimalPlaces(tipAmount),
      roundOff: this.roundToTwoDecimalPlaces(roundOff),
      grandTotal: this.roundToTwoDecimalPlaces(grandTotal),
    };
  }

  private static roundToTwoDecimalPlaces(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

'use client';

import * as React from 'react';
import { useInvoice, useVoidInvoice } from '../billing.hooks';
import { InvoiceStatus, PaymentStatus, InvoiceItem, Payment } from '../billing.types';
import { formatDate } from '@/shared/utils/date';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Printer, XCircle, CreditCard, Clock, CalendarDays, User, Building, FileText, CheckCircle2, Send } from 'lucide-react';
import { HasPermission } from '@/shared/components/HasPermission';
import { PaymentDialog } from './payment-dialog';

interface InvoiceDetailProps {
  id: string;
}

export function InvoiceDetail({ id }: InvoiceDetailProps) {
  const { data: invoice, isLoading, isError, refetch } = useInvoice(id);
  const voidMutation = useVoidInvoice();

  if (isLoading) {
    return <InvoiceDetailSkeleton />;
  }

  if (isError || !invoice) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Failed to load invoice details.</p>
        <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const handleVoid = () => {
    if (window.confirm('Are you sure you want to void this invoice? This action cannot be undone.')) {
      voidMutation.mutate(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const customerPhone = invoice.customer?.primaryPhone || invoice.customer?.phone;
    if (!customerPhone) {
      alert("Customer doesn't have a phone number on file.");
      return;
    }
    
    const customerBaseUrl = process.env.NEXT_PUBLIC_CUSTOMER_URL || 
      (typeof window !== 'undefined' ? window.location.origin.replace('3001', '3000').replace('admin', 'customer') : 'http://localhost:3000');
    
    const invoiceLink = `${customerBaseUrl}/invoice/${invoice.id}`;

    let msg = `*${invoice.branch?.name || 'Anex Salon'}*\n`;
    msg += `Hi ${invoice.customer.firstName},\n\n`;
    msg += `Thank you for your visit! Your premium invoice is ready.\n\n`;
    msg += `*View & Download Invoice PDF:*\n${invoiceLink}\n\n`;
    msg += `We look forward to seeing you again.`;

    const phone = customerPhone.replace(/\D/g, '');
    const text = encodeURIComponent(msg);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const renderStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Draft</Badge>;
      case InvoiceStatus.ISSUED:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Finalized</Badge>;
      case InvoiceStatus.PARTIALLY_PAID:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Partially Paid</Badge>;
      case InvoiceStatus.PAID:
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid in Full</Badge>;
      case InvoiceStatus.VOIDED:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Voided</Badge>;
      case InvoiceStatus.REFUNDED:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0">Completed</Badge>;
      case PaymentStatus.PENDING:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0">Pending</Badge>;
      case PaymentStatus.FAILED:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] px-1.5 py-0">Failed</Badge>;
      case PaymentStatus.REFUNDED:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0">Refunded</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0">{status}</Badge>;
    }
  };

  const isPaid = invoice.status === InvoiceStatus.PAID;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* LEFT COLUMN / PRINT VIEW */}
      <div className="w-full md:w-[70%] bg-white md:bg-transparent print:w-full print:block print:!m-0 print:!p-0 print:bg-white relative">
        
        {/* Receipt Container optimized for WhatsApp/Mobile & Print */}
        <div className="print:max-w-md mx-auto print:shadow-none bg-white rounded-2xl md:shadow-xl md:border border-slate-200/60 p-6 md:p-8 space-y-8 relative overflow-hidden">
          
          {/* Subtle gold accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 opacity-80" />

          {/* Header */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 pb-6 border-b border-dashed">
            <img 
              src="/apple-touch-icon.png" 
              alt="Logo" 
              className="w-16 h-16 rounded-xl shadow-md border border-slate-100 object-cover mb-2"
            />
            
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-wide uppercase">{invoice.branch?.name || 'Anex Salon'}</h1>
              <p className="text-sm text-slate-500 mt-1">Premium Invoice</p>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              {renderStatusBadge(invoice.status)}
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Invoice No</p>
              <p className="font-semibold text-slate-900">{invoice.invoiceNumber}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Date</p>
              <p className="font-semibold text-slate-900">{formatDate(invoice.issueDate)}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Billed To</p>
            {invoice.customer ? (
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-900 text-base">{invoice.customer.firstName} {invoice.customer.lastName}</p>
                {(invoice.customer.primaryPhone || invoice.customer.phone) && <p className="text-sm text-slate-600">{invoice.customer.primaryPhone || invoice.customer.phone}</p>}
                {invoice.customer.email && <p className="text-sm text-slate-600">{invoice.customer.email}</p>}
              </div>
            ) : (
              <p className="text-slate-600 font-medium italic">Walk-in Customer</p>
            )}
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Services & Items</p>
            
            <div className="border-t border-b border-slate-200 py-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="font-normal text-left py-2">Item</th>
                    <th className="font-normal text-center py-2">Qty</th>
                    <th className="font-normal text-right py-2">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item: InvoiceItem) => (
                      <tr key={item.id} className="text-slate-700">
                        <td className="py-3 pr-2">
                          <p className="font-medium text-slate-900">{item.snapshottedName || 'Unknown Item'}</p>
                          {Number(item.discount) > 0 && (
                            <p className="text-xs text-emerald-600">-₹{Number(item.discount).toFixed(2)} discount</p>
                          )}
                        </td>
                        <td className="py-3 text-center text-slate-500">{item.quantity}</td>
                        <td className="py-3 text-right font-medium text-slate-900">₹{Number(item.total).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400 italic">No items found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-2 text-sm text-slate-600">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">₹{Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            {Number(invoice.discountTotal) > 0 && (
              <div className="flex justify-between items-center text-emerald-600">
                <span>Total Discount</span>
                <span>-₹{Number(invoice.discountTotal).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Tax</span>
              <span className="font-medium text-slate-900">₹{Number(invoice.taxTotal).toFixed(2)}</span>
            </div>
            {Number(invoice.tipAmount) > 0 && (
              <div className="flex justify-between items-center">
                <span>Tip</span>
                <span className="font-medium text-slate-900">₹{Number(invoice.tipAmount).toFixed(2)}</span>
              </div>
            )}
            
            <div className="pt-4 border-t border-dashed border-slate-200 mt-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-slate-900">₹{Number(invoice.grandTotal).toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center text-emerald-600 font-medium">
                <span>Amount Paid</span>
                <span>₹{Number(invoice.amountPaid).toFixed(2)}</span>
              </div>
              {Number(invoice.amountDue) > 0 && (
                <div className="flex justify-between items-center text-red-500 font-semibold text-lg mt-2 pt-2 border-t border-slate-100">
                  <span>Balance Due</span>
                  <span>₹{Number(invoice.amountDue).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Print Footer */}
          <div className="pt-8 text-center space-y-1 pb-4">
            <p className="text-sm font-medium text-slate-900">Thank you for visiting!</p>
            <p className="text-xs text-slate-500">We hope to see you again soon.</p>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: ACTIONS & TIMELINE - HIDDEN ON PRINT */}
      <div className="w-full md:w-[30%] space-y-6 print:hidden">
        
        {/* Quick Actions */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <HasPermission permission="Billing.Create">
              {(invoice.status === InvoiceStatus.ISSUED || invoice.status === InvoiceStatus.PARTIALLY_PAID) ? (
                <PaymentDialog invoice={invoice}>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                    <span>Record Payment</span>
                  </Button>
                </PaymentDialog>
              ) : null}
            </HasPermission>
            
            <Button variant="outline" className="w-full border-slate-300" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print / Save Receipt
            </Button>
            
            <Button 
              className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white" 
              onClick={handleSendWhatsApp}
            >
              <Send className="mr-2 h-4 w-4" />
              Send via WhatsApp
            </Button>

            <HasPermission permission="Billing.Manage">
              {(invoice.status !== InvoiceStatus.VOIDED && invoice.status !== InvoiceStatus.PAID) ? (
                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleVoid} disabled={voidMutation.isPending}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Void Invoice
                </Button>
              ) : null}
            </HasPermission>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <CreditCard className="mr-2 h-4 w-4 text-slate-500" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.payments && invoice.payments.length > 0 ? (
              <div className="space-y-3">
                {invoice.payments.map((payment: Payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-900">₹{Number(payment.amount).toFixed(2)}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{formatDate(payment.paymentDate)} • {payment.method}</p>
                    </div>
                    {renderPaymentStatusBadge(payment.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-2">No payments recorded.</p>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Clock className="mr-2 h-4 w-4 text-slate-500" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:h-full before:w-px before:bg-slate-200">
              <div className="relative flex items-start gap-4">
                <div className="w-4 h-4 rounded-full border-2 border-white bg-slate-300 mt-1 z-10 shrink-0"></div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">Invoice Created</span>
                  <span className="text-xs text-slate-500">{formatDate(invoice.createdAt)}</span>
                </div>
              </div>
              
              {invoice.payments?.map((payment: Payment, idx: number) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full border-2 border-white bg-emerald-500 mt-1 z-10 shrink-0"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">Payment Received</span>
                    <span className="text-xs text-slate-500">{formatDate(payment.createdAt)}</span>
                  </div>
                </div>
              ))}
              
              {invoice.status === InvoiceStatus.VOIDED && (
                <div className="relative flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full border-2 border-white bg-red-500 mt-1 z-10 shrink-0"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-red-600">Invoice Voided</span>
                    <span className="text-xs text-slate-500">{formatDate(invoice.updatedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InvoiceDetailSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="w-full md:w-[70%]">
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      </div>
      <div className="w-full md:w-[30%] space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

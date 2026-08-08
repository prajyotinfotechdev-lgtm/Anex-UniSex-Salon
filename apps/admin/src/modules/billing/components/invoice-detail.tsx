'use client';

import * as React from 'react';
import { useInvoice, useVoidInvoice } from '../billing.hooks';
import { InvoiceStatus, PaymentStatus, InvoiceItem, Payment } from '../billing.types';
import { formatDate } from '@/shared/utils/date';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// removed separator import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Printer, XCircle, CreditCard, Clock, CalendarDays, User, Building, FileText } from 'lucide-react';
import { HasPermission } from '@/shared/components/HasPermission';
import Link from 'next/link';

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

  const renderStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1 text-sm">Draft</Badge>;
      case InvoiceStatus.ISSUED:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 text-sm">Finalized</Badge>;
      case InvoiceStatus.PARTIALLY_PAID:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1 text-sm">Partially Paid</Badge>;
      case InvoiceStatus.PAID:
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 px-3 py-1 text-sm">Paid</Badge>;
      case InvoiceStatus.VOIDED:
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 px-3 py-1 text-sm">Voided</Badge>;
      case InvoiceStatus.REFUNDED:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-1 text-sm">Refunded</Badge>;
      default:
        return <Badge variant="outline" className="px-3 py-1 text-sm">{status}</Badge>;
    }
  };

  const renderPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case PaymentStatus.PENDING:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case PaymentStatus.FAILED:
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      case PaymentStatus.REFUNDED:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start print:block print:w-full">
      {/* LEFT COLUMN: 70% */}
      <div className="w-full md:w-[70%] space-y-6">
        
        {/* Print Header (Only visible when printing) */}
        <div className="hidden print:block mb-8 text-center">
          <h1 className="text-3xl font-bold">{invoice.branch?.name || 'ANEX OS'}</h1>
          <p className="text-muted-foreground">Invoice #{invoice.invoiceNumber}</p>
        </div>

        {/* Customer & Appointment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <User className="mr-2 h-4 w-4" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.customer ? (
                <div className="space-y-1">
                  <p className="font-semibold">{invoice.customer.firstName} {invoice.customer.lastName}</p>
                  {invoice.customer.email && <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>}
                  {invoice.customer.phone && <p className="text-sm text-muted-foreground">{invoice.customer.phone}</p>}
                </div>
              ) : (
                <p className="text-muted-foreground italic">Walk-in Customer</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Building className="mr-2 h-4 w-4" />
                Branch Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-semibold">{invoice.branch?.name || 'Unknown Branch'}</p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <CalendarDays className="mr-1 h-3 w-3" />
                  Issued: {formatDate(invoice.issueDate)}
                </p>
                {invoice.appointmentId && (
                  <p className="text-sm text-muted-foreground">
                    From Appointment
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Line Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item: InvoiceItem) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.snapshottedName || 'Unknown Item'}
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{Number(item.unitPrice).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-red-500">
                        {Number(item.discount) > 0 ? `-₹${Number(item.discount).toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {Number(item.tax) > 0 ? `₹${Number(item.tax).toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">₹{Number(item.total).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-3 p-4 bg-muted/20 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-red-500">
              <span>Total Discount</span>
              <span>-${Number(invoice.discountTotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Tax</span>
              <span>₹{Number(invoice.taxTotal).toFixed(2)}</span>
            </div>
            {Number(invoice.tipAmount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tip</span>
                <span>₹{Number(invoice.tipAmount).toFixed(2)}</span>
              </div>
            )}
            <hr className="my-4 border-slate-200" />
            <div className="flex justify-between font-bold text-lg">
              <span>Grand Total</span>
              <span>₹{Number(invoice.grandTotal).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: 30% */}
      <div className="w-full md:w-[30%] space-y-6 print:hidden">
        
        {/* Status Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              {renderStatusBadge(invoice.status)}
              
              <div className="text-center">
                <p className="text-3xl font-bold">₹{Number(invoice.amountDue).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Amount Due</p>
              </div>

              <div className="w-full space-y-2 mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Grand Total</span>
                  <span className="font-medium">₹{Number(invoice.grandTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Amount Paid</span>
                  <span className="font-medium text-green-600">₹{Number(invoice.amountPaid).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <HasPermission permission="Billing.Create">
              {(invoice.status === InvoiceStatus.ISSUED || invoice.status === InvoiceStatus.PARTIALLY_PAID) ? (
                <PaymentDialog invoice={invoice}>
                  <Button className="w-full">
                    <span>Record Payment</span>
                  </Button>
                </PaymentDialog>
              ) : null}
            </HasPermission>
            
            <Button variant="outline" className="w-full" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </Button>

            <HasPermission permission="Billing.Manage">
              {(invoice.status !== InvoiceStatus.VOIDED && invoice.status !== InvoiceStatus.PAID) ? (
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleVoid} disabled={voidMutation.isPending}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Void Invoice
                </Button>
              ) : null}
            </HasPermission>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.payments && invoice.payments.length > 0 ? (
              <div className="space-y-4">
                {invoice.payments.map((payment: Payment) => (
                  <div key={payment.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">₹{Number(payment.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(payment.paymentDate)} via {payment.method}</p>
                    </div>
                    {renderPaymentStatusBadge(payment.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">No payments recorded.</p>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-[3px] md:ml-0 z-10"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Invoice Created</span>
                    <span className="text-xs text-muted-foreground">{formatDate(invoice.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              {invoice.payments?.map((payment: Payment, idx: number) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-[3px] md:ml-0 z-10"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Payment Received</span>
                      <span className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {invoice.status === InvoiceStatus.VOIDED && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-red-500 text-slate-500 group-[.is-active]:text-red-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-[3px] md:ml-0 z-10"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-red-600">Invoice Voided</span>
                      <span className="text-xs text-muted-foreground">{formatDate(invoice.updatedAt)}</span>
                    </div>
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
      <div className="w-full md:w-[70%] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="flex justify-end">
          <Skeleton className="h-40 w-full max-w-sm rounded-xl" />
        </div>
      </div>
      <div className="w-full md:w-[30%] space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

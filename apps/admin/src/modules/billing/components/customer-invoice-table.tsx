'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PremiumLoader } from '@/components/ui/premium-loader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, XCircle, Copy } from 'lucide-react';
import { useInvoices, useVoidInvoice } from '../billing.hooks';
import { Invoice, InvoiceStatus } from '../billing.types';
import { formatDate } from '@/shared/utils/date';
import { toast } from 'sonner';
import { HasPermission } from '@/shared/components/HasPermission';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface CustomerInvoiceTableProps {
  customerId: string | null;
}

export function CustomerInvoiceTable({ customerId }: CustomerInvoiceTableProps) {
  // We fetch a reasonable amount of invoices for this specific customer
  const { data, isLoading, isError, refetch } = useInvoices({
    page: 1,
    limit: 50, // Enough to show recent history
    customerId: customerId === null ? 'null' : customerId,
  });

  const voidMutation = useVoidInvoice();

  const handleVoid = (id: string) => {
    if (window.confirm('Are you sure you want to void this invoice? This action cannot be undone.')) {
      voidMutation.mutate(id);
    }
  };

  const renderStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
      case InvoiceStatus.ISSUED:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Finalized</Badge>;
      case InvoiceStatus.PARTIALLY_PAID:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Partially Paid</Badge>;
      case InvoiceStatus.PAID:
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case InvoiceStatus.VOIDED:
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Voided</Badge>;
      case InvoiceStatus.REFUNDED:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="h-32 flex items-center justify-center border rounded-md bg-muted/20"><PremiumLoader text="Loading invoices..." /></div>;
  }

  if (isError) {
    return <div className="h-32 flex items-center justify-center border rounded-md bg-destructive/10 text-destructive text-sm">Failed to load invoices</div>;
  }

  const invoices = data?.data || [];

  if (invoices.length === 0) {
    return <div className="h-32 flex items-center justify-center border rounded-md bg-muted/10 text-muted-foreground text-sm">No invoices found for this customer.</div>;
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice: Invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                <Link href={`/invoices/${invoice.id}`} className="hover:underline text-primary">
                  {invoice.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell>{invoice.branch?.name || '-'}</TableCell>
              <TableCell className="text-right font-medium">
                ${Number(invoice.grandTotal).toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                ${Number(invoice.amountPaid).toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-medium">
                ${Number(invoice.amountDue).toFixed(2)}
              </TableCell>
              <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
              <TableCell>{formatDate(invoice.createdAt)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<button className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(invoice.invoiceNumber);
                        toast.success('Invoice number copied to clipboard');
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Invoice #
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <HasPermission permission="Billing.Read">
                      <DropdownMenuItem>
                        <Link href={`/invoices/${invoice.id}`} className="flex items-center w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                    </HasPermission>
                    <HasPermission permission="Billing.Manage">
                      {invoice.status !== InvoiceStatus.VOIDED && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleVoid(invoice.id)}
                            className="text-red-600 focus:text-red-600"
                            disabled={voidMutation.isPending}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Void Invoice
                          </DropdownMenuItem>
                        </>
                      )}
                    </HasPermission>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PremiumLoader } from '@/components/ui/premium-loader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Search,
  RefreshCcw,
  Eye,
  XCircle,
  Copy,
  Receipt,
  CheckCircle,
} from 'lucide-react';
import { useInvoices, useVoidInvoice } from '../billing.hooks';
import { Invoice, InvoiceStatus } from '../billing.types';
import { formatDate } from '@/shared/utils/date';
import { toast } from 'sonner';
import { HasPermission } from '@/shared/components/HasPermission';
import { Badge } from '@/components/ui/badge';
import { InvoiceFilters } from './invoice-filters';
import Link from 'next/link';

export function InvoiceList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL state
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const branchId = searchParams.get('branchId') || '';
  const dateRange = searchParams.get('dateRange') || '';

  // Local state for debounced search input
  const [searchInput, setSearchInput] = React.useState(search);

  // Queries
  const { data, isLoading, isError, refetch } = useInvoices({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    branchId: branchId || undefined,
    dateRange: dateRange || undefined,
  });

  const voidMutation = useVoidInvoice();

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

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

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full max-w-sm">
          <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search invoice #, customer..."
                className="pl-8 pr-8 w-full"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary" disabled={isLoading}>
              Search
            </Button>
          </form>
        </div>
        
        <div className="flex items-center gap-2">
          <InvoiceFilters />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
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
            {isLoading ? (
              // Loading State
              <TableRow>
                <TableCell colSpan={9} className="h-64 p-0">
                  <PremiumLoader text="Loading invoices..." />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-red-500">
                  Failed to load invoices. Please try again.
                </TableCell>
              </TableRow>
            ) : !data || data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((invoice: Invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <Link href={`/invoices/${invoice.id}`} className="hover:underline text-primary">
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {invoice.customer ? (
                      <div className="flex flex-col">
                        <span>{invoice.customer.firstName} {invoice.customer.lastName}</span>
                        {invoice.customer.phone && (
                          <span className="text-xs text-muted-foreground">{invoice.customer.phone}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Walk-in</span>
                    )}
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
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground px-2">
            Page {page} of {data.meta.totalPages || 1} ({data.meta.total || 0} total)
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= (data.meta.totalPages || 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

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
import { PremiumLoader } from '@/components/ui/premium-loader';
import { Search, XCircle, RefreshCcw, ChevronDown, ChevronRight, User } from 'lucide-react';
import { useCustomers } from '@/modules/customer/customer.hooks';
import { Customer } from '@/modules/customer/customer.types';
import { CustomerInvoiceTable } from './customer-invoice-table';

export function InvoiceList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL state
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';

  // Local state for debounced search input
  const [searchInput, setSearchInput] = React.useState(search);
  const [expandedCustomers, setExpandedCustomers] = React.useState<Record<string, boolean>>({});

  // Queries
  const { data, isLoading, isError, refetch } = useCustomers({
    page,
    limit,
    search: search || undefined,
  });

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

  const toggleCustomer = (id: string) => {
    setExpandedCustomers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const customers = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const total = data?.meta?.total || 0;

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
                placeholder="Search customers..."
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            title="Refresh Customers"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Walk-in Pseudo-Customer */}
            {(!search || 'walk-in'.includes(search.toLowerCase())) && page === 1 && (
              <>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCustomer('walk-in')}
                >
                  <TableCell>
                    {expandedCustomers['walk-in'] ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="italic">Walk-in Customers</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">-</TableCell>
                  <TableCell className="text-muted-foreground">-</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      {expandedCustomers['walk-in'] ? 'Hide Invoices' : 'View Invoices'}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedCustomers['walk-in'] && (
                  <TableRow className="bg-muted/10">
                    <TableCell colSpan={5} className="p-4 border-b">
                      <CustomerInvoiceTable customerId={null} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}

            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 p-0">
                  <PremiumLoader text="Loading customers..." />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-red-500">
                  Failed to load customers. Please try again.
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer: Customer) => (
                <React.Fragment key={customer.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleCustomer(customer.id)}
                  >
                    <TableCell>
                      {expandedCustomers[customer.id] ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full font-bold text-primary flex items-center justify-center h-8 w-8 text-xs">
                          {customer.firstName[0]}{customer.lastName[0]}
                        </div>
                        {customer.firstName} {customer.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{customer.primaryPhone}</span>
                        {customer.email && <span className="text-xs text-muted-foreground">{customer.email}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        {expandedCustomers[customer.id] ? 'Hide Invoices' : 'View Invoices'}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedCustomers[customer.id] && (
                    <TableRow className="bg-muted/10">
                      <TableCell colSpan={5} className="p-4 border-b">
                        <CustomerInvoiceTable customerId={customer.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
            Page {page} of {totalPages} ({total} customers)
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

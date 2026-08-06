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
  Plus,
  CheckCircle2,
  XCircle,
  UserPen,
  User,
  Copy
} from 'lucide-react';
import { useCustomers, useActivateCustomer, useDeactivateCustomer } from '../customer.hooks';
import { Customer } from '../customer.types';
import { formatDate } from '@/shared/utils/date';
import { toast } from 'sonner';
import { HasPermission } from '@/shared/components/HasPermission';

export function CustomerTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL state
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';

  // Local state for debounced search input
  const [searchInput, setSearchInput] = React.useState(search);

  // Queries
  const { data, isLoading, isError, refetch, isFetching } = useCustomers({
    page,
    limit,
    search: search || undefined,
  });

  const activateMutation = useActivateCustomer();
  const deactivateMutation = useDeactivateCustomer();

  // Debounce search update to URL
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchInput) {
        params.set('search', searchInput);
      } else {
        params.delete('search');
      }
      params.set('page', '1'); // reset page on new search
      router.replace(`${pathname}?${params.toString()}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, pathname, router, searchParams]);

  // Handlers
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${type} to clipboard`);
  };

  const handleStatusToggle = (customer: Customer) => {
    if (customer.isActive) {
      deactivateMutation.mutate(customer.id, {
        onSuccess: () => toast.success('Customer deactivated'),
        onError: () => toast.error('Failed to deactivate customer'),
      });
    } else {
      activateMutation.mutate(customer.id, {
        onSuccess: () => toast.success('Customer activated'),
        onError: () => toast.error('Failed to activate customer'),
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground mr-4">
            Total: {data?.meta.total ?? 0}
          </p>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <HasPermission permission="Customer.Create">
            <Button onClick={() => router.push('/customers/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </HasPermission>
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0">
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton State
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px] mb-2" />
                    <Skeleton className="h-3 w-[100px]" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[60px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              // Error State
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-destructive">
                  Failed to load customers. Please try refreshing.
                </TableCell>
              </TableRow>
            ) : !data || data.data.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <User className="h-8 w-8 mb-4 opacity-50" />
                    <p>No customers found.</p>
                    <p className="text-sm">Try adjusting your search or add a new customer.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data State
              data.data.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <TableCell className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm">{customer.primaryPhone}</span>
                      {customer.email && (
                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(customer.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${customer.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {customer.isActive ? (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      ) : (
                        <XCircle className="mr-1 h-3 w-3" />
                      )}
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/customers/${customer.id}`);
                        }}>
                          <User className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <HasPermission permission="Customer.Update">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/customers/${customer.id}/edit`);
                          }}>
                            <UserPen className="mr-2 h-4 w-4" />
                            Edit Customer
                          </DropdownMenuItem>
                        </HasPermission>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(customer.primaryPhone, 'Phone');
                        }}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Phone
                        </DropdownMenuItem>
                        {customer.email && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(customer.email as string, 'Email');
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Email
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleStatusToggle(customer);
                        }}>
                          {customer.isActive ? (
                            <>
                              <XCircle className="mr-2 h-4 w-4 text-destructive" />
                              <span className="text-destructive">Deactivate</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                              <span className="text-green-600">Activate</span>
                            </>
                          )}
                        </DropdownMenuItem>
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.meta.total)} of {data.meta.total} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= data.meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

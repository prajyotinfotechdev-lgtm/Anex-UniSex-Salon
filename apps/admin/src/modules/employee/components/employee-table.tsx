/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  MoreHorizontal, 
  Search, 
  Plus, 
  Copy, 
  Check, 
  UserCog, 
  UserX,
  Filter,
  RefreshCcw,
  Mail,
  Phone
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HasPermission } from '@/shared/components/HasPermission';
import { toast } from 'sonner';
import { PremiumLoader } from '@/components/ui/premium-loader';

import { useEmployees, useActivateEmployee, useDeactivateEmployee } from '../employee.hooks';
import { Employee } from '../employee.types';

export function EmployeeTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL State
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const isActiveFilter = searchParams.get('isActive');

  // Mutations
  const activateMutation = useActivateEmployee();
  const deactivateMutation = useDeactivateEmployee();

  // Local state for debounced search input
  const [searchInput, setSearchInput] = React.useState(search);

  // Queries
  const { data, isLoading, isError, refetch, isRefetching } = useEmployees({
    page,
    limit,
    search: search || undefined,
    isActive: isActiveFilter ? isActiveFilter === 'true' : undefined,
  });

  // Debounce search update to URL
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleStatusFilter = (status: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status !== null) {
      params.set('isActive', status);
    } else {
      params.delete('isActive');
    }
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${type} to clipboard`);
  };

  const handleStatusToggle = (employee: Employee) => {
    if (employee.isActive) {
      deactivateMutation.mutate(employee.id, {
        onSuccess: () => toast.success('Employee deactivated'),
      });
    } else {
      activateMutation.mutate(employee.id, {
        onSuccess: () => toast.success('Employee activated'),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            } />
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusFilter(null)}>
                All Employees
                {isActiveFilter === null && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('true')}>
                Active Only
                {isActiveFilter === 'true' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('false')}>
                Inactive Only
                {isActiveFilter === 'false' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <HasPermission permission="Employee.Create">
          <Button onClick={() => router.push('/employees/new')}>
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </HasPermission>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Branches</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 p-0">
                  <PremiumLoader text="Loading employees..." />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-destructive">
                  Error loading employees. Please try again.
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <UserX className="h-8 w-8 mb-2 opacity-50" />
                    <p>No employees found.</p>
                    <p className="text-sm">Adjust your filters or create a new employee.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <Link href={`/employees/${employee.id}`} className="hover:underline flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium overflow-hidden">
                        {employee.profileImageId ? (
                          <img src={employee.profileImageId} alt={`${employee.firstName} ${employee.lastName}`} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          `${employee.firstName[0]}${employee.lastName[0]}`
                        )}
                      </div>
                      <div>
                        {employee.firstName} {employee.lastName}
                        {employee.userId && <Badge variant="secondary" className="ml-2 text-[10px] px-1 py-0 h-4">Linked</Badge>}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {employee.role?.name || <span className="text-muted-foreground text-xs italic">Unassigned</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      {employee.phone ? (
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground"/> {employee.phone}</span>
                      ) : <span className="text-muted-foreground text-xs italic">No phone</span>}
                      
                      {employee.email && (
                        <span className="flex items-center gap-1 text-muted-foreground mt-0.5"><Mail className="h-3 w-3"/> {employee.email}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {employee.branches && employee.branches.length > 0 ? (
                      <span className="text-sm">{employee.branches.length} branch(es)</span>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.isActive ? 'default' : 'secondary'} className={employee.isActive ? 'bg-green-600 hover:bg-green-700' : ''}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        
                        <DropdownMenuItem onClick={() => router.push(`/employees/${employee.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        
                        <HasPermission permission="Employee.Update">
                          <DropdownMenuItem onClick={() => router.push(`/employees/${employee.id}/edit`)}>
                            Edit Employee
                          </DropdownMenuItem>
                        </HasPermission>
                        
                        <DropdownMenuSeparator />
                        
                        {employee.phone && (
                          <DropdownMenuItem onClick={() => copyToClipboard(employee.phone!, 'Phone')}>
                            <Copy className="mr-2 h-4 w-4" /> Copy Phone
                          </DropdownMenuItem>
                        )}
                        
                        {employee.email && (
                          <DropdownMenuItem onClick={() => copyToClipboard(employee.email!, 'Email')}>
                            <Copy className="mr-2 h-4 w-4" /> Copy Email
                          </DropdownMenuItem>
                        )}

                        <HasPermission permission="Employee.Manage">
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusToggle(employee)}>
                            {employee.isActive ? (
                              <><UserX className="mr-2 h-4 w-4 text-destructive" /> Deactivate</>
                            ) : (
                              <><UserCog className="mr-2 h-4 w-4 text-green-600" /> Activate</>
                            )}
                          </DropdownMenuItem>
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

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {data?.meta.total !== undefined ? (
            <>Showing {data.data.length} of {data.meta.total} employees</>
          ) : (
            <Skeleton className="h-4 w-48" />
          )}
        </div>
        
        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {page} of {data.meta.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= data.meta.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

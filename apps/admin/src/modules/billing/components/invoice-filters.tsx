'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { InvoiceStatus } from '../billing.types';
import { useBranches } from '@/modules/appointment/appointment.hooks';

export function InvoiceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: branchesData } = useBranches();
  const branches = branchesData?.data || [];

  const currentStatus = searchParams.get('status') || '';
  const currentBranchId = searchParams.get('branchId') || '';
  const currentDateRange = searchParams.get('dateRange') || '';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('status');
    params.delete('branchId');
    params.delete('dateRange');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFilters = currentStatus || currentBranchId || currentDateRange;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" className="h-10">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="ml-2 flex h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter Invoices</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => updateFilters('status', '')}>
                <span className={currentStatus === '' ? 'font-bold' : ''}>All Statuses</span>
              </DropdownMenuItem>
              {Object.values(InvoiceStatus).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => updateFilters('status', status)}
                >
                  <span className={currentStatus === status ? 'font-bold' : ''}>{status}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Branch</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => updateFilters('branchId', '')}>
                <span className={currentBranchId === '' ? 'font-bold' : ''}>All Branches</span>
              </DropdownMenuItem>
              {branches.map((branch: any) => (
                <DropdownMenuItem
                  key={branch.id}
                  onClick={() => updateFilters('branchId', branch.id)}
                >
                  <span className={currentBranchId === branch.id ? 'font-bold' : ''}>{branch.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Date Range</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => updateFilters('dateRange', '')}>
                <span className={currentDateRange === '' ? 'font-bold' : ''}>All Time</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateFilters('dateRange', 'today')}>
                <span className={currentDateRange === 'today' ? 'font-bold' : ''}>Today</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateFilters('dateRange', 'yesterday')}>
                <span className={currentDateRange === 'yesterday' ? 'font-bold' : ''}>Yesterday</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateFilters('dateRange', 'this_week')}>
                <span className={currentDateRange === 'this_week' ? 'font-bold' : ''}>This Week</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateFilters('dateRange', 'this_month')}>
                <span className={currentDateRange === 'this_month' ? 'font-bold' : ''}>This Month</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        {hasFilters && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearFilters} className="text-destructive focus:text-destructive">
              Clear Filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

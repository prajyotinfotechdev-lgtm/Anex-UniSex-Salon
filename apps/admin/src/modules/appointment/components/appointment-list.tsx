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
  RefreshCcw,
  CheckCircle2,
  XCircle,
  PlayCircle,
  CheckSquare,
  UserX,
  Eye,
  CalendarDays,
} from 'lucide-react';
import { useAppointments, useConfirmAppointment, useCheckInAppointment, useStartAppointment, useCompleteAppointment, useNoShowAppointment } from '../appointment.hooks';
import { Appointment, AppointmentStatus } from '../appointment.types';
import { AppointmentStatusBadge } from './appointment-status-badge';
import { format } from 'date-fns';
import { HasPermission } from '@/shared/components/HasPermission';
import { toast } from 'sonner';

export function AppointmentList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const status = searchParams.get('status') || '';

  // Queries
  const { data, isLoading, isError, refetch, isFetching } = useAppointments({
    page,
    limit,
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(status && { status }),
  });

  // Mutations
  const confirmMutation = useConfirmAppointment('');
  const checkInMutation = useCheckInAppointment('');
  const startMutation = useStartAppointment('');
  const completeMutation = useCompleteAppointment('');
  const noShowMutation = useNoShowAppointment('');

  const handleAction = async (id: string, action: 'confirm' | 'checkin' | 'start' | 'complete' | 'noshow') => {
    try {
      if (action === 'confirm') await confirmMutation.mutateAsync(id as any);
      if (action === 'checkin') await checkInMutation.mutateAsync(id as any);
      if (action === 'start') await startMutation.mutateAsync(id as any);
      if (action === 'complete') await completeMutation.mutateAsync(id as any);
      if (action === 'noshow') await noShowMutation.mutateAsync(id as any);
    } catch (e) {
      // Error handled by hook
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const getCustomerName = (app: Appointment) => {
    if (app.customer) {
      return `${app.customer.firstName} ${app.customer.lastName}`;
    }
    return 'Walk-In Customer';
  };

  const getServicesSummary = (app: Appointment) => {
    if (!app.items || app.items.length === 0) return 'No services';
    const names = app.items.map(i => i.service?.name).filter(Boolean);
    return names.join(', ');
  };

  const getEmployeeSummary = (app: Appointment) => {
    if (!app.items || app.items.length === 0) return 'Unassigned';
    const names = app.items.map(i => i.employee ? `${i.employee.firstName}` : null).filter(Boolean);
    return Array.from(new Set(names)).join(', ');
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-destructive/10 text-destructive">
        <p>Failed to load appointments. Please try again.</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Employee(s)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 p-0">
                  <PremiumLoader text="Loading appointments..." />
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{format(new Date(app.date), 'MMM d, yyyy')}</span>
                      <span className="text-sm text-muted-foreground">
                        {app.items?.[0]?.startTime ? format(new Date(app.items[0].startTime), 'h:mm a') : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{getCustomerName(app)}</span>
                      {app.customer?.primaryPhone && <span className="text-xs text-muted-foreground">{app.customer.primaryPhone}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {getServicesSummary(app)}
                  </TableCell>
                  <TableCell>
                    {getEmployeeSummary(app)}
                  </TableCell>
                  <TableCell>
                    <AppointmentStatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        
                        <DropdownMenuItem onClick={() => router.push(`/appointments/${app.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <HasPermission permission="Appointment.Update">
                          {app.status === AppointmentStatus.PENDING && (
                            <DropdownMenuItem onClick={() => handleAction(app.id, 'confirm')}>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" />
                              Confirm
                            </DropdownMenuItem>
                          )}
                          {app.status === AppointmentStatus.CONFIRMED && (
                            <DropdownMenuItem onClick={() => handleAction(app.id, 'checkin')}>
                              <UserX className="h-4 w-4 mr-2 text-indigo-500" />
                              Check In
                            </DropdownMenuItem>
                          )}
                          {app.status === AppointmentStatus.ARRIVED && (
                            <DropdownMenuItem onClick={() => handleAction(app.id, 'start')}>
                              <PlayCircle className="h-4 w-4 mr-2 text-purple-500" />
                              Start Service
                            </DropdownMenuItem>
                          )}
                          {app.status === AppointmentStatus.IN_PROGRESS && (
                            <DropdownMenuItem onClick={() => handleAction(app.id, 'complete')}>
                              <CheckSquare className="h-4 w-4 mr-2 text-emerald-500" />
                              Complete
                            </DropdownMenuItem>
                          )}
                          {[AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(app.status) && (
                            <>
                              <DropdownMenuItem onClick={() => handleAction(app.id, 'noshow')}>
                                <UserX className="h-4 w-4 mr-2 text-slate-500" />
                                Mark No-Show
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => router.push(`/appointments/${app.id}?action=cancel`)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
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

      {/* Pagination Controls */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isFetching}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground mx-4">
            Page {page} of {data.meta.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === data.meta.totalPages || isFetching}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

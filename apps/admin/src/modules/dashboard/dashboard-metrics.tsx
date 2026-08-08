'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/shared/api/dashboard.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Calendar, ArrowUpRight } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/premium-loader';

export function DashboardMetrics() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => getDashboardSummary(),
  });

  if (isLoading) return <PremiumLoader text="Loading metrics..." />;
  if (error || !data) return <div>Failed to load metrics.</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{data.todaysRevenue?.toFixed(2) || '0.00'}</div>
          <p className="text-xs text-muted-foreground">Collected today</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.todaysAppointments || 0}</div>
          <p className="text-xs text-muted-foreground">Scheduled for today</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{data.newCustomers || 0}</div>
          <p className="text-xs text-muted-foreground">Added today</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{data.outstandingPayments?.toFixed(2) || '0.00'}</div>
          <p className="text-xs text-muted-foreground">Total unpaid</p>
        </CardContent>
      </Card>
    </div>
  );
}

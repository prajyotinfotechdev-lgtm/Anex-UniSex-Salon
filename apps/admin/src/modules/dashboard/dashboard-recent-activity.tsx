'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/shared/api/dashboard.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, CreditCard, Clock, TrendingUp } from 'lucide-react';

export function DashboardRecentActivity() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => getDashboardSummary(),
  });

  const stats = [
    {
      label: "Today's Appointments",
      value: isLoading ? '—' : (data?.todaysAppointments ?? 0),
      sublabel: 'Scheduled for today',
      icon: CalendarClock,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Pending Payments',
      value: isLoading ? '—' : `₹${(data?.outstandingPayments ?? 0).toFixed(2)}`,
      sublabel: 'Total outstanding',
      icon: CreditCard,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: "Today's Revenue",
      value: isLoading ? '—' : `₹${(data?.todaysRevenue ?? 0).toFixed(2)}`,
      sublabel: 'Collected today',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'New Customers',
      value: isLoading ? '—' : `+${data?.newCustomers ?? 0}`,
      sublabel: 'Joined today',
      icon: Clock,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50"
            >
              <div className={`p-2 rounded-md ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.sublabel}</p>
              </div>
              <div className="text-sm font-bold tabular-nums">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

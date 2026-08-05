'use client';

import { useQuery } from '@tanstack/react-query';
import { getAppointmentTrend } from '@/shared/api/dashboard.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export function DashboardAppointmentChart() {
  const endDate = new Date().toISOString();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Last 7 days

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.appointments({ startDate: startDate.toISOString(), endDate }),
    queryFn: () => getAppointmentTrend(startDate.toISOString(), endDate),
  });

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Appointments Trend (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {isLoading ? (
          <div className="h-[350px] flex items-center justify-center">Loading chart...</div>
        ) : error || !data ? (
          <div className="h-[350px] flex items-center justify-center">Failed to load chart data</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: string) => new Date(value).toLocaleDateString(undefined, { weekday: 'short' })}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                labelFormatter={(label: unknown) => new Date(label as string).toLocaleDateString()}
                formatter={(value: unknown) => [`${value}`, 'Appointments']}
              />
              <Line type="monotone" dataKey="appointments" stroke="currentColor" strokeWidth={2} className="stroke-primary" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

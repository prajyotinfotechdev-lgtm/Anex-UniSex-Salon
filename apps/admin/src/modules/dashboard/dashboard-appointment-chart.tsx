'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Mock function until API is ready
const getAppointmentTrend = async () => {
  return [
    { date: '2024-01-01', appointments: 12 },
    { date: '2024-01-02', appointments: 15 },
    { date: '2024-01-03', appointments: 10 },
    { date: '2024-01-04', appointments: 22 },
    { date: '2024-01-05', appointments: 18 },
    { date: '2024-01-06', appointments: 25 },
    { date: '2024-01-07', appointments: 16 },
  ];
};

export function DashboardAppointmentChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'appointments-trend'],
    queryFn: () => getAppointmentTrend(),
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
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { weekday: 'short' })}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                labelFormatter={(label: any) => new Date(label).toLocaleDateString()}
                formatter={(value: any) => [`${value}`, 'Appointments']}
              />
              <Line type="monotone" dataKey="appointments" stroke="currentColor" strokeWidth={2} className="stroke-primary" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

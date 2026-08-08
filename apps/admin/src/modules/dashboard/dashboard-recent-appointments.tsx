'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppointments } from '@/modules/appointment/appointment.hooks';
import { format, startOfDay, endOfDay, addDays } from 'date-fns';
import { Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function DashboardRecentAppointments() {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState('all');

  const getStartDate = () => {
    if (dateFilter === 'today') return startOfDay(new Date()).toISOString();
    if (dateFilter === 'tomorrow') return startOfDay(addDays(new Date(), 1)).toISOString();
    return undefined;
  };

  const getEndDate = () => {
    if (dateFilter === 'today') return endOfDay(new Date()).toISOString();
    if (dateFilter === 'tomorrow') return endOfDay(addDays(new Date(), 1)).toISOString();
    return undefined;
  };

  const { data, isLoading } = useAppointments({ 
    limit: 10,
    sortField: 'date',
    sortOrder: 'asc',
    startDate: getStartDate(),
    endDate: getEndDate(),
  });

  const appointments = data?.data || [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent & Upcoming</CardTitle>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Select date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-3 pt-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">No appointments found.</div>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => router.push(`/appointments/${appointment.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {appointment.customer?.firstName} {appointment.customer?.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {appointment.items?.[0]?.employee?.firstName || 'Staff'} - {appointment.items?.[0]?.service?.name || 'Service'}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-sm font-medium">
                    {format(new Date(appointment.items?.[0]?.startTime || appointment.date), 'h:mm a')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(appointment.date), 'MMM d, yyyy')}
                  </div>
                  <Badge variant={appointment.status === 'PENDING' ? 'outline' : 'secondary'} className="mt-1 text-[10px] px-1.5 py-0">
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

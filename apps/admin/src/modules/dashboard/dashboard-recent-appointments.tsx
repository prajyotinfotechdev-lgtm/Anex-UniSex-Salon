'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppointments } from '@/modules/appointment/appointment.hooks';
import { format } from 'date-fns';
import { Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export function DashboardRecentAppointments() {
  const router = useRouter();
  // Fetch today's appointments or all recent upcoming appointments
  const { data, isLoading } = useAppointments({ 
    limit: 5,
    sortField: 'date',
    sortOrder: 'asc',
    // We ideally want from today onwards, but for simple recent we just get the ones coming up
    status: 'SCHEDULED' 
  });

  const appointments = data?.data || [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent & Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">No scheduled appointments found.</div>
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
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {format(new Date(appointment.items?.[0]?.startTime || appointment.date), 'h:mm a')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(appointment.date), 'MMM d, yyyy')}
                  </div>
                  <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
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

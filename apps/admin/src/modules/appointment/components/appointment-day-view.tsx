'use client';

import * as React from 'react';
import { Appointment, AppointmentStatus } from '../appointment.types';
import { useEmployees } from '../../employee/employee.hooks';
import { format, parseISO, differenceInMinutes, startOfDay, addMinutes, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AppointmentStatusBadge } from './appointment-status-badge';
import { useRouter } from 'next/navigation';

interface AppointmentDayViewProps {
  date: Date;
  appointments: Appointment[];
  isLoading: boolean;
}

export function AppointmentDayView({ date, appointments, isLoading }: AppointmentDayViewProps) {
  const router = useRouter();
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({ limit: 100 });
  const employees = employeesData?.data || [];

  // Configuration for the calendar
  const startHour = 8; // 8 AM
  const endHour = 20; // 8 PM
  const slotDuration = 30; // 30 min slots for the grid lines
  const totalMinutes = (endHour - startHour) * 60;
  
  // Create an array of times for the left axis
  const timeSlots = [];
  for (let i = startHour; i <= endHour; i++) {
    timeSlots.push(`${i === 12 ? 12 : i % 12}:00 ${i >= 12 ? 'PM' : 'AM'}`);
    if (i !== endHour) {
      timeSlots.push(`${i === 12 ? 12 : i % 12}:30 ${i >= 12 ? 'PM' : 'AM'}`);
    }
  }

  // Filter appointments for the specific date
  const todaysAppointments = appointments.filter(app => {
    return isSameDay(new Date(app.date), date);
  });

  const getEventStyle = (startTimeStr: string, durationMin: number) => {
    const start = parseISO(startTimeStr);
    const dayStart = startOfDay(start);
    const gridStart = addMinutes(dayStart, startHour * 60);
    
    const minutesFromStart = differenceInMinutes(start, gridStart);
    
    // Calculate CSS top and height percentages based on the total minutes in the view
    const top = Math.max(0, (minutesFromStart / totalMinutes) * 100);
    const height = (durationMin / totalMinutes) * 100;
    
    return {
      top: `${top}%`,
      height: `${height}%`,
      minHeight: '2rem' // Ensure tiny appointments are clickable
    };
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING: return 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100';
      case AppointmentStatus.CONFIRMED: return 'bg-blue-100 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:border-blue-800 text-blue-900 dark:text-blue-100';
      case AppointmentStatus.ARRIVED: return 'bg-indigo-100 border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100';
      case AppointmentStatus.IN_PROGRESS: return 'bg-purple-100 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/50 dark:border-purple-800 text-purple-900 dark:text-purple-100';
      case AppointmentStatus.COMPLETED: return 'bg-emerald-100 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100';
      case AppointmentStatus.CANCELLED:
      case AppointmentStatus.NO_SHOW: return 'bg-slate-100 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500 opacity-60';
      default: return 'bg-primary/10 border-primary/20 text-primary';
    }
  };

  if (isLoading || isLoadingEmployees) {
    return (
      <div className="flex flex-col h-[600px]">
        <Skeleton className="w-full h-12 mb-4" />
        <div className="flex-1 flex gap-4">
          <Skeleton className="w-16 h-full" />
          <Skeleton className="flex-1 h-full" />
          <Skeleton className="flex-1 h-full" />
          <Skeleton className="flex-1 h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md bg-background overflow-hidden flex flex-col h-[700px]">
      {/* Header with Employees */}
      <div className="flex border-b">
        <div className="w-20 shrink-0 border-r bg-muted/30" />
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-full">
            {employees.map(emp => (
              <div key={emp.id} className="flex-1 min-w-[200px] border-r p-3 text-center bg-muted/10 font-medium text-sm">
                {emp.firstName} {emp.lastName}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Body */}
      <div className="flex flex-1 overflow-y-auto">
        {/* Time Axis */}
        <div className="w-20 shrink-0 border-r bg-muted/10 relative">
          {timeSlots.map((time, i) => (
            <div 
              key={i} 
              className="absolute w-full text-xs text-muted-foreground text-right pr-2 -mt-2"
              style={{ top: `${(i / (timeSlots.length - 1)) * 100}%` }}
            >
              {time}
            </div>
          ))}
        </div>

        {/* Employee Columns */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-full h-full relative" style={{ minHeight: '1200px' }}>
            
            {/* Horizontal Grid Lines */}
            {timeSlots.map((_, i) => (
              <div 
                key={i} 
                className="absolute w-full border-b border-border/50"
                style={{ top: `${(i / (timeSlots.length - 1)) * 100}%` }}
              />
            ))}

            {/* Employee Columns (Vertical Dividers & Events) */}
            {employees.map(emp => {
              // Find items for this employee
              const employeeItems = todaysAppointments.flatMap(app => {
                return (app.items || [])
                  .filter(item => item.employeeId === emp.id)
                  .map(item => ({ app, item }));
              });

              return (
                <div key={emp.id} className="flex-1 min-w-[200px] border-r relative">
                  {employeeItems.map(({ app, item }) => {
                    const style = getEventStyle(item.startTime, item.durationMinutes);
                    return (
                      <div
                        key={item.id}
                        onClick={() => router.push(`/appointments/${app.id}`)}
                        className={cn(
                          "absolute inset-x-1 rounded-md border p-2 text-xs cursor-pointer overflow-hidden flex flex-col gap-1 shadow-sm transition-all",
                          getStatusColor(app.status)
                        )}
                        style={style}
                        title={`${app.customer?.firstName} - ${item.service?.name}`}
                      >
                        <div className="font-semibold truncate">
                          {app.customer ? `${app.customer.firstName} ${app.customer.lastName}` : 'Walk-In'}
                        </div>
                        <div className="truncate opacity-90">{item.service?.name}</div>
                        <div className="mt-auto pt-1 opacity-75 text-[10px]">
                          {format(parseISO(item.startTime), 'h:mm a')} - {format(parseISO(item.endTime), 'h:mm a')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import * as React from 'react';
import { Appointment, AppointmentStatus } from '../appointment.types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CheckCircle2, Circle } from 'lucide-react';

interface AppointmentTimelineProps {
  appointment: Appointment;
}

const statusOrder = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.ARRIVED,
  AppointmentStatus.IN_PROGRESS,
  AppointmentStatus.COMPLETED,
];

export function AppointmentTimeline({ appointment }: AppointmentTimelineProps) {
  const isCancelled = appointment.status === AppointmentStatus.CANCELLED;
  const isNoShow = appointment.status === AppointmentStatus.NO_SHOW;

  const getStatusTime = (status: AppointmentStatus): string | null => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return appointment.createdAt;
      case AppointmentStatus.CONFIRMED:
        return appointment.confirmedAt;
      case AppointmentStatus.ARRIVED:
        return appointment.checkedInAt;
      case AppointmentStatus.IN_PROGRESS:
        // No specific 'startedAt' on main appointment in DTO, fallback to checkedInAt or wait
        // The DTO doesn't have startedAt on the root appointment. Let's assume checkedInAt is the closest, or it's just marked without a timestamp.
        return null;
      case AppointmentStatus.COMPLETED:
        return appointment.completedAt;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING: return 'Created';
      case AppointmentStatus.CONFIRMED: return 'Confirmed';
      case AppointmentStatus.ARRIVED: return 'Arrived';
      case AppointmentStatus.IN_PROGRESS: return 'Started';
      case AppointmentStatus.COMPLETED: return 'Completed';
      default: return status;
    }
  };

  if (isCancelled || isNoShow) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium line-through text-muted-foreground">Created</span>
            <span className="text-xs text-muted-foreground">{format(new Date(appointment.createdAt), 'MMM d, h:mm a')}</span>
          </div>
        </div>
        <div className="relative pl-2.5">
          <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border -ml-px" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-5 w-5 rounded-full border-2 border-destructive flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-destructive" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-destructive">
              {isCancelled ? 'Cancelled' : 'No Show'}
            </span>
            {appointment.cancelledAt && (
              <span className="text-xs text-muted-foreground">{format(new Date(appointment.cancelledAt), 'MMM d, h:mm a')}</span>
            )}
            {appointment.cancellationReason && (
              <span className="text-xs text-muted-foreground italic mt-1">&quot;{appointment.cancellationReason}&quot;</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(appointment.status);

  return (
    <div className="space-y-6">
      {statusOrder.map((status, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const time = getStatusTime(status);
        
        return (
          <div key={status} className="relative">
            {index !== statusOrder.length - 1 && (
              <div 
                className={cn(
                  "absolute left-2.5 top-6 bottom-[-24px] w-px -ml-px transition-colors duration-500",
                  isPast ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <div className="flex items-start space-x-3">
              {isPast || isCurrent ? (
                <CheckCircle2 className={cn("h-5 w-5 z-10 bg-background", isCurrent ? "text-primary" : "text-primary/70")} />
              ) : (
                <Circle className="h-5 w-5 z-10 bg-background text-muted-foreground" />
              )}
              <div className="flex flex-col mt-0.5">
                <span className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-foreground" : isPast ? "text-foreground/80" : "text-muted-foreground"
                )}>
                  {getStatusLabel(status)}
                </span>
                {time && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(time), 'MMM d, h:mm a')}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

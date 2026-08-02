import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { AppointmentStatus } from '../appointment.types';
import {
  Clock,
  CheckCircle2,
  PlayCircle,
  CheckSquare,
  XCircle,
  UserX,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
  showIcon?: boolean;
}

export function AppointmentStatusBadge({ status, className, showIcon = true }: AppointmentStatusBadgeProps) {
  const config = {
    [AppointmentStatus.PENDING]: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-500',
    },
    [AppointmentStatus.CONFIRMED]: {
      label: 'Confirmed',
      icon: CheckCircle2,
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400',
    },
    [AppointmentStatus.ARRIVED]: {
      label: 'Arrived',
      icon: MapPin,
      className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80 dark:bg-indigo-900/30 dark:text-indigo-400',
    },
    [AppointmentStatus.IN_PROGRESS]: {
      label: 'In Progress',
      icon: PlayCircle,
      className: 'bg-purple-100 text-purple-800 hover:bg-purple-100/80 dark:bg-purple-900/30 dark:text-purple-400',
    },
    [AppointmentStatus.COMPLETED]: {
      label: 'Completed',
      icon: CheckSquare,
      className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 dark:bg-emerald-900/30 dark:text-emerald-500',
    },
    [AppointmentStatus.CANCELLED]: {
      label: 'Cancelled',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-500',
    },
    [AppointmentStatus.NO_SHOW]: {
      label: 'No Show',
      icon: UserX,
      className: 'bg-slate-100 text-slate-800 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-400',
    },
  };

  const { label, icon: Icon, className: variantClass } = config[status];

  return (
    <Badge variant="outline" className={cn('font-medium border-transparent', variantClass, className)}>
      {showIcon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
      {label}
    </Badge>
  );
}

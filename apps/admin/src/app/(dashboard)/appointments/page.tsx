import { Metadata } from 'next';
import { Suspense } from 'react';
import { AppointmentCalendar } from '@/modules/appointment/components/appointment-calendar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { HasPermission } from '@/shared/components/HasPermission';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Appointments - ANEX OS',
  description: 'Manage salon appointments',
};

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage salon appointments and schedules.
          </p>
        </div>
        <HasPermission permission="Appointment.Create">
          <Link href="/appointments/new" className={cn(buttonVariants({ variant: 'default' }))}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </HasPermission>
      </div>

      <Suspense fallback={<div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
        <AppointmentCalendar />
      </Suspense>
    </div>
  );
}

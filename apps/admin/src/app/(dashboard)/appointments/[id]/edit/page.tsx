'use client';

import * as React from 'react';
import { AppointmentForm } from '@/modules/appointment/components/appointment-form';
import { useAppointment } from '@/modules/appointment/appointment.hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';

export default function EditAppointmentPage({ params }: { params: { id: string } }) {
  const { data: appointment, isLoading, isError } = useAppointment(params.id);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (isError || !appointment) {
    return notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Appointment</h1>
        <p className="text-muted-foreground">
          Modify the appointment details below.
        </p>
      </div>

      <AppointmentForm initialData={appointment} isEditing />
    </div>
  );
}

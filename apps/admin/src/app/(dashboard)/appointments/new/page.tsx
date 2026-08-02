import { Metadata } from 'next';
import { AppointmentForm } from '@/modules/appointment/components/appointment-form';

export const metadata: Metadata = {
  title: 'New Appointment - ANEX OS',
  description: 'Create a new appointment',
};

export default function NewAppointmentPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Appointment</h1>
        <p className="text-muted-foreground">
          Book a new appointment for a customer.
        </p>
      </div>

      <AppointmentForm />
    </div>
  );
}

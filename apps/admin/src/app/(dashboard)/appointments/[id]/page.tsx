'use client';

import * as React from 'react';
import { useAppointment, useConfirmAppointment, useCheckInAppointment, useStartAppointment, useCompleteAppointment, useNoShowAppointment, useCancelAppointment, useUpdateNotes } from '@/modules/appointment/appointment.hooks';
import { AppointmentStatusBadge } from '@/modules/appointment/components/appointment-status-badge';
import { AppointmentTimeline } from '@/modules/appointment/components/appointment-timeline';
import { RescheduleDialog } from '@/modules/appointment/components/reschedule-dialog';
import { AppointmentStatus } from '@/modules/appointment/appointment.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { Textarea } from '@/components/ui/textarea';
import { format, parseISO } from 'date-fns';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Edit, 
  MapPin, 
  Phone, 
  PlayCircle, 
  User,
  CheckSquare,
  UserX,
  XCircle,
  CalendarClock,
  Sparkles
} from 'lucide-react';
import { HasPermission } from '@/shared/components/HasPermission';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: appointment, isLoading, isError } = useAppointment(params.id);

  const confirmMutation = useConfirmAppointment(params.id);
  const checkInMutation = useCheckInAppointment(params.id);
  const startMutation = useStartAppointment(params.id);
  const completeMutation = useCompleteAppointment(params.id);
  const noShowMutation = useNoShowAppointment(params.id);
  const cancelMutation = useCancelAppointment(params.id);
  const updateNotesMutation = useUpdateNotes(params.id);

  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(searchParams.get('action') === 'cancel');
  const [cancelReason, setCancelReason] = React.useState('');

  const [notes, setNotes] = React.useState('');
  const [internalNotes, setInternalNotes] = React.useState('');

  React.useEffect(() => {
    if (appointment) {
      setNotes(appointment.notes || '');
      setInternalNotes(appointment.internalNotes || '');
    }
  }, [appointment]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !appointment) {
    return notFound();
  }

  const handleSaveNotes = () => {
    updateNotesMutation.mutate({ notes, internalNotes });
  };

  const handleCancel = async () => {
    await cancelMutation.mutateAsync(cancelReason);
    setIsCancelOpen(false);
  };

  const totalDuration = appointment.items?.reduce((acc, item) => acc + item.durationMinutes, 0) || 0;
  const totalPrice = appointment.items?.reduce((acc, item) => acc + item.price, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {appointment.customer ? `${appointment.customer.firstName} ${appointment.customer.lastName}` : 'Walk-In'}
            </h1>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <p className="text-muted-foreground flex items-center mt-1">
            <CalendarDays className="h-4 w-4 mr-2" />
            {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}
            {appointment.items?.[0] && (
              <>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-2" />
                {format(parseISO(appointment.items[0].startTime), 'h:mm a')}
              </>
            )}
          </p>
        </div>
        
        <HasPermission permission="Appointment.Update">
          <div className="flex items-center space-x-2">
            {[AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(appointment.status) && (
              <Button variant="outline" onClick={() => setIsRescheduleOpen(true)}>
                <CalendarClock className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push(`/appointments/${appointment.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </HasPermission>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 70% */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointment.customer ? (
                  <>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground mr-3" />
                      {appointment.customer.primaryPhone || 'N/A'}
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mr-3" />
                      {appointment.customer.email || 'N/A'}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Walk-in customer, no profile attached.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Billing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Services</span>
                  <span>{appointment.items?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Duration</span>
                  <span>{totalDuration} mins</span>
                </div>
                <hr className="my-2 border-border" />
                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Requested Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointment.items?.map((item, index) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-muted/20 gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{item.service?.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        with {item.employee?.firstName} {item.employee?.lastName}
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1">
                      <div className="text-sm font-medium bg-background px-2 py-1 rounded-md border shadow-sm flex items-center">
                        <Clock className="h-3 w-3 mr-1.5 text-muted-foreground" />
                        {format(parseISO(item.startTime), 'h:mm a')} - {format(parseISO(item.endTime), 'h:mm a')}
                      </div>
                      <span className="font-semibold text-primary">${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {(appointment as any).inspirationPost && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Client's Inspiration
                </CardTitle>
                <CardDescription>
                  The look requested by the customer during booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-6">
                  {((appointment as any).inspirationPost.heroMedia?.url || (appointment as any).inspirationPost.heroMedia?.key) && (
                    <a href={(appointment as any).inspirationPost.heroMedia.url || (appointment as any).inspirationPost.heroMedia.key} target="_blank" rel="noreferrer" className="block w-48 h-48 rounded-lg overflow-hidden border bg-muted flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                      <img 
                        src={(appointment as any).inspirationPost.heroMedia.url || (appointment as any).inspirationPost.heroMedia.key} 
                        alt="Inspiration" 
                        className="w-full h-full object-cover" 
                      />
                    </a>
                  )}
                  <div>
                    <h4 className="font-semibold text-lg">{(appointment as any).inspirationPost.title}</h4>
                    {(appointment as any).inspirationPost.description && (
                      <p className="text-muted-foreground mt-2">{(appointment as any).inspirationPost.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column - 30% */}
        <div className="space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <HasPermission permission="Appointment.Update">
                {appointment.status === AppointmentStatus.PENDING && (
                  <Button className="w-full justify-start" onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm Appointment
                  </Button>
                )}
                {appointment.status === AppointmentStatus.CONFIRMED && (
                  <Button className="w-full justify-start" onClick={() => checkInMutation.mutate()} disabled={checkInMutation.isPending}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Mark Arrived (Check-In)
                  </Button>
                )}
                {appointment.status === AppointmentStatus.ARRIVED && (
                  <Button className="w-full justify-start" onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Service
                  </Button>
                )}
                {appointment.status === AppointmentStatus.IN_PROGRESS && (
                  <Button className="w-full justify-start" onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Complete Appointment
                  </Button>
                )}
                
                <hr className="my-2 border-border" />
                
                {[AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(appointment.status) && (
                  <>
                    <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => noShowMutation.mutate()} disabled={noShowMutation.isPending}>
                      <UserX className="h-4 w-4 mr-2" />
                      Mark No-Show
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setIsCancelOpen(true)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </Button>
                  </>
                )}
              </HasPermission>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentTimeline appointment={appointment} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Notes</label>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Notes visible to customer..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-destructive">Internal Notes (Staff Only)</label>
                <Textarea 
                  value={internalNotes} 
                  onChange={(e) => setInternalNotes(e.target.value)} 
                  placeholder="Private staff notes..."
                  className="min-h-[100px] border-destructive/20 focus-visible:ring-destructive/30"
                />
              </div>
              <Button 
                className="w-full" 
                variant="secondary" 
                onClick={handleSaveNotes}
                disabled={updateNotesMutation.isPending || (notes === (appointment.notes||'') && internalNotes === (appointment.internalNotes||''))}
              >
                Save Notes
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

      <RescheduleDialog 
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        appointment={appointment}
      />

      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            <label className="text-sm font-medium block mb-2">Cancellation Reason (Optional)</label>
            <Textarea 
              value={cancelReason} 
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer requested via phone"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsCancelOpen(false)}>Keep Appointment</Button>
            <Button variant="destructive" onClick={handleCancel}>Yes, Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

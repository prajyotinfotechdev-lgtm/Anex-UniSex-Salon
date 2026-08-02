'use client';
 

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Appointment, rescheduleAppointmentSchema, RescheduleAppointmentValues } from '../appointment.types';
import { useGenerateSlots, useRescheduleAppointment } from '../appointment.hooks';
import { toast } from 'sonner';

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
}

export function RescheduleDialog({ isOpen, onClose, appointment }: RescheduleDialogProps) {
  const generateSlotsMutation = useGenerateSlots();
  const rescheduleMutation = useRescheduleAppointment(appointment.id);
  const [availableSlots, setAvailableSlots] = React.useState<{ startTime: string; endTime: string }[]>([]);

  // We are assuming a single-service appointment for this simple reschedule modal,
  // or we just reschedule the first item. The backend expects a simple date/startTime change for the whole appointment or specific items?
  // Our backend `PATCH /appointments/:id/reschedule` expects `{ date, startTime }`.
  // Wait, if an appointment has multiple items, the backend reschedules them sequentially based on the first one, or maybe it just expects the new start time for the first item.
  // Let's rely on the simple schema: date and startTime.

  const form = useForm<RescheduleAppointmentValues>({
    resolver: zodResolver(rescheduleAppointmentSchema),
    defaultValues: {
      date: format(new Date(appointment.date), 'yyyy-MM-dd'),
      startTime: appointment.items?.[0]?.startTime || '',
    },
  });

  const watchDate = form.watch('date');
  
  // The first item drives the slot generation
  const firstItem = appointment.items?.[0];

  React.useEffect(() => {
    if (isOpen && watchDate && firstItem) {
      generateSlotsMutation.mutateAsync({
        branchId: appointment.branchId,
        date: watchDate,
        serviceId: firstItem.serviceId,
        employeeId: firstItem.employeeId,
      }).then(res => {
        setAvailableSlots(res || []);
      }).catch(() => {
        setAvailableSlots([]);
      });
    }
   
  }, [isOpen, watchDate]);

  const onSubmit = async (data: RescheduleAppointmentValues) => {
    try {
      await rescheduleMutation.mutateAsync(data);
      onClose();
    } catch (e) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Choose a new date and time. This will re-verify availability for the assigned employee.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    New Time Slot
                    {generateSlotsMutation.isPending && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={generateSlotsMutation.isPending || availableSlots.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={availableSlots.length === 0 ? "No slots available" : "Select an available slot"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot.startTime} value={slot.startTime}>
                          {format(parseISO(slot.startTime), 'h:mm a')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={rescheduleMutation.isPending}>
                {rescheduleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Reschedule
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

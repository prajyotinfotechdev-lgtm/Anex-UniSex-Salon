'use client';
 

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentFormSchema, AppointmentFormValues, AppointmentStatus, AppointmentSource } from '../appointment.types';
import { useCreateAppointment, useUpdateAppointment, useGenerateSlots } from '../appointment.hooks';
import { useCustomers } from '../../customer/customer.hooks';
import { useBranches } from '../appointment.hooks';
import { useServices } from '../../service/service.hooks';
import { useEmployees } from '../../employee/employee.hooks';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, parseISO, addMinutes } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface AppointmentFormProps {
  initialData?: any; // The full appointment if editing
  isEditing?: boolean;
}

export function AppointmentForm({ initialData, isEditing = false }: AppointmentFormProps) {
  const router = useRouter();

  // Queries for lookups
  const { data: customersData, isLoading: isLoadingCustomers } = useCustomers({ limit: 500 });
  const { data: branchesData, isLoading: isLoadingBranches } = useBranches();
  const { data: servicesData, isLoading: isLoadingServices } = useServices({ limit: 500 });
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({ limit: 500 });

  // Mutations
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment(initialData?.id || '');
  const generateSlotsMutation = useGenerateSlots();

  // Default Values
  const defaultValues: Partial<AppointmentFormValues> = {
    customerId: initialData?.customerId || '',
    branchId: initialData?.branchId || '',
    date: initialData?.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    source: initialData?.source || AppointmentSource.MANUAL,
    status: initialData?.status || AppointmentStatus.PENDING,
    notes: initialData?.notes || '',
    internalNotes: initialData?.internalNotes || '',
    items: initialData?.items?.map((item: any) => ({
      id: item.id,
      serviceId: item.serviceId,
      employeeId: item.employeeId,
      startTime: item.startTime,
      endTime: item.endTime,
      price: item.price,
    })) || [{ serviceId: '', employeeId: '', startTime: '', endTime: '', price: 0 }],
  };

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema) as any,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // State to hold available slots per item index
  const [availableSlots, setAvailableSlots] = React.useState<Record<number, { startTime: string; endTime: string }[]>>({});

  const watchDate = form.watch('date');
  const watchBranchId = form.watch('branchId');
  const watchItems = (form.watch('items') || []) as AppointmentFormValues['items'];

  // Effect to auto-generate slots when Date, Service, or Employee changes
  React.useEffect(() => {
    watchItems.forEach((item, index) => {
      const prevService = fields[index]?.serviceId;
      const prevEmployee = fields[index]?.employeeId;
      const prevDate = initialData?.date; // simplistic comparison

      // Trigger if we have enough info
      if (watchDate && watchBranchId && item.serviceId && item.employeeId) {
        // Debounce or check if it actually changed to avoid loop
        // In a real app we'd deeply compare, but for simplicity we assume if it's there we can fetch.
        // Let's only fetch if slots aren't loaded for this exact combo.
        // Actually, let's just trigger generateSlots whenever these change.
        
        generateSlotsMutation.mutateAsync({
          branchId: watchBranchId,
          date: watchDate,
          serviceId: item.serviceId,
          employeeId: item.employeeId,
        }).then(res => {
          setAvailableSlots(prev => ({ ...prev, [index]: res }));
        }).catch(() => {
          // Error handled in hook
        });
      }
    });
   
  }, [
    watchDate, 
    watchBranchId, 
    // We stringify a subset of items to only trigger when the core dependencies change
    JSON.stringify(watchItems.map(i => `${i.serviceId}-${i.employeeId}`))
  ]);

  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
        router.push(`/appointments/${initialData.id}`);
      } else {
        const res = await createMutation.mutateAsync(data);
        router.push(`/appointments/${res.id}`);
      }
    } catch (e) {
      // Error handled in mutation hook
    }
  };

  const customers = customersData?.data || [];
  const branches = branchesData?.data || [];
  const services = servicesData?.data || [];
  const employees = employeesData?.data || [];

  if (isLoadingCustomers || isLoadingBranches || isLoadingServices || isLoadingEmployees) {
    return <Skeleton className="w-full h-[500px]" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: Core Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} ({c.primaryPhone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditing}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((b: any) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any specific requests?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="internalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Staff only notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Services Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Services & Time Slots</CardTitle>
            <CardDescription>Select the services, assign employees, and choose available time slots.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((item, index) => {
              const currentSlots = availableSlots[index] || [];
              const isGenerating = generateSlotsMutation.isPending;

              return (
                <div key={item.id} className="p-4 border rounded-lg bg-muted/20 relative space-y-4">
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                    <FormField
                      control={form.control}
                      name={`items.${index}.serviceId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service</FormLabel>
                          <Select onValueChange={(val) => {
                            field.onChange(val);
                            // Auto-set price for convenience (though backend recalculates)
                            const srv = services.find((s: any) => s.id === val);
                            if (srv) form.setValue(`items.${index}.price` as any, Number(srv.basePrice));
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {services.map((s: any) => (
                                <SelectItem key={s.id} value={s.id}>{s.name} - ${s.basePrice}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.employeeId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an employee" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.map((e: any) => (
                                <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Slot Selection */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.startTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Time Slot
                          {isGenerating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                        </FormLabel>
                          <Select 
                            onValueChange={(val) => {
                              field.onChange(val);
                              // Also set endTime based on the selected slot
                              const slot = currentSlots.find((s: any) => s.startTime === val);
                              if (slot) form.setValue(`items.${index}.endTime` as any, slot.endTime);
                            }} 
                            defaultValue={field.value}
                            disabled={!watchDate || !watchBranchId || !watchItems[index]?.serviceId || !watchItems[index]?.employeeId}
                          >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={currentSlots.length === 0 ? "Select service & employee first to load slots" : "Select an available slot"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currentSlots.map((slot) => (
                              <SelectItem key={slot.startTime} value={slot.startTime}>
                                {format(parseISO(slot.startTime), 'h:mm a')} - {format(parseISO(slot.endTime), 'h:mm a')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ serviceId: '', employeeId: '', startTime: '', endTime: '', price: 0 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Service
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Appointment'}
          </Button>
        </div>

      </form>
    </Form>
  );
}

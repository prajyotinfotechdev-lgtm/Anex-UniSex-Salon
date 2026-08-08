'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCreateInvoice } from '../billing.hooks';
import { InvoiceItemType, CreateInvoiceInput } from '../billing.types';
import { useBranches, useAppointments, useAppointment } from '@/modules/appointment/appointment.hooks';
import { useCustomers } from '@/modules/customer/customer.hooks';
import { useServices } from '@/modules/service/service.hooks';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { formatDate } from '@/shared/utils/date';

const invoiceItemSchema = z.object({
  productId: z.string().optional(),
  type: z.nativeEnum(InvoiceItemType),
  snapshottedName: z.string().min(1, 'Item name is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Price must be 0 or more'),
  discount: z.coerce.number().min(0).optional(),
  tax: z.coerce.number().min(0).optional(),
});

const invoiceSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  customerId: z.string().optional().or(z.literal('')),
  appointmentId: z.string().optional().or(z.literal('')),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export function InvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  
  const createMutation = useCreateInvoice();
  
  const { data: branchesData } = useBranches();
  const branches = branchesData?.data || [];
  
  const { data: customersData } = useCustomers({ limit: 100 });
  const customers = customersData?.data || [];
  
  const { data: servicesData } = useServices({ limit: 100 });
  const services = servicesData?.data || [];
  
  const { data: appointmentsData } = useAppointments({ limit: 50, status: 'COMPLETED' });
  const appointments = appointmentsData?.data || [];

  const { data: sourceAppointment } = useAppointment(appointmentId || '');

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      branchId: '',
      customerId: '',
      appointmentId: appointmentId || '',
      notes: '',
      items: [{
        type: InvoiceItemType.SERVICE,
        snapshottedName: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        tax: 0,
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch for totals
  const watchItems = form.watch("items");
  
  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    watchItems.forEach(item => {
      const lineTotal = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);
      subtotal += lineTotal;
      discountTotal += Number(item.discount) || 0;
      taxTotal += Number(item.tax) || 0;
    });

    const grandTotal = subtotal - discountTotal + taxTotal;
    return { subtotal, discountTotal, taxTotal, grandTotal };
  };

  const { subtotal, discountTotal, taxTotal, grandTotal } = calculateTotals();

  // Handle appointment checkout population
  React.useEffect(() => {
    if (sourceAppointment) {
      form.setValue('branchId', sourceAppointment.branchId);
      form.setValue('customerId', sourceAppointment.customerId || '');
      form.setValue('appointmentId', sourceAppointment.id);
      
      if (sourceAppointment.items && sourceAppointment.items.length > 0) {
        form.setValue('items', sourceAppointment.items.map((item: any) => ({
          productId: item.serviceId,
          type: InvoiceItemType.SERVICE,
          snapshottedName: item.snapshottedServiceName || item.service?.name || 'Service',
          quantity: 1,
          unitPrice: Number(item.price) || 0,
          discount: 0,
          tax: 0,
        })));
      }
    }
  }, [sourceAppointment, form]);

  const handleAppointmentSelect = (appId: string) => {
    if (appId) {
      router.replace(`/invoices/new?appointmentId=${appId}`);
    } else {
      router.replace(`/invoices/new`);
      form.reset({
        branchId: '',
        customerId: '',
        appointmentId: '',
        notes: '',
        items: [{
          type: InvoiceItemType.SERVICE,
          snapshottedName: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          tax: 0,
        }],
      });
    }
  };

  const onSubmit = (data: InvoiceFormValues) => {
    const payload: CreateInvoiceInput = {
      branchId: data.branchId,
      customerId: data.customerId || undefined,
      appointmentId: data.appointmentId || undefined,
      notes: data.notes || undefined,
      items: data.items.map(item => ({
        ...item,
        productId: item.productId || undefined,
      })),
    };

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res.data?.id) {
          router.push(`/invoices/${res.data.id}`);
        } else {
          router.push('/invoices');
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
        
        <Card>
          <CardHeader>
            <CardTitle>Invoice Source</CardTitle>
            <CardDescription>Select an appointment to auto-fill details, or create a manual POS invoice.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control as any}
              name="appointmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Appointment (Optional)</FormLabel>
                  <Select 
                    onValueChange={handleAppointmentSelect} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Manual POS (No Appointment)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Manual POS</SelectItem>
                      {appointments.map((app: any) => (
                        <SelectItem key={app.id} value={app.id}>
                          {formatDate(app.date)} - {app.customer?.firstName} {app.customer?.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control as any}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!sourceAppointment}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Branch" />
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
              control={form.control as any}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!sourceAppointment}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Walk-in Customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Walk-in Customer</SelectItem>
                      {customers.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Add services to the invoice.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                type: InvoiceItemType.SERVICE,
                snapshottedName: '',
                quantity: 1,
                unitPrice: 0,
                discount: 0,
                tax: 0,
              })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-4 p-4 border rounded-md relative bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                  
                  <div className="md:col-span-4">
                    <FormField
                      control={form.control as any}
                      name={`items.${index}.productId`}
                      render={({ field: selectField }) => (
                        <FormItem>
                          <FormLabel>Service</FormLabel>
                          <Select 
                            onValueChange={(val) => {
                              selectField.onChange(val);
                              // Auto-fill price and name
                              const svc = services.find((s: any) => s.id === val);
                              if (svc) {
                                form.setValue(`items.${index}.snapshottedName`, svc.name);
                                form.setValue(`items.${index}.unitPrice`, Number(svc.basePrice));
                              }
                            }} 
                            value={selectField.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Custom Service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="custom">Custom Service</SelectItem>
                              {(!services || services.length === 0) && (
                                <SelectItem value="empty" disabled>
                                  No services available
                                </SelectItem>
                              )}
                              {services?.map((s: any) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-4">
                    <FormField
                      control={form.control as any}
                      name={`items.${index}.snapshottedName`}
                      render={({ field: inputField }) => (
                        <FormItem>
                          <FormLabel>Item Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Service name" {...inputField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control as any}
                      name={`items.${index}.quantity`}
                      render={({ field: qtyField }) => (
                        <FormItem>
                          <FormLabel>Qty</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...qtyField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control as any}
                      name={`items.${index}.unitPrice`}
                      render={({ field: priceField }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...priceField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Discounts & Taxes (Optional advanced row) */}
                  <div className="md:col-span-6">
                     <FormField
                      control={form.control as any}
                      name={`items.${index}.discount`}
                      render={({ field: discountField }) => (
                        <FormItem>
                          <FormLabel>Discount ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...discountField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-6">
                     <FormField
                      control={form.control as any}
                      name={`items.${index}.tax`}
                      render={({ field: taxField }) => (
                        <FormItem>
                          <FormLabel>Tax ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...taxField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </div>
                
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary & Notes</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control as any}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Thank you for your business!" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/30 p-6 rounded-lg space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-500">
                <span>Total Discount</span>
                <span>-${discountTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Tax</span>
                <span>₹{taxTotal.toFixed(2)}</span>
              </div>
              <hr className="my-4 border-slate-200" />
              <div className="flex justify-between font-bold text-lg">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Invoice
          </Button>
        </div>

      </form>
    </Form>
  );
}

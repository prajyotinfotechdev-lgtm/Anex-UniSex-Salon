'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { useAddPayment } from '../billing.hooks';
import { PaymentMethod, Invoice } from '../billing.types';
import { Loader2 } from 'lucide-react';

interface PaymentDialogProps {
  invoice: Invoice;
  children: React.ReactNode;
}

const paymentSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  method: z.nativeEnum(PaymentMethod),
  referenceId: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function PaymentDialog({ invoice, children }: PaymentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const paymentMutation = useAddPayment();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      amount: Number(invoice.amountDue) || 0,
      method: PaymentMethod.CREDIT_CARD,
      referenceId: '',
    },
  });

  // Update default amount when invoice changes
  React.useEffect(() => {
    form.reset({
      amount: Number(invoice.amountDue) || 0,
      method: PaymentMethod.CREDIT_CARD,
      referenceId: '',
    });
  }, [invoice, open, form]);

  const onSubmit = (data: PaymentFormValues) => {
    paymentMutation.mutate(
      {
        invoiceId: invoice.id,
        amount: data.amount,
        method: data.method as PaymentMethod,
        referenceId: data.referenceId,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Enter payment details for invoice {invoice.invoiceNumber}.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 p-4 rounded-md mb-2 flex justify-between items-center">
          <span className="text-sm font-medium">Amount Due:</span>
          <span className="text-lg font-bold">₹{Number(invoice.amountDue).toFixed(2)}</span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control as any}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PaymentMethod).map((method) => (
                        <SelectItem key={method} value={method}>
                          {method.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="referenceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference ID / Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Check #, Auth Code, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={paymentMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={paymentMutation.isPending}>
                {paymentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm Payment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

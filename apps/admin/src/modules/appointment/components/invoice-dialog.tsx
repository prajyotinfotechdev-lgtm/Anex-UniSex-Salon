'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { FileText, Send, Printer } from 'lucide-react';
import { Appointment } from '../appointment.types';

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any; // Using any for simplicity as it includes nested relations
}

export function InvoiceDialog({ open, onOpenChange, appointment }: InvoiceDialogProps) {
  const totalPrice = appointment.items?.reduce((acc: number, item: any) => acc + Number(item.price), 0) || 0;
  
  const generateMessage = () => {
    let msg = `*Anex Salon - Invoice*\n`;
    msg += `---------------------------\n`;
    msg += `*Date:* ${format(new Date(appointment.date), 'MMM d, yyyy')}\n`;
    msg += `*Customer:* ${appointment.customer?.firstName} ${appointment.customer?.lastName || ''}\n\n`;
    
    msg += `*Services:*\n`;
    appointment.items?.forEach((item: any) => {
      msg += `- ${item.service?.name || 'Service'} ($${Number(item.price).toFixed(2)})\n`;
    });
    
    msg += `\n*Total Amount: $${totalPrice.toFixed(2)}*\n`;
    msg += `---------------------------\n`;
    msg += `Thank you for choosing Anex Salon!`;
    return msg;
  };

  const handleSendWhatsApp = () => {
    if (!appointment.customer?.primaryPhone) {
      alert("Customer doesn't have a phone number on file.");
      return;
    }
    
    // Format phone (assuming it might need to strip non-digits)
    const phone = appointment.customer.primaryPhone.replace(/\D/g, '');
    const text = encodeURIComponent(generateMessage());
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md print:max-w-none print:shadow-none print:border-none print:m-0">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Summary
          </DialogTitle>
        </DialogHeader>

        {/* Invoice Body */}
        <div className="p-6 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm font-mono text-sm space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold tracking-widest uppercase">Anex Salon</h2>
            <p className="text-muted-foreground">INVOICE #{appointment.id.substring(0, 8).toUpperCase()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-zinc-200 dark:border-zinc-800 py-4">
            <div>
              <p className="text-muted-foreground text-xs uppercase">Billed To</p>
              <p className="font-semibold">{appointment.customer?.firstName} {appointment.customer?.lastName}</p>
              <p className="text-muted-foreground">{appointment.customer?.primaryPhone || 'No Phone'}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs uppercase">Date</p>
              <p className="font-semibold">{format(new Date(appointment.date), 'MMM d, yyyy')}</p>
              {appointment.items?.[0] && (
                <p className="text-muted-foreground">{format(parseISO(appointment.items[0].startTime), 'h:mm a')}</p>
              )}
            </div>
          </div>

          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left">
                  <th className="pb-2 font-semibold">Service</th>
                  <th className="pb-2 text-right font-semibold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {appointment.items?.map((item: any, i: number) => (
                  <tr key={item.id || i}>
                    <td className="py-3">
                      <div className="font-medium">{item.service?.name}</div>
                      <div className="text-xs text-muted-foreground">with {item.employee?.firstName}</div>
                    </td>
                    <td className="py-3 text-right font-medium">
                      ${Number(item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-zinc-900 dark:border-zinc-100">
                  <td className="pt-4 font-bold text-lg">Total</td>
                  <td className="pt-4 text-right font-bold text-lg text-primary">
                    ${totalPrice.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="text-center text-xs text-muted-foreground pt-4">
            Thank you for choosing Anex Salon!
          </div>
        </div>

        <DialogFooter className="print:hidden sm:justify-between">
          <Button variant="outline" onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleSendWhatsApp} className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebd5a] text-white">
            <Send className="w-4 h-4 mr-2" />
            Send via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

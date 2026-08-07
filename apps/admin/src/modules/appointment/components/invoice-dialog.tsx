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
    const customerBaseUrl = process.env.NEXT_PUBLIC_CUSTOMER_URL || 
      (typeof window !== 'undefined' ? window.location.origin.replace('3001', '3000').replace('admin', 'customer') : 'http://localhost:3000');
    
    const invoiceLink = `${customerBaseUrl}/invoice/${appointment.id}`;

    let msg = `*Anex Salon*\n`;
    msg += `Hi ${appointment.customer?.firstName},\n\n`;
    msg += `Thank you for your visit on ${format(new Date(appointment.date), 'MMM d, yyyy')}! Your premium invoice is ready.\n\n`;
    msg += `*View & Download Invoice PDF:*\n${invoiceLink}\n\n`;
    msg += `We look forward to seeing you again.`;
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
        <div className="p-8 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200/60 dark:border-zinc-800 shadow-xl space-y-8 relative overflow-hidden">
          {/* Subtle gold accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 opacity-80" />

          <div className="text-center space-y-3">
            <img 
              src="/apple-touch-icon.png" 
              alt="Anex Salon" 
              className="w-16 h-16 mx-auto rounded-xl shadow-md border border-zinc-100 dark:border-zinc-800 object-cover"
            />
            <h2 className="text-2xl font-serif font-bold tracking-wide uppercase text-zinc-900 dark:text-zinc-100">Anex Salon</h2>
            <p className="text-xs text-muted-foreground tracking-widest">INVOICE #{appointment.id.substring(0, 8).toUpperCase()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
            <div>
              <p className="text-zinc-400 dark:text-zinc-500 text-[10px] tracking-widest uppercase mb-1">Billed To</p>
              <p className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{appointment.customer?.firstName} {appointment.customer?.lastName}</p>
              <p className="text-sm text-muted-foreground">{appointment.customer?.primaryPhone || 'No Phone'}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-400 dark:text-zinc-500 text-[10px] tracking-widest uppercase mb-1">Date & Time</p>
              <p className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{format(new Date(appointment.date), 'MMMM d, yyyy')}</p>
              {appointment.items?.[0] && (
                <p className="text-sm text-muted-foreground">{format(parseISO(appointment.items[0].startTime), 'h:mm a')}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-900 text-left">
                  <th className="pb-3 text-zinc-400 dark:text-zinc-500 font-medium text-xs uppercase tracking-wider">Service Description</th>
                  <th className="pb-3 text-right text-zinc-400 dark:text-zinc-500 font-medium text-xs uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                {appointment.items?.map((item: any, i: number) => (
                  <tr key={item.id || i}>
                    <td className="py-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{item.service?.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Specialist: {item.employee?.firstName}</div>
                    </td>
                    <td className="py-4 text-right font-medium text-zinc-900 dark:text-zinc-100">
                      ${Number(item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="pt-6 font-serif text-lg font-semibold text-zinc-800 dark:text-zinc-200">Total</td>
                  <td className="pt-6 text-right font-serif font-bold text-xl text-amber-600 dark:text-amber-500">
                    ${totalPrice.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="text-center pt-8">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Thank you for choosing Anex Salon
            </p>
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

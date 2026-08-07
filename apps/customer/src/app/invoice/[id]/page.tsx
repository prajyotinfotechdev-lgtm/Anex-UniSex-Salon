"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { FileText, Printer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ["public-invoice", unwrappedParams.id],
    queryFn: async () => {
      const res = await api.get(`/public/invoice/${unwrappedParams.id}`);
      return res.data;
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-zinc-400 font-serif tracking-widest text-sm uppercase">Loading Premium Invoice</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex h-screen items-center justify-center bg-black p-4 text-center">
        <div className="space-y-4 max-w-sm">
          <ShieldCheck className="h-12 w-12 text-zinc-500 mx-auto" />
          <h2 className="text-xl font-serif text-zinc-200">Invoice Unavailable</h2>
          <p className="text-zinc-400 text-sm">This invoice link is invalid, expired, or the appointment has not yet been completed.</p>
        </div>
      </div>
    );
  }

  const totalPrice = invoice.items?.reduce((acc: number, item: any) => acc + Number(item.price), 0) || 0;

  return (
    <div className="min-h-screen bg-black sm:py-12 py-0 print:bg-white print:text-black">
      <div className="max-w-2xl mx-auto sm:px-6">
        
        {/* Actions - Hidden when printing */}
        <div className="flex justify-end mb-6 px-4 sm:px-0 print:hidden space-x-4 pt-6 sm:pt-0">
          <Button 
            variant="outline" 
            className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Invoice Body */}
        <div className="bg-zinc-950 print:bg-white sm:rounded-2xl sm:border border-zinc-800 print:border-none shadow-2xl relative overflow-hidden print:shadow-none">
          
          {/* Subtle gold accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 opacity-80" />
          
          <div className="p-8 sm:p-12 space-y-12">
            <div className="text-center space-y-4 print:space-y-2">
              <img 
                src="/apple-touch-icon.png" 
                alt="Anex Salon Logo" 
                className="w-20 h-20 mx-auto rounded-2xl shadow-lg border border-zinc-800 print:border-zinc-200 object-cover"
              />
              <h1 className="text-3xl font-serif font-bold tracking-widest uppercase text-zinc-100 print:text-black">Anex Salon</h1>
              <p className="text-xs text-zinc-500 print:text-zinc-600 tracking-widest font-mono">INVOICE #{invoice.id.substring(0, 8).toUpperCase()}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-900 print:border-zinc-200">
              <div>
                <p className="text-zinc-500 print:text-zinc-500 text-[10px] tracking-widest uppercase mb-2">Billed To</p>
                <p className="font-medium text-base text-zinc-200 print:text-black">{invoice.customer?.firstName} {invoice.customer?.lastName}</p>
                <p className="text-sm text-zinc-400 print:text-zinc-600 mt-1">{invoice.customer?.primaryPhone || 'No Phone on File'}</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 print:text-zinc-500 text-[10px] tracking-widest uppercase mb-2">Date & Time</p>
                <p className="font-medium text-base text-zinc-200 print:text-black">{format(new Date(invoice.date), 'MMMM d, yyyy')}</p>
                {invoice.items?.[0] && (
                  <p className="text-sm text-zinc-400 print:text-zinc-600 mt-1">{format(parseISO(invoice.items[0].startTime), 'h:mm a')}</p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-900 print:border-zinc-200 text-left">
                    <th className="pb-4 text-zinc-500 print:text-zinc-500 font-medium text-xs uppercase tracking-widest">Service Description</th>
                    <th className="pb-4 text-right text-zinc-500 print:text-zinc-500 font-medium text-xs uppercase tracking-widest">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50 print:divide-zinc-100">
                  {invoice.items?.map((item: any, i: number) => (
                    <tr key={item.id || i}>
                      <td className="py-6">
                        <div className="font-medium text-zinc-200 print:text-black text-base">{item.service?.name}</div>
                        <div className="text-sm text-zinc-500 print:text-zinc-600 mt-1">Specialist: {item.employee?.firstName}</div>
                      </td>
                      <td className="py-6 text-right font-medium text-zinc-200 print:text-black text-base">
                        ${Number(item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-800 print:border-zinc-300">
                    <td className="pt-8 font-serif text-xl font-semibold text-zinc-300 print:text-black">Total Amount</td>
                    <td className="pt-8 text-right font-serif font-bold text-2xl text-amber-500 print:text-amber-600">
                      ${totalPrice.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="text-center pt-16 pb-4">
              <p className="text-[11px] text-zinc-600 print:text-zinc-500 uppercase tracking-widest">
                Thank you for choosing Anex Salon. We look forward to seeing you again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { Customer } from '../customer.types';
import { CustomerStats } from './customer-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CalendarDays, 
  Receipt, 
  Clock, 
  StickyNote,
  MessageSquare
} from 'lucide-react';

export function CustomerDetailContent({ customer }: { customer: Customer }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column (70%) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <Clock className="h-10 w-10 mb-4 opacity-20" />
              <p className="font-medium">No recent activity.</p>
              <p className="text-sm mt-1">Customer actions will appear here sequentially.</p>
            </div>
          </CardContent>
        </Card>

        {/* Appointment History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Appointment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!customer.appointments || customer.appointments.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <CalendarDays className="h-10 w-10 mb-4 opacity-20" />
                <p className="font-medium">No appointments yet.</p>
                <p className="text-sm mt-1">Book the customer&apos;s first appointment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-md">Date & Time</th>
                      <th className="px-4 py-3">Services</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right rounded-tr-md">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.appointments.map((app: any, idx: number) => {
                      const date = new Date(app.date);
                      const services = app.items?.map((item: any) => item.snapshottedServiceName).join(', ') || 'Service';
                      const total = app.items?.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0) || 0;
                      
                      let statusColor = "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";
                      if (app.status === 'CONFIRMED') statusColor = "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
                      if (app.status === 'COMPLETED') statusColor = "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
                      if (app.status === 'CANCELLED' || app.status === 'NO_SHOW') statusColor = "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";

                      return (
                        <tr key={app.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">
                            {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)}
                          </td>
                          <td className="px-4 py-3 truncate max-w-[200px]" title={services}>
                            {services}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide ${statusColor}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            ₹{total.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Invoice History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!customer.invoices || customer.invoices.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <Receipt className="h-10 w-10 mb-4 opacity-20" />
                <p className="font-medium">No invoices yet.</p>
                <p className="text-sm mt-1">Invoices will appear here after billing.</p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                Invoices table coming soon...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-primary" />
              Internal Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!customer.notes ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <MessageSquare className="h-10 w-10 mb-4 opacity-20" />
                <p className="font-medium">No notes yet.</p>
                <p className="text-sm mt-1">Internal notes will appear here.</p>
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm">
                {customer.notes}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Right Column (30%) */}
      <div className="lg:col-span-1">
        <CustomerStats customer={customer} />
      </div>

    </div>
  );
}

export function CustomerDetailContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <Skeleton className="h-[250px] w-full rounded-xl" />
        <Skeleton className="h-[250px] w-full rounded-xl" />
        <Skeleton className="h-[250px] w-full rounded-xl" />
      </div>
    </div>
  );
}

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
              <div className="text-sm text-muted-foreground italic">
                Appointments table coming soon...
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

import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { InvoiceForm } from '@/modules/billing/components/invoice-form';

export const metadata: Metadata = {
  title: 'Create Invoice - ANEX OS',
  description: 'Create a new invoice or checkout an appointment',
};

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices" className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">
            Manual checkout or generate from an appointment.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
        <InvoiceForm />
      </Suspense>
    </div>
  );
}

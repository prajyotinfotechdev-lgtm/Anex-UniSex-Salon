import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { InvoiceDetail } from '@/modules/billing/components/invoice-detail';

export const metadata: Metadata = {
  title: 'Invoice Detail - ANEX OS',
  description: 'View invoice details, payments, and timeline',
};

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices" className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Details</h1>
          <p className="text-muted-foreground">
            Manage billing, payments, and view invoice timeline.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
        <InvoiceDetail id={params.id} />
      </Suspense>
    </div>
  );
}

import { Metadata } from 'next';
import { Suspense } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { HasPermission } from '@/shared/components/HasPermission';
import { cn } from '@/lib/utils';
import { InvoiceList } from '@/modules/billing/components/invoice-list';

export const metadata: Metadata = {
  title: 'Invoices & POS - ANEX OS',
  description: 'Manage billing, POS, and payments',
};

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & POS</h1>
          <p className="text-muted-foreground">
            Manage invoices, checkouts, and payment history.
          </p>
        </div>
        <HasPermission permission="Billing.Create">
          <Link href="/invoices/new" className={cn(buttonVariants({ variant: 'default' }))}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </HasPermission>
      </div>

      <Suspense fallback={<div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
        <InvoiceList />
      </Suspense>
    </div>
  );
}

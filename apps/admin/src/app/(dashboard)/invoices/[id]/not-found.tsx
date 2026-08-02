import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { FileSearch } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FileSearch className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Invoice Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The invoice you&apos;re looking for doesn&apos;t exist or has been voided.
        </p>
      </div>
      <Link href="/invoices" className={buttonVariants()}>Back to Invoices</Link>
    </div>
  );
}

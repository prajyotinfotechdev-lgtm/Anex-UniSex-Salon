import { Suspense } from 'react';
import { CustomerTable } from '@/modules/customer/components/customer-table';

export const metadata = {
  title: 'Customers | ANEX OS',
  description: 'Manage your customers and clients',
};

import Link from 'next/link';

export default function CustomersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col space-y-2 mb-6">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Customers</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        </div>
      </div>
      <Suspense fallback={<div>Loading customer list...</div>}>
        <CustomerTable />
      </Suspense>
    </div>
  );
}

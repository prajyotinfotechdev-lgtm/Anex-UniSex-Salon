import { CustomerForm } from '@/modules/customer/components/customer-form';

export const metadata = {
  title: 'Add Customer | ANEX OS',
  description: 'Add a new customer',
};

import Link from 'next/link';

export default function NewCustomerPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col space-y-2 mb-6">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link href="/customers" className="hover:text-primary transition-colors">Customers</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Create Customer</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Add Customer</h2>
        </div>
      </div>
      <div className="max-w-3xl">
        <CustomerForm />
      </div>
    </div>
  );
}

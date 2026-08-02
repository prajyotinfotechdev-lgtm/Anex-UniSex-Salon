'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useCustomer } from '@/modules/customer/customer.hooks';
import { CustomerForm, CustomerFormSkeleton } from '@/modules/customer/components/customer-form';
import Link from 'next/link';

export default function EditCustomerPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: customer, isLoading, isError } = useCustomer(id);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
        <div className="flex items-center justify-between space-y-2 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Edit Customer</h2>
        </div>
        <div className="max-w-3xl">
          <CustomerFormSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex flex-col items-center justify-center py-24 text-center text-destructive bg-card rounded-xl border">
          <h2 className="text-2xl font-bold mb-2">Customer Not Found</h2>
          <p className="text-muted-foreground">The customer you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col space-y-2 mb-6">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link href="/customers" className="hover:text-primary transition-colors">Customers</Link>
          <span className="mx-2">/</span>
          <Link href={`/customers/${customer.id}`} className="hover:text-primary transition-colors">{customer.firstName} {customer.lastName}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Edit Customer</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Edit {customer.firstName} {customer.lastName}
          </h2>
        </div>
      </div>
      
      <div className="max-w-3xl">
        <CustomerForm initialData={customer} />
      </div>
    </div>
  );
}

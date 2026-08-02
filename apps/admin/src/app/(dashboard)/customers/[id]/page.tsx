'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useCustomer } from '@/modules/customer/customer.hooks';
import { 
  CustomerDetailHeader, 
  CustomerDetailHeaderSkeleton 
} from '@/modules/customer/components/customer-detail-header';
import { 
  CustomerDetailContent, 
  CustomerDetailContentSkeleton 
} from '@/modules/customer/components/customer-detail-content';

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: customer, isLoading, isError } = useCustomer(id);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <CustomerDetailHeaderSkeleton />
        <CustomerDetailContentSkeleton />
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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <CustomerDetailHeader customer={customer} />
      <CustomerDetailContent customer={customer} />
    </div>
  );
}

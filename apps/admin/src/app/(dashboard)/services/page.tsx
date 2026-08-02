import * as React from 'react';
import { Metadata } from 'next';
import { ServiceList } from '@/modules/service/components/service-list';

export const metadata: Metadata = {
  title: 'Service Catalog | Anex OS',
  description: 'Manage salon services, pricing, and configurations.',
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Service Catalog</h1>
        <p className="text-muted-foreground mt-2">
          Manage salon services, pricing, duration, categories, and employee assignments.
        </p>
      </div>

      <ServiceList />
    </div>
  );
}

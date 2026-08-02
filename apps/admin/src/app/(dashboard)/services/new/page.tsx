import * as React from 'react';
import { Metadata } from 'next';
import { ServiceForm } from '@/modules/service/components/service-form';

export const metadata: Metadata = {
  title: 'Create Service | Anex OS',
  description: 'Add a new service to the catalog.',
};

export default function NewServicePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Service</h1>
        <p className="text-muted-foreground mt-2">
          Configure a new service offering for your organization.
        </p>
      </div>

      <ServiceForm />
    </div>
  );
}

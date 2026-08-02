'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useService } from '@/modules/service/service.hooks';
import { ServiceForm } from '@/modules/service/components/service-form';
import { Loader2 } from 'lucide-react';

export default function EditServicePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: service, isLoading, isError } = useService(id);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        Failed to load service.
      </div>
    );
  }

  const initialData = {
    name: service.name,
    description: service.description || '',
    serviceCategoryId: service.serviceCategoryId,
    pricingType: service.pricingType,
    basePrice: parseFloat(service.basePrice),
    durationMinutes: service.durationMinutes,
    processingMinutes: service.processingMinutes || 0,
    cleanupMinutes: service.cleanupMinutes || 0,
    beforeBufferMinutes: service.beforeBufferMinutes,
    afterBufferMinutes: service.afterBufferMinutes,
    color: service.color || '',
    requiresConsultation: service.requiresConsultation,
    requiresPatchTest: service.requiresPatchTest,
    isActive: service.isActive,
    employees: service.employeeServices?.map((es: any) => es.employeeId) || [],
    branches: service.serviceBranches?.map((sb: any) => ({
      branchId: sb.branchId,
      price: parseFloat(sb.price || sb.priceOverride || service.basePrice)
    })) || [],
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Service</h1>
        <p className="text-muted-foreground mt-2">
          Update configuration for {service.name}.
        </p>
      </div>

      <ServiceForm initialData={initialData} serviceId={id} isEdit />
    </div>
  );
}

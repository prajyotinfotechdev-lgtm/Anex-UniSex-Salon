'use client';

import { useEmployee } from '../employee.hooks';
import { EmployeeForm } from './employee-form';
import { Skeleton } from '@/components/ui/skeleton';

export function EmployeeEditWrapper({ id }: { id: string }) {
  const { data, isLoading, isError } = useEmployee(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="text-center py-10 text-destructive">
        Error loading employee data. Please try again.
      </div>
    );
  }

  return <EmployeeForm initialData={data.data} />;
}

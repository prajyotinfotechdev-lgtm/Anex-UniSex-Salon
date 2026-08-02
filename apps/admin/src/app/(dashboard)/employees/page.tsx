import { Metadata } from 'next';
import { Suspense } from 'react';
import { EmployeeTable } from '@/modules/employee/components/employee-table';

export const metadata: Metadata = {
  title: 'Employees | Anex OS',
  description: 'Manage your salon staff and employees.',
};

export default function EmployeesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
      </div>
      <Suspense fallback={<div>Loading employees...</div>}>
        <EmployeeTable />
      </Suspense>
    </div>
  );
}

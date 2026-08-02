import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { EmployeeEditWrapper } from '@/modules/employee/components/employee-edit-wrapper';

export const metadata: Metadata = {
  title: 'Edit Employee | Anex OS',
  description: 'Edit employee details.',
};

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href="/employees" className="hover:text-foreground transition-colors">Employees</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href={`/employees/${resolvedParams.id}`} className="hover:text-foreground transition-colors">Employee Details</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground font-medium">Edit Employee</span>
      </div>

      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Employee</h2>
          <p className="text-muted-foreground">Update employee information and assignments.</p>
        </div>
      </div>
      
      <div className="bg-card border rounded-lg p-6">
        <EmployeeEditWrapper id={resolvedParams.id} />
      </div>
    </div>
  );
}

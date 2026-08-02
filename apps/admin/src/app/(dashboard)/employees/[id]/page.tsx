import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { EmployeeDetail } from '@/modules/employee/components/employee-detail';

export const metadata: Metadata = {
  title: 'Employee Details | Anex OS',
  description: 'View employee information and statistics.',
};

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href="/employees" className="hover:text-foreground transition-colors">Employees</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground font-medium">Employee Details</span>
      </div>

      <EmployeeDetail id={resolvedParams.id} />
    </div>
  );
}

import { Metadata } from 'next';
import { DashboardMetrics } from '@/modules/dashboard/dashboard-metrics';
import { DashboardRecentAppointments } from '@/modules/dashboard/dashboard-recent-appointments';

export const metadata: Metadata = {
  title: 'Dashboard | ANEX OS',
  description: 'Overview of your business metrics',
};

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <DashboardMetrics />
      
      <div className="grid gap-4 grid-cols-1 mt-4">
        <DashboardRecentAppointments />
      </div>
    </div>
  );
}

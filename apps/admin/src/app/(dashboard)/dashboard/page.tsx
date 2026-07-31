import { Metadata } from 'next';
import { DashboardMetrics } from '@/modules/dashboard/dashboard-metrics';
import { DashboardCharts } from '@/modules/dashboard/dashboard-charts';
import { DashboardAppointmentChart } from '@/modules/dashboard/dashboard-appointment-chart';
import { DashboardRecentActivity } from '@/modules/dashboard/dashboard-recent-activity';

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
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 lg:grid-cols-7">
        <div className="col-span-1 md:col-span-4 lg:col-span-4 space-y-4">
          <DashboardCharts />
          <DashboardAppointmentChart />
        </div>
        <div className="col-span-1 md:col-span-4 lg:col-span-3">
          <DashboardRecentActivity />
        </div>
      </div>
    </div>
  );
}

import { ReactNode } from 'react';
import { AppLayout } from '@/shared/layouts/AppLayout';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

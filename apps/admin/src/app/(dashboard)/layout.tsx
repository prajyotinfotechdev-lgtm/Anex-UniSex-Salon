import { ReactNode } from 'react';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { SplashScreen } from '@/shared/components/SplashScreen';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SplashScreen>
      <AppLayout>{children}</AppLayout>
    </SplashScreen>
  );
}

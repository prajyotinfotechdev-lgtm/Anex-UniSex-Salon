'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useUIStore } from '../store/uiStore';
import { BookingWorkspaceShell } from '@/modules/appointment-booking/components/workspace/BookingWorkspaceShell';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isSidebarExpanded = useUIStore((state) => state.isSidebarExpanded);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={cn(
        "flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out",
        isSidebarExpanded ? "md:ml-64" : "md:ml-16"
      )}>
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      <BookingWorkspaceShell />
    </div>
  );
}

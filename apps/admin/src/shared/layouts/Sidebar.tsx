'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Building2,
  Store,
  Users,
  Contact,
  ClipboardList,
  CalendarDays,
  CalendarRange,
  CreditCard,
  LineChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Organizations', href: '/organizations', icon: Building2 },
  { name: 'Branches', href: '/branches', icon: Store },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Customers', href: '/customers', icon: Contact },
  { name: 'Services', href: '/services', icon: ClipboardList },
  { name: 'Appointments', href: '/appointments', icon: CalendarDays },
  { name: 'Scheduling', href: '/scheduling', icon: CalendarRange },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Reports', href: '/reports', icon: LineChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarExpanded, toggleSidebar } = useUIStore();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  // In a real scenario, we would filter MENU_ITEMS by permissions
  // const filteredMenu = MENU_ITEMS.filter(item => hasPermission(item.permissionKey));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex fixed inset-y-0 left-0 z-50 flex-col bg-card border-r transition-all duration-300 ease-in-out shadow-sm",
          isSidebarExpanded ? "w-64" : "w-16"
        )}
      >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {isSidebarExpanded && (
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            ANEX OS
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground ml-auto"
        >
          {isSidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md transition-colors group",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")} size={20} />
              {isSidebarExpanded && (
                <span className="ml-3 truncate">{item.name}</span>
              )}
              {!isSidebarExpanded && (
                // Tooltip logic can be added here
                <span className="sr-only">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        {/* Organization Switcher Placeholder */}
        {isSidebarExpanded ? (
          <div className="text-xs text-muted-foreground truncate">
            Anex Salon HQ
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mx-auto">
            HQ
          </div>
        )}
      </div>
      </aside>

      {/* Mobile Sidebar / Drawer */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-4">
        <Sheet>
          <SheetTrigger>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex items-center h-16 px-4 border-b">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                ANEX OS
              </span>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
              {MENU_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-md transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")} size={20} />
                    <span className="ml-3 truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

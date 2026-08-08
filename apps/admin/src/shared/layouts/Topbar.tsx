'use client';

import { Bell, Search, Sun, Moon } from 'lucide-react';
import * as React from 'react';
import { useTheme } from 'next-themes';
import { CommandPalette } from '../components/CommandPalette';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '@/modules/appointment-booking/store/booking.store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import { MobileSidebar } from './Sidebar';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [openCommand, setOpenCommand] = React.useState(false);

  // Create simple breadcrumbs from pathname
  const paths = pathname.split('/').filter(Boolean);
  const currentSection = paths.length > 0 ? paths[0].charAt(0).toUpperCase() + paths[0].slice(1) : 'Dashboard';

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-4">
        <MobileSidebar />
        {/* Breadcrumbs Placeholder */}
        <h2 className="text-lg font-semibold tracking-tight truncate max-w-[120px] sm:max-w-xs">
          {currentSection}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={() => useBookingStore.getState().openWorkspace()} className="hidden md:flex gap-2">
          <span className="font-semibold">+ New Booking</span>
          <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-primary-foreground/20 px-1.5 font-mono text-[10px] font-medium text-primary-foreground">
            Ctrl N
          </kbd>
        </Button>

        <Button 
          variant="outline" 
          className="w-48 lg:w-64 justify-start text-muted-foreground bg-muted/50 hidden md:flex"
          onClick={() => setOpenCommand(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          Search...
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.firstName?.[0] || 'A'}{user?.lastName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CommandPalette open={openCommand} setOpen={setOpenCommand} />
    </header>
  );
}

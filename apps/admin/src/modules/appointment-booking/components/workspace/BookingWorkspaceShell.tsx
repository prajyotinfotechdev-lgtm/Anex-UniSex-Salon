'use client';

import React, { useEffect } from 'react';
import { useBookingStore } from '../../store/booking.store';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CustomerContextPanel } from './CustomerContextPanel';
import { BookingMainArea } from './BookingMainArea';
import { LiveBookingSummary } from './LiveBookingSummary';

export function BookingWorkspaceShell() {
  const { isOpen, closeWorkspace } = useBookingStore();

  // Keyboard shortcut Ctrl+N to open, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        useBookingStore.getState().openWorkspace();
      }
      if (e.key === 'Escape' && useBookingStore.getState().isOpen) {
        closeWorkspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeWorkspace]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-background/80 backdrop-blur-sm transition-all duration-300">
      <div className="w-full h-full bg-background shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header (Mobile only, mostly hidden on Desktop in favor of clean layout) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Booking Workspace</h2>
          <Button variant="ghost" size="icon" onClick={closeWorkspace}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop Close Button (Floating Top Right) */}
        <Button 
          variant="outline" 
          size="icon" 
          className="hidden md:flex absolute top-4 right-4 z-50 rounded-full bg-background/50 hover:bg-background"
          onClick={closeWorkspace}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* 1. Customer Context Panel (Left) */}
        <div className="w-full md:w-80 lg:w-96 border-r bg-muted/10 shrink-0 h-full overflow-y-auto">
          <CustomerContextPanel />
        </div>

        {/* 2. Main Action Area (Center) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <BookingMainArea />
        </div>

        {/* 3. Live Booking Summary (Right / Bottom) */}
        <div className="w-full md:w-80 border-l bg-muted/5 shrink-0 h-full overflow-y-auto">
          <LiveBookingSummary />
        </div>

      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { BookingProvider, BookingOrchestrator } from '../booking/booking-orchestrator';

export function GlobalBookingWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      <BookingOrchestrator>
        {children}
      </BookingOrchestrator>
    </BookingProvider>
  );
}

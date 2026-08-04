'use client';

import React from 'react';
import { BookingProvider, BookingOrchestrator } from '../booking/booking-orchestrator';
import { CustomerProfileProvider } from '../providers/CustomerProfileContext';

export function GlobalBookingWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProfileProvider>
      <BookingProvider>
        <BookingOrchestrator>
          {children}
        </BookingOrchestrator>
      </BookingProvider>
    </CustomerProfileProvider>
  );
}

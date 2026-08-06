'use client';

import React from 'react';
import { BookingProvider, BookingOrchestrator } from '../booking/booking-orchestrator';
import { CustomerProfileProvider } from '../providers/CustomerProfileContext';
import { PushNotificationProvider } from '../providers/PushNotificationProvider';

export function GlobalBookingWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProfileProvider>
      <PushNotificationProvider>
        <BookingProvider>
          <BookingOrchestrator>
            {children}
          </BookingOrchestrator>
        </BookingProvider>
      </PushNotificationProvider>
    </CustomerProfileProvider>
  );
}

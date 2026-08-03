'use client';

import React from 'react';
import { useBookingStore } from '../../store/booking.store';
import { IdentityStep } from './steps/IdentityStep';
import { ServicesStep } from './steps/ServicesStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { RequirementsStep } from './steps/RequirementsStep';
import { ConfirmStep } from './steps/ConfirmStep';

export function BookingMainArea() {
  const { step } = useBookingStore();

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      
      {/* Dynamic Workspace Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        {step === 'identity' && <IdentityStep />}
        {step === 'services' && <ServicesStep />}
        {step === 'schedule' && <ScheduleStep />}
        {step === 'requirements' && <RequirementsStep />}
        {step === 'confirm' && <ConfirmStep />}
        {step === 'submitting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50 animate-in fade-in">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
            <p className="font-medium text-lg">Finalizing Booking...</p>
          </div>
        )}
        {step === 'success' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-50 animate-in zoom-in-95">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-8">The appointment has been successfully added to the calendar.</p>
            <button 
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium"
              onClick={() => useBookingStore.getState().reset()}
            >
              Book Another
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

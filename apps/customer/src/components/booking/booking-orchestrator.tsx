'use client';

import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TimePicker } from './time-picker';
import { BookingSummary } from './booking-summary';
import { ConfirmationDelight } from './confirmation-delight';
import { Button } from '../ui/button';
import { useCustomerProfile } from '../providers/CustomerProfileContext';

type BookingDimension = 'HOME' | 'TIME' | 'REQUIREMENTS' | 'CONFIRM' | 'DELIGHT';

interface BookingState {
  currentDimension: BookingDimension;
  serviceIds: string[];
  stylistId?: string;
  stylistName?: string;
  timeSlot?: Date;
  endTime?: Date;
  draftId?: string;
  missingRequirements?: any[];
  predictedStylist?: { id: string; name: string };
  customerId: string; // Mocking auth for now
  inspirationId?: string;
  inspirationImageUrl?: string;
}

interface BookingContextType {
  state: BookingState;
  goToDimension: (dim: BookingDimension) => void;
  selectService: (id: string) => void;
  deselectService: (id: string) => void;
  setStylist: (id: string, name: string) => void;
  setTimeSlot: (start: Date, end: Date) => void;
  setDraftId: (id: string) => void;
  setMissingRequirements: (reqs: any[]) => void;
  loadPrediction: (prediction: { serviceId?: string, stylistId?: string, title?: string }) => void;
  setInspiration: (id: string, imageUrl?: string) => void;
  reset: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useCustomerProfile();
  const [state, setState] = useState<BookingState>({
    currentDimension: 'HOME',
    serviceIds: [],
    customerId: profile?.id || 'guest',
  });

  // Sync customerId when profile changes
  React.useEffect(() => {
    setState(s => ({ ...s, customerId: profile?.id || 'guest' }));
  }, [profile?.id]);

  const goToDimension = (dim: BookingDimension) => setState(s => ({ ...s, currentDimension: dim }));

  const selectService = (id: string) => setState(s => ({ ...s, serviceIds: [...s.serviceIds, id] }));
  const deselectService = (id: string) => setState(s => ({ ...s, serviceIds: s.serviceIds.filter(sid => sid !== id) }));
  
  const setStylist = (id: string, name: string) => setState(s => ({ ...s, stylistId: id, stylistName: name }));
  const setTimeSlot = (start: Date, end: Date) => setState(s => ({ ...s, timeSlot: start, endTime: end }));
  const setDraftId = (id: string) => setState(s => ({ ...s, draftId: id }));
  const setMissingRequirements = (reqs: any[]) => setState(s => ({ ...s, missingRequirements: reqs }));

  const loadPrediction = (prediction: { serviceId?: string, stylistId?: string }) => {
    setState(prev => {
      const newServiceIds = prediction.serviceId ? [...new Set([...prev.serviceIds, prediction.serviceId])] : prev.serviceIds;
      return {
        ...prev,
        serviceIds: newServiceIds,
        stylistId: prediction.stylistId || 'any',
        stylistName: prediction.stylistId ? 'Previous Stylist' : 'Anyone'
      };
    });
  };

  const setInspiration = (id: string, imageUrl?: string) => {
    setState(prev => ({
      ...prev,
      inspirationId: id,
      inspirationImageUrl: imageUrl
    }));
  };

  const reset = () => setState({ currentDimension: 'HOME', serviceIds: [], customerId: profile?.id || 'guest' });

  return (
    <BookingContext.Provider value={{
      state, goToDimension, selectService, deselectService, setStylist, setTimeSlot, setDraftId, setMissingRequirements, loadPrediction, setInspiration, reset
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingEngine() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookingEngine must be used within BookingProvider");
  return ctx;
}

/**
 * The Orchestrator wraps the varying dimensions and handles the slide transitions
 * between them depending on the active state.
 */
export function BookingOrchestrator({ children }: { children: React.ReactNode }) {
  const { state, goToDimension } = useBookingEngine();

  // If we are at HOME, we just render children (the dashboard)
  // Otherwise, we render the booking overlay over it.
  return (
    <>
      {children}
      
      <AnimatePresence>
        {state.currentDimension !== 'HOME' && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col pt-safe"
          >
            {/* The active dimension component will be plugged in via sub-components or route mapping */}
            <div className="flex-1 flex flex-col relative h-full">
              {state.currentDimension === 'TIME' && <TimePicker />}
              {state.currentDimension === 'REQUIREMENTS' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
                  <h2 className="text-3xl font-bold mb-4">Action Required</h2>
                  <p className="text-muted-foreground mb-8 text-center">
                    You have missing forms for the selected services.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full" 
                    onClick={async () => {
                      if (state.draftId) {
                        try {
                           // In a real flow, we would collect form data and save it here.
                           // For now, we assume forms are filled and we just confirm.
                           const { apiClient } = await import('../../lib/axios');
                           
                           const items = state.serviceIds.map(id => ({
                             serviceId: id,
                             employeeId: state.stylistId !== 'any' ? state.stylistId : null,
                             startTime: state.timeSlot?.toISOString(),
                             endTime: state.endTime?.toISOString()
                           }));

                           await apiClient.post('/booking/confirm', { 
                             appointmentId: state.draftId,
                             items
                           });
                           goToDimension('DELIGHT');
                        } catch (e) {
                           console.error(e);
                           // Handle error
                        }
                      } else {
                        goToDimension('CONFIRM');
                      }
                    }}
                  >
                    Complete Forms & Continue
                  </Button>
                </div>
              )}
              {state.currentDimension === 'CONFIRM' && <BookingSummary />}
              {state.currentDimension === 'DELIGHT' && <ConfirmationDelight />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

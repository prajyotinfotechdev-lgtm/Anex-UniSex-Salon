'use client';

import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ServiceSelector } from './service-selector';
import { TimePicker } from './time-picker';
import { BookingSummary } from './booking-summary';
import { ConfirmationDelight } from './confirmation-delight';

type BookingDimension = 'HOME' | 'SERVICE' | 'TIME' | 'STYLIST' | 'CONFIRM' | 'DELIGHT';

interface BookingState {
  currentDimension: BookingDimension;
  serviceIds: string[];
  stylistId?: string;
  timeSlot?: Date;
  predictedStylist?: { id: string; name: string };
}

interface BookingContextType {
  state: BookingState;
  goToDimension: (dim: BookingDimension) => void;
  selectService: (id: string) => void;
  deselectService: (id: string) => void;
  setStylist: (id: string) => void;
  setTimeSlot: (date: Date) => void;
  loadPrediction: (prediction: { predictedService: { id: string }, predictedStylist: { id: string, name: string } }) => void;
  reset: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>({
    currentDimension: 'HOME',
    serviceIds: [],
  });

  const goToDimension = (dim: BookingDimension) => setState(s => ({ ...s, currentDimension: dim }));

  const selectService = (id: string) => setState(s => ({ ...s, serviceIds: [...s.serviceIds, id] }));
  const deselectService = (id: string) => setState(s => ({ ...s, serviceIds: s.serviceIds.filter(sid => sid !== id) }));
  
  const setStylist = (id: string) => setState(s => ({ ...s, stylistId: id }));
  const setTimeSlot = (date: Date) => setState(s => ({ ...s, timeSlot: date }));

  const loadPrediction = (prediction: { predictedService: { id: string }, predictedStylist: { id: string, name: string } }) => {
    setState(s => ({
      ...s,
      serviceIds: [prediction.predictedService.id],
      stylistId: prediction.predictedStylist.id,
      predictedStylist: prediction.predictedStylist
    }));
  };

  const reset = () => setState({ currentDimension: 'HOME', serviceIds: [] });

  return (
    <BookingContext.Provider value={{
      state, goToDimension, selectService, deselectService, setStylist, setTimeSlot, loadPrediction, reset
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
  const { state } = useBookingEngine();

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
              {state.currentDimension === 'SERVICE' && <ServiceSelector />}
              {state.currentDimension === 'TIME' && <TimePicker />}
              {state.currentDimension === 'CONFIRM' && <BookingSummary />}
              {state.currentDimension === 'DELIGHT' && <ConfirmationDelight />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';

import React from 'react';
import { useBookingEngine } from './booking-orchestrator';
import { useHaptics } from '../../hooks/use-haptics';
import { Button } from '../ui/button';
import { ChevronLeft, Scissors, Clock } from 'lucide-react';
import { SwipeToConfirm } from './swipe-to-confirm';
import useSWRMutation from 'swr/mutation';

// Mock Services for Phase 7.3
const MOCK_SERVICES = [
  { id: 'srv_1', name: 'Signature Haircut', duration: 45, price: 800 },
  { id: 'srv_2', name: 'Beard Sculpting', duration: 30, price: 400 },
  { id: 'srv_3', name: 'Premium Balayage', duration: 120, price: 4500 },
  { id: 'srv_4', name: 'Deep Tissue Massage', duration: 60, price: 1500 },
];

const bookAppointment = async (url: string, { arg }: { arg: Record<string, unknown> }) => {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg)
  }).then(res => res.json());
};

export function BookingSummary() {
  const { state, goToDimension } = useBookingEngine();
  const haptics = useHaptics();
  
  const { trigger } = useSWRMutation('/api/v1/me/appointments', bookAppointment);

  const selectedServices = state.serviceIds.map(id => MOCK_SERVICES.find(s => s.id === id)).filter(Boolean);
  const totalPrice = selectedServices.reduce((acc, s) => acc + (s ? s.price : 0), 0);


  const handleConfirm = async () => {
    try {
      // Execute the booking API call
      await trigger({
        date: state.timeSlot?.toISOString(),
        items: state.serviceIds.map(id => ({
          serviceId: id,
          employeeId: state.stylistId,
        }))
      });
      // Move to success dimension
      goToDimension('DELIGHT');
    } catch (err) {
      console.error(err);
      haptics.trigger('heavy');
      // Handle error gracefully
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => goToDimension('TIME')}>
          <ChevronLeft size={24} />
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight">Summary</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        
        {/* Receipt Card */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 space-y-4">
          <div className="flex items-start justify-between pb-4 border-b border-border/50">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Date & Time</p>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                {state.timeSlot ? new Intl.DateTimeFormat('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(state.timeSlot) : "TBD"}
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">Services</p>
            {selectedServices.map((srv, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Scissors size={14} className="text-muted-foreground" />
                  <span className="font-medium">{srv?.name}</span>
                </div>
                <span className="font-medium">₹{srv?.price}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border/50 flex justify-between items-center">
            <span className="font-semibold text-lg">Total</span>
            <span className="font-bold text-2xl text-primary">₹{totalPrice}</span>
          </div>
        </div>

        {/* Informational Box */}
        <div className="bg-secondary/30 rounded-2xl p-4 flex gap-3 border border-border/40">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-lg">💳</span>
          </div>
          <div>
            <h4 className="font-medium text-sm">Pay at the salon</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Your card will not be charged now. Payment is collected after your service.</p>
          </div>
        </div>

      </div>

      {/* Footer / Confirm Slider */}
      <div className="p-6 pb-safe bg-background/80 backdrop-blur-md border-t border-border/50 absolute bottom-0 left-0 right-0">
        <SwipeToConfirm 
          onConfirm={handleConfirm} 
          label="Swipe to Book" 
          processingLabel="Securing your spot..."
        />
      </div>
    </div>
  );
}

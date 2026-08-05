'use client';

import React from 'react';
import { useBookingEngine } from './booking-orchestrator';
import { useHaptics } from '../../hooks/use-haptics';
import { Button } from '../ui/button';
import { ChevronLeft, Scissors, Clock } from 'lucide-react';
import { SwipeToConfirm } from './swipe-to-confirm';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';

import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/axios';

export function BookingSummary() {
  const { state, setDraftId, setMissingRequirements, goToDimension } = useBookingEngine();
  const haptics = useHaptics();
  const queryClient = useQueryClient();
  
  // Retrieve cached services to calculate price/name
  const services: any[] = queryClient.getQueryData(['public-services']) || [];
  const selectedServices = state.serviceIds.map(id => services.find((s: any) => s.id === id) || { name: 'Service', basePrice: 0 });
  const totalPrice = selectedServices.reduce((acc, s) => acc + Number(s.basePrice || 0), 0);

  const handleConfirm = async () => {
    try {
      // 1. Create Draft
      const startRes = await apiClient.post('/booking/start', {
        customerId: state.customerId,
        branchId: 'cl_default_branch'
      });
      const draftId = startRes.data.data.id || startRes.data.data.draftId || startRes.data.data.appointmentId;
      setDraftId(draftId);

      // 2. Check Requirements
      const reqRes = await apiClient.post(`/booking/requirements/${state.customerId}`, { 
        serviceIds: state.serviceIds 
      });
      
      if (reqRes.data.data && reqRes.data.data.length > 0) {
        setMissingRequirements(reqRes.data.data);
        goToDimension('REQUIREMENTS');
        return;
      }

      // 3. Confirm immediately if no requirements
      const items = state.serviceIds.map(id => ({
        serviceId: id,
        employeeId: state.stylistId !== 'any' ? state.stylistId : null,
        startTime: state.timeSlot?.toISOString(),
        endTime: state.endTime?.toISOString()
      }));

      await apiClient.post('/booking/confirm', { 
        appointmentId: draftId,
        items
      });
      goToDimension('DELIGHT');
    } catch (err: any) {
      console.error(err);
      haptics.trigger('heavy');
      const msg = err.response?.data?.message || err.message || 'An error occurred during booking. Please try again.';
      toast.error(msg);
      throw err;
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

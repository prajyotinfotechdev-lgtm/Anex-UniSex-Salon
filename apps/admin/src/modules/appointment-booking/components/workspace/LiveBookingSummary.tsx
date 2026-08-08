'use client';

import React from 'react';
import { useBookingStore } from '../../store/booking.store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, Calendar as CalendarIcon, User, Tag } from 'lucide-react';
import { format } from 'date-fns';

export function LiveBookingSummary() {
  const { cart, selectedDate, step, setStep } = useBookingStore();

  const totalDuration = cart.reduce((acc, item) => acc + (item.duration || 0), 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0), 0);
  
  // Dummy discount logic for now
  const discount = 0;
  const total = subtotal - discount;

  const canConfirm = cart.length > 0 && cart.every(item => item.startTime && item.employeeId);

  if (step === 'identity') {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
        <p>Your itinerary is empty.</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-6">Booking Summary</h3>
      
      <div className="flex-1 overflow-y-auto space-y-6">
        {cart.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center mt-10">Select services to begin building the itinerary.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item, idx) => (
              <div key={item.id} className="p-4 bg-background rounded-lg border text-sm space-y-2 relative animate-in fade-in slide-in-from-right-2">
                <div className="flex justify-between font-medium">
                  <span>{item.name}</span>
                  <span>₹{item.price.toFixed(2)}</span>
                </div>
                
                {item.employeeName ? (
                  <div className="flex items-center text-muted-foreground gap-2">
                    <User className="h-3 w-3" />
                    <span>{item.employeeName}</span>
                  </div>
                ) : (
                  <div className="text-orange-500 text-xs">Professional not selected</div>
                )}
                
                {item.startTime ? (
                  <div className="flex items-center text-muted-foreground gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(item.startTime), 'h:mm a')} ({item.duration} min)</span>
                  </div>
                ) : (
                  <div className="text-orange-500 text-xs">Time not selected</div>
                )}
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="font-medium">{selectedDate ? format(selectedDate, 'EEEE, MMMM do, yyyy') : 'No Date Selected'}</span>
            </div>
            
            <Separator />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Duration</span>
                <span>{totalDuration} mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1"><Tag className="h-3 w-3"/> Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="pt-6 mt-auto">
          <Button 
            className="w-full h-12 text-lg font-medium" 
            disabled={!canConfirm || step === 'confirm'}
            onClick={() => setStep('confirm')}
          >
            {step === 'confirm' ? 'Ready to Confirm' : 'Continue to Confirm'}
          </Button>
          {!canConfirm && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Select time & professional for all services.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

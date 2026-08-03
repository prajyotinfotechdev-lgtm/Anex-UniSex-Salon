'use client';

import React, { useState } from 'react';
import { useBookingStore } from '../../../store/booking.store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, Calendar, User, Clock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

export function ConfirmStep() {
  const { customer, cart, selectedDate, setStep, customerId, draftId, reset } = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalDuration = cart.reduce((acc, item) => acc + (item.duration || 0), 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0), 0);
  const discount = 0;
  const total = subtotal - discount;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    setStep('submitting');
    
    try {
      // Execute the POST /booking/confirm
      await axios.post('/api/v1/booking/confirm', {
        draftId: draftId || 'mock-draft-id',
        customerId,
        branchId: 'cl_default_branch',
        items: cart.map(c => ({
          serviceId: c.serviceId,
          employeeId: c.employeeId,
          startTime: c.startTime,
          endTime: c.endTime,
          price: c.price
        }))
      });
      
      setStep('success');
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to confirm booking. Slots may no longer be available.');
      setIsSubmitting(false);
      setStep('confirm'); // revert
    }
  };

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto pt-10 pb-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Review & Confirm</h2>
        <p className="text-muted-foreground mt-2">Almost done. Review the details before confirming.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive border-destructive/20 border rounded-lg text-sm font-medium text-center">
          {error}
        </div>
      )}

      <div className="space-y-6">
        
        {/* Customer Box */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><User className="h-5 w-5"/> Customer</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-lg">{customer?.firstName} {customer?.lastName}</p>
              <p className="text-muted-foreground">{customer?.mobile}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep('identity')}>Change</Button>
          </div>
        </Card>

        {/* Itinerary Box */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Calendar className="h-5 w-5"/> Itinerary</h3>
          
          <div className="space-y-6">
            {cart.map((item, i) => (
              <div key={item.id} className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <User className="h-3 w-3" /> {item.employeeName}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                    <Clock className="h-3 w-3" /> {item.startTime ? format(new Date(item.startTime), 'EEEE, MMMM do · h:mm a') : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{item.duration} min</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setStep('schedule')}>Edit Services & Time</Button>
          </div>
        </Card>

        {/* Payment / Summary Box */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5"/> Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount Applied</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-xl">
              <span>Total Estimated</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

      </div>

      <div className="mt-10 flex gap-4 justify-end">
        <Button variant="ghost" size="lg" onClick={() => reset()}>Cancel</Button>
        <Button size="lg" className="px-10 text-lg" onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
        </Button>
      </div>

    </div>
  );
}

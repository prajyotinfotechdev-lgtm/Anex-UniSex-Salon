'use client';

import React, { useState } from 'react';
import { useBookingStore } from '../../../store/booking.store';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScheduleStep() {
  const { cart, selectedDate, setSelectedDate, updateCartItem, setStep, customerId, missingRequirements, setMissingRequirements } = useBookingStore();
  const [activeCartIndex, setActiveCartIndex] = useState(0);

  const currentCartItem = cart[activeCartIndex];

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', currentCartItem?.serviceId],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/employees`);
      return res.data.data || [];
    },
    enabled: !!currentCartItem
  });

  // Fetch availability for selected employee & date
  const { data: availability = [] } = useQuery({
    queryKey: ['availability', currentCartItem?.employeeId, selectedDate],
    queryFn: async () => {
      if (!currentCartItem?.employeeId || !selectedDate) return [];
      const res = await axios.get(`/api/v1/availability?employeeId=${currentCartItem.employeeId}&date=${selectedDate.toISOString()}`);
      return res.data.data || [];
    },
    enabled: !!currentCartItem?.employeeId && !!selectedDate
  });

  const handleNext = async () => {
    if (activeCartIndex < cart.length - 1) {
      setActiveCartIndex(activeCartIndex + 1);
    } else {
      // All scheduled. Check requirements next via API.
      try {
        const serviceIds = cart.map(c => c.serviceId);
        const res = await axios.post(`/api/v1/booking/requirements/${customerId}`, { serviceIds });
        
        if (res.data.data && res.data.data.length > 0) {
          setMissingRequirements(res.data.data);
          setStep('requirements');
        } else {
          setStep('confirm'); // Skip requirements if none
        }
      } catch(e) {
        setStep('confirm'); // fallback
      }
    }
  };

  if (!currentCartItem) return null;

  const isCurrentComplete = !!currentCartItem.employeeId && !!currentCartItem.startTime;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Schedule Time</h2>
          <p className="text-muted-foreground mt-1">Assign professional and time for {currentCartItem.name}</p>
        </div>
        
        {/* Progress indicator */}
        <div className="flex gap-2 items-center">
          {cart.map((item, idx) => (
            <div 
              key={item.id} 
              className={cn(
                "h-2 w-12 rounded-full transition-all cursor-pointer",
                idx === activeCartIndex ? "bg-primary" : item.startTime ? "bg-primary/40" : "bg-muted"
              )}
              onClick={() => setActiveCartIndex(idx)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0 overflow-y-auto pb-20">
        
        {/* Left Col: Calendar & Date */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border rounded-xl p-4 bg-background">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(d) => d && setSelectedDate(d)}
              className="rounded-md"
            />
          </div>
        </div>

        {/* Right Col: Professionals & Time */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Professionals */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Professional</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {employees.map((emp: any) => {
                const isSelected = currentCartItem.employeeId === emp.id;
                return (
                  <div 
                    key={emp.id}
                    onClick={() => updateCartItem(currentCartItem.id, { employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}` })}
                    className={cn(
                      "flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all hover:-translate-y-0.5",
                      isSelected ? "bg-primary/5 border-primary ring-1 ring-primary" : "bg-background"
                    )}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={``} />
                      <AvatarFallback>{emp.firstName[0]}{emp.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold flex items-center justify-between">
                        {emp.firstName} {emp.lastName}
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">{emp.specialization || 'Professional'}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Time Grid (Visual Timeline abstraction) */}
          {currentCartItem.employeeId && (
            <div className="animate-in fade-in">
              <h3 className="text-lg font-semibold mb-4">Select Time Slot</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {/* Mocked times for visual timeline feel */}
                {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '15:00', '16:00'].map(t => {
                  const d = new Date(selectedDate || new Date());
                  const [h,m] = t.split(':');
                  d.setHours(Number(h), Number(m), 0, 0);
                  const iso = d.toISOString();
                  const isSelected = currentCartItem.startTime === iso;
                  
                  return (
                    <div 
                      key={t}
                      onClick={() => updateCartItem(currentCartItem.id, { startTime: iso, endTime: new Date(d.getTime() + (currentCartItem.duration * 60000)).toISOString() })}
                      className={cn(
                        "py-3 rounded-lg text-center font-medium cursor-pointer transition-all border",
                        isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:border-primary/50"
                      )}
                    >
                      {format(d, 'h:mm a')}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="mt-auto pt-6 border-t flex justify-between items-center bg-background fixed bottom-0 right-0 left-0 md:left-96 md:right-80 p-6 z-10">
        <Button variant="outline" size="lg" onClick={() => setActiveCartIndex(Math.max(0, activeCartIndex - 1))} disabled={activeCartIndex === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous Service
        </Button>
        <Button size="lg" onClick={handleNext} disabled={!isCurrentComplete}>
          {activeCartIndex < cart.length - 1 ? 'Next Service' : 'Continue'} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

    </div>
  );
}

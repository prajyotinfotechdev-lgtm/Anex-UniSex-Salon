'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBookingEngine } from './booking-orchestrator';
import { useHaptics } from '../../hooks/use-haptics';
import { Button } from '../ui/button';
import { ChevronLeft, Calendar } from 'lucide-react';
import Image from 'next/image';
import { cn } from '../../lib/utils';
import useSWR from 'swr';

// Mock Employees for Stylist selection
const MOCK_STYLISTS = [
  { id: 'any', name: 'Anyone Available', image: '' },
  { id: 'emp_1', name: 'Vikram', image: 'https://i.pravatar.cc/150?u=emp_1' },
  { id: 'emp_2', name: 'Rahul', image: 'https://i.pravatar.cc/150?u=emp_2' },
];

const fetcher = (url: string, payload: Record<string, unknown>) => 
  fetch(url, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload) 
  }).then(res => res.json());

export function TimePicker() {
  const { state, setStylist, setTimeSlot, goToDimension } = useBookingEngine();
  const haptics = useHaptics();
  
  // Date State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Stylist State (Default to 'any' or predicted)
  const activeStylistId = state.stylistId || 'any';

  // Fetch Availability
  const { data: availableSlots, isLoading } = useSWR(
    state.serviceIds.length > 0 ? ['/api/v1/me/availability', {
      date: selectedDate.toISOString(),
      serviceIds: state.serviceIds,
      employeeId: activeStylistId === 'any' ? undefined : activeStylistId,
      branchId: 'default-branch'
    }] : null,
    ([url, payload]) => fetcher(url, payload)
  );

  // Fallback mock slots if API isn't fully wired during UI build
  const displaySlots = Array.isArray(availableSlots) && availableSlots.length > 0 
    ? availableSlots 
    : [
        { time: new Date(selectedDate.setHours(10, 0, 0, 0)), employeeId: 'emp_1' },
        { time: new Date(selectedDate.setHours(11, 30, 0, 0)), employeeId: 'emp_2' },
        { time: new Date(selectedDate.setHours(14, 15, 0, 0)), employeeId: 'emp_1' },
        { time: new Date(selectedDate.setHours(16, 0, 0, 0)), employeeId: 'emp_2' },
      ];

  const handleSlotSelect = (slot: { time: Date | string; employeeId?: string }) => {
    haptics.trigger('medium');
    setTimeSlot(new Date(slot.time));
    // If 'any' was selected, lock in the specific employee for this slot
    if (activeStylistId === 'any' && slot.employeeId) {
      setStylist(slot.employeeId);
    }
    goToDimension('CONFIRM');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => goToDimension('SERVICE')}>
          <ChevronLeft size={24} />
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight">Select Time</h2>
      </div>

      {/* Date Strip (Horizontal Scroll) */}
      <div className="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar">
        {[0, 1, 2, 3, 4, 5, 6].map(offset => {
          const d = new Date();
          d.setDate(d.getDate() + offset);
          const isSelected = d.toDateString() === selectedDate.toDateString();
          
          return (
            <motion.div
              key={offset}
              whileTap={{ scale: 0.95 }}
              onClick={() => { haptics.trigger('light'); setSelectedDate(d); }}
              className={cn(
                "flex flex-col items-center justify-center min-w-[4rem] h-20 rounded-2xl border transition-all cursor-pointer",
                isSelected 
                  ? "bg-primary text-primary-foreground border-primary shadow-md" 
                  : "bg-card text-foreground border-border/50 hover:bg-secondary/50"
              )}
            >
              <span className="text-xs font-medium uppercase opacity-80">
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-xl font-bold mt-1">
                {d.getDate()}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Stylist Selector */}
      <div className="px-6 py-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">With</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {MOCK_STYLISTS.map(stylist => {
            const isSelected = activeStylistId === stylist.id;
            return (
              <motion.button
                key={stylist.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => { haptics.trigger('light'); setStylist(stylist.id); }}
                className={cn(
                  "flex items-center gap-2 pr-4 pl-1.5 py-1.5 rounded-full border transition-all",
                  isSelected 
                    ? "bg-primary/10 border-primary text-primary" 
                    : "bg-card border-border/50 hover:border-border"
                )}
              >
                {stylist.image ? (
                  <Image src={stylist.image} alt={stylist.name} width={32} height={32} className="rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Calendar size={14} className="text-muted-foreground" />
                  </div>
                )}
                <span className="text-sm font-medium whitespace-nowrap">{stylist.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displaySlots.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {displaySlots.map((slot: { time: Date | string; employeeId?: string }, idx: number) => {
              const d = new Date(slot.time);
              const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSlotSelect(slot)}
                  className="py-3 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all font-medium text-sm text-center shadow-sm"
                >
                  {timeStr}
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="font-medium text-lg mb-1">Fully Booked</h3>
            <p className="text-muted-foreground text-sm">Please try another day or stylist.</p>
          </div>
        )}
      </div>
    </div>
  );
}

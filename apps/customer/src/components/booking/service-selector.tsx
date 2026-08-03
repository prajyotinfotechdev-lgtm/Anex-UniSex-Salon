'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBookingEngine } from './booking-orchestrator';
import { useHaptics } from '../../hooks/use-haptics';
import { Button } from '../ui/button';
import { ChevronRight, Search, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/axios';

export function ServiceSelector() {
  const { state, selectService, deselectService, goToDimension } = useBookingEngine();
  const haptics = useHaptics();
  const [search, setSearch] = useState('');

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['public-services'],
    queryFn: async () => {
      // Mock base API call if real endpoint doesn't exist yet, but wire it up structurally
      try {
        const res = await apiClient.get('/public/services');
        return res.data.data || [];
      } catch (e) {
        // Fallback for UI if API is not fully running locally in Customer App context yet
        return [
          { id: 'srv_1', name: 'Signature Haircut', durationMinutes: 45, basePrice: 800, category: 'Hair' },
          { id: 'srv_2', name: 'Beard Sculpting', durationMinutes: 30, basePrice: 400, category: 'Grooming' },
          { id: 'srv_3', name: 'Premium Balayage', durationMinutes: 120, basePrice: 4500, category: 'Color' },
          { id: 'srv_4', name: 'Deep Tissue Massage', durationMinutes: 60, basePrice: 1500, category: 'Spa' },
        ];
      }
    }
  });

  const filteredServices = services.filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase()));
  const hasSelection = state.serviceIds.length > 0;
  
  const totalPrice = state.serviceIds.reduce((acc, id) => {
    const s = services.find((srv: any) => srv.id === id);
    return acc + (s ? Number(s.basePrice) : 0);
  }, 0);

  const toggleService = (id: string) => {
    haptics.trigger('light');
    if (state.serviceIds.includes(id)) {
      deselectService(id);
    } else {
      selectService(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative pb-24">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-3xl font-semibold tracking-tight">What do you need today?</h2>
        <p className="text-muted-foreground mt-1">Select one or more services</p>
      </div>

      {/* Search */}
      <div className="px-6 pb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search treatments..." 
            className="w-full bg-secondary/50 border border-border/50 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Service List */}
      <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-safe">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-muted rounded-2xl"></div>)}
          </div>
        ) : (
          filteredServices.map((service: any) => {
            const isSelected = state.serviceIds.includes(service.id);
            return (
              <motion.div
                key={service.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleService(service.id)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                  isSelected 
                    ? "bg-primary/10 border-primary shadow-sm" 
                    : "bg-card border-border/40 hover:border-border"
                )}
              >
                <div>
                  <h3 className="font-medium text-lg">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.durationMinutes} mins • ₹{service.basePrice}</p>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                )}>
                  {isSelected && <CheckCircle2 size={16} />}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Floating Next Pill */}
      <AnimatePresence>
        {hasSelection && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-6 left-6 right-6"
          >
            <Button 
              size="lg" 
              className="w-full h-14 rounded-full text-lg shadow-xl shadow-primary/20 gap-2 justify-between px-6"
              onClick={() => {
                haptics.trigger('medium');
                goToDimension('TIME');
              }}
            >
              <span>{state.serviceIds.length} Selected (₹{totalPrice})</span>
              <span className="flex items-center gap-1">Next <ChevronRight size={20} /></span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline AnimatePresence fallback if not imported globally in this file scope (but it is via framer-motion)
import { AnimatePresence } from 'framer-motion';

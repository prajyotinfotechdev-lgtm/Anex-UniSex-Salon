'use client';

import React, { useState } from 'react';
import { useBookingStore } from '../../../store/booking.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Sparkles, Clock, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { cn } from '@/lib/utils';

export function ServicesStep() {
  const { cart, addServiceToCart, removeServiceFromCart, insights, setStep } = useBookingStore();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  // Mocking service fetch. In real app, query `/api/v1/services`
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', activeTab, search],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/services`);
      return res.data.data || [];
    }
  });

  const handleToggleService = (service: any) => {
    const inCart = cart.find(item => item.serviceId === service.id);
    if (inCart) {
      removeServiceFromCart(inCart.id);
    } else {
      addServiceToCart({
        serviceId: service.id,
        name: service.name,
        price: Number(service.basePrice),
        duration: service.durationMinutes,
      });
    }
  };

  return (
    <div className="h-full flex flex-col pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Select Services</h2>
          <p className="text-muted-foreground mt-1">Choose services to build the itinerary.</p>
        </div>
        {cart.length > 0 && (
          <Button size="lg" className="animate-in zoom-in" onClick={() => setStep('schedule')}>
            Continue to Schedule
          </Button>
        )}
      </div>

      {insights?.memory?.frequentlyBookedServiceIds?.length > 0 && (
        <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <div className="flex items-center gap-2 text-primary font-medium mb-3">
            <Sparkles className="h-4 w-4" />
            Recommended for this customer
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.filter((s:any) => insights.memory.frequentlyBookedServiceIds.includes(s.id)).map((s:any) => {
              const isSelected = !!cart.find(c => c.serviceId === s.id);
              return (
                <div 
                  key={s.id}
                  onClick={() => handleToggleService(s)}
                  className={cn(
                    "flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50 relative",
                    isSelected ? "bg-primary/5 border-primary shadow-sm" : "bg-background"
                  )}
                >
                  {isSelected && <div className="absolute top-3 right-3 text-primary"><Check className="h-4 w-4"/></div>}
                  <span className="font-semibold">{s.name}</span>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{s.durationMinutes} min</span>
                    <span>${Number(s.basePrice).toFixed(2)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            className="pl-10 h-12 text-lg bg-background" 
            placeholder="Search services..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start overflow-x-auto rounded-none border-b bg-transparent h-auto p-0 pb-2">
          <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-2">All Services</TabsTrigger>
          <TabsTrigger value="hair" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-2">Hair</TabsTrigger>
          <TabsTrigger value="color" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-2">Color</TabsTrigger>
          <TabsTrigger value="skin" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-2">Skin</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="flex-1 overflow-y-auto pt-6 focus-visible:outline-none">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg border"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
              {services.filter((s:any) => s.name.toLowerCase().includes(search.toLowerCase())).map((s:any) => {
                const isSelected = !!cart.find(c => c.serviceId === s.id);
                return (
                  <div 
                    key={s.id}
                    onClick={() => handleToggleService(s)}
                    className={cn(
                      "flex flex-col p-5 border rounded-xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md relative",
                      isSelected ? "bg-primary/5 border-primary ring-1 ring-primary" : "bg-background"
                    )}
                  >
                    {isSelected && <div className="absolute top-4 right-4 text-primary bg-primary/10 p-1 rounded-full"><Check className="h-4 w-4"/></div>}
                    <h3 className="font-semibold text-lg">{s.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description || 'Premium service'}</p>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" /> {s.durationMinutes} min
                      </div>
                      <div className="text-lg font-semibold">${Number(s.basePrice).toFixed(2)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

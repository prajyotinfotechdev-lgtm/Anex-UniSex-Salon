'use client';

import React, { useState } from 'react';
import { useBookingStore } from '../../../store/booking.store';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserPlus, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export function IdentityStep() {
  const { setCustomer, setStep } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch customers (In real app, this would use a proper trpc/axios hook with debounce)
  // We'll mock the query structure for now
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const res = await axios.get(`/api/v1/customers?search=${searchQuery}`);
      return res.data.data || [];
    },
    enabled: searchQuery.length > 1
  });

  const handleSelectCustomer = async (customer: any) => {
    // Fire the POST /booking/start to get insights
    try {
      const startRes = await axios.post('/api/v1/booking/start', { customerId: customer.id, branchId: 'cl_default_branch' });
      setCustomer(customer, startRes.data.data.insights);
      setStep('services');
    } catch (e) {
      console.error('Failed to start booking session', e);
      // Fallback
      setCustomer(customer, null);
      setStep('services');
    }
  };

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto pt-10">
      <h2 className="text-3xl font-bold mb-2">Who is this booking for?</h2>
      <p className="text-muted-foreground mb-8">Search by name, phone, or email. (Ctrl+N to focus)</p>

      <div className="relative bg-background border rounded-xl shadow-sm overflow-hidden flex-1 max-h-[500px] flex flex-col">
        <Command className="flex-1 flex flex-col" shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Start typing..." 
              autoFocus 
              className="h-14 text-lg border-none focus:ring-0 w-full outline-none bg-transparent"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </div>
          
          <CommandList className="flex-1 overflow-y-auto p-2">
            {!isLoading && searchQuery.length > 1 && customers.length === 0 && (
              <CommandEmpty className="py-6 text-center text-muted-foreground">
                No customers found.
                <Button variant="link" className="mt-2 text-primary flex items-center justify-center w-full">
                  <UserPlus className="mr-2 h-4 w-4"/> Create New Customer
                </Button>
              </CommandEmpty>
            )}
            
            {isLoading && (
              <div className="py-6 text-center text-muted-foreground animate-pulse">Searching...</div>
            )}
            
            {customers.length > 0 && (
              <CommandGroup heading="Customers">
                {customers.map((c: any) => (
                  <CommandItem 
                    key={c.id}
                    value={c.id}
                    onSelect={() => handleSelectCustomer(c)}
                    className="flex items-center gap-4 p-3 cursor-pointer rounded-lg aria-selected:bg-muted"
                  >
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.firstName} ${c.lastName}`} />
                      <AvatarFallback>{c.firstName?.[0]}{c.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-lg">{c.firstName} {c.lastName}</div>
                      <div className="text-sm text-muted-foreground">{c.mobile}</div>
                    </div>
                    {c.loyaltyPoints > 0 && <Badge variant="secondary">{c.loyaltyPoints} pts</Badge>}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {searchQuery.length <= 1 && (
              <div className="py-8 text-center text-muted-foreground">
                <p>Type to search existing customers.</p>
              </div>
            )}
          </CommandList>
        </Command>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-14 text-lg justify-start px-6" onClick={() => {
          // Walk-in logic
          setCustomer({ id: 'walk-in', firstName: 'Walk-in', lastName: 'Customer', mobile: 'N/A', loyaltyPoints: 0 }, null);
          setStep('services');
        }}>
          <UserPlus className="mr-3 h-5 w-5 text-muted-foreground" />
          Walk-in Booking
        </Button>
        <Button variant="outline" className="h-14 text-lg justify-start px-6">
          <UserPlus className="mr-3 h-5 w-5 text-muted-foreground" />
          New Customer
        </Button>
      </div>
    </div>
  );
}

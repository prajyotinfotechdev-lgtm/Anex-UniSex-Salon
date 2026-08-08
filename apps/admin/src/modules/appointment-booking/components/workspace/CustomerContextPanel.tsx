'use client';

import React from 'react';
import { useBookingStore } from '../../store/booking.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function CustomerContextPanel() {
  const { customer, insights, step } = useBookingStore();

  if (step === 'identity' && !customer) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <p>Search or add a customer to see their history and preferences.</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Identity Header */}
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-20 w-20 mb-3">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.firstName} ${customer.lastName}`} />
          <AvatarFallback>{customer.firstName?.[0]}{customer.lastName?.[0]}</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold">{customer.firstName} {customer.lastName}</h3>
        <p className="text-sm text-muted-foreground">{customer.mobile}</p>
        
        <div className="flex gap-2 mt-3">
          {insights?.recommendationLoop?.preferredEmployeeId && (
            <Badge variant="secondary" className="text-xs">Loyal Client</Badge>
          )}
          {customer.loyaltyPoints > 0 && (
            <Badge variant="outline" className="text-xs">{customer.loyaltyPoints} Points</Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Customer Insights & Preferences */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Preferences</h4>
          <p className="text-sm text-muted-foreground">
            {insights?.recommendationLoop?.preferredEmployeeId 
              ? 'Prefers specific professional' 
              : 'No strong professional preference yet.'}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">Recent Visits</h4>
          <p className="text-sm text-muted-foreground">
            {insights?.memory?.lastVisitDate 
              ? `Last visited on ${new Date(insights.memory.lastVisitDate).toLocaleDateString()}` 
              : 'First time customer!'}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-1">Most Booked</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {insights?.memory?.frequentlyBookedServiceIds?.slice(0, 3).map((id: string, i: number) => (
              <Badge key={i} variant="secondary">Service #{id.substring(0, 4)}</Badge>
            ))}
            {(!insights?.memory?.frequentlyBookedServiceIds || insights.memory.frequentlyBookedServiceIds.length === 0) && (
              <span className="text-sm text-muted-foreground">No history</span>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Wallet & Packages */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium mb-2">Wallet & Memberships</h4>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Wallet Balance</span>
          <span className="font-medium">₹0.00</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Active Packages</span>
          <span className="font-medium">None</span>
        </div>
      </div>

      {/* Medical & Notes */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium mb-2 text-destructive">Alerts</h4>
        <p className="text-sm text-muted-foreground italic">No medical alerts on file.</p>
      </div>

    </div>
  );
}

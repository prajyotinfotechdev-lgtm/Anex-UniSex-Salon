'use client';

import React from 'react';
import { useBookingStore } from '../../../store/booking.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function RequirementsStep() {
  const { missingRequirements, setStep } = useBookingStore();

  // If there are no missing requirements, this shouldn't be mounted, but fallback to confirm
  if (!missingRequirements || missingRequirements.length === 0) {
    setStep('confirm');
    return null;
  }

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto pt-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold">Action Required</h2>
        <p className="text-muted-foreground mt-2">
          This customer has missing or expired forms required for the selected services.
        </p>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pb-20">
        {missingRequirements.map((req: any, idx: number) => (
          <Card key={idx} className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{req.type.replace('_', ' ')} Required</span>
                <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-100">
                  {req.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Required for service: {req.serviceName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Dummy Form for demonstration, in real app render dynamic form schema based on req.type */}
              <div className="bg-background rounded-md p-4 border space-y-4">
                <p className="text-sm font-medium">Please review and complete the form with the customer.</p>
                <div className="h-20 bg-muted/50 border border-dashed rounded flex items-center justify-center text-sm text-muted-foreground">
                  [ Form Fields For {req.type} ]
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Mark as Completed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={() => setStep('confirm')}>
          Continue to Confirmation
        </Button>
      </div>
    </div>
  );
}

function Badge({ children, className, variant }: any) {
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>;
}

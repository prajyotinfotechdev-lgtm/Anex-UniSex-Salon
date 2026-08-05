import React from 'react';
import { PremiumLoader } from '@/components/ui/premium-loader';

export default function Loading() {
  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center">
      <PremiumLoader text="Loading..." />
    </div>
  );
}

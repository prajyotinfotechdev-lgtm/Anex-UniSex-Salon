'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useHaptics } from '../../hooks/use-haptics';
import { Check } from 'lucide-react';

interface SwipeToConfirmProps {
  onConfirm: () => void;
  label?: string;
  processingLabel?: string;
}

export function SwipeToConfirm({ 
  onConfirm, 
  label = "Swipe to Confirm", 
  processingLabel = "Securing your spot..." 
}: SwipeToConfirmProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const x = useMotionValue(0);
  const haptics = useHaptics();

  // Assuming a max swipe width. For a robust component, we'd measure the container width.
  // We'll use a fixed approximate width for the slider track.
  const maxWidth = 250; 
  
  const opacity = useTransform(x, [0, maxWidth * 0.8], [1, 0]);
  const bgOpacity = useTransform(x, [0, maxWidth], [0, 1]);

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Provide light ticking haptics as they drag
    if (info.point.x % 20 < 2) {
      haptics.trigger('light');
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > maxWidth * 0.75) {
      // Confirmed
      setIsConfirmed(true);
      haptics.trigger('heavy');
      setTimeout(() => {
        haptics.trigger('heavy');
        onConfirm();
      }, 500); // brief pause to show success state before advancing orchestrator
    } else {
      // Snap back
      haptics.trigger('light');
    }
  };

  if (isConfirmed) {
    return (
      <div className="w-full max-w-sm mx-auto h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg overflow-hidden relative">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: 'spring', damping: 20 }}
          className="flex items-center gap-2"
        >
          <Check size={24} />
          {processingLabel}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto h-16 rounded-full bg-secondary/30 border border-border/50 flex items-center relative overflow-hidden backdrop-blur-sm">
      <motion.div 
        className="absolute inset-0 bg-primary/20" 
        style={{ opacity: bgOpacity }} 
      />
      
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground font-medium"
        style={{ opacity }}
      >
        {label}
      </motion.div>
      
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: maxWidth }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.95 }}
        style={{ x }}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center m-1 shadow-lg cursor-grab active:cursor-grabbing relative z-10"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </motion.div>
    </div>
  );
}

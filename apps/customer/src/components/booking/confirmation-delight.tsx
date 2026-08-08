'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, MapPin, X } from 'lucide-react';
import { useBookingEngine } from './booking-orchestrator';
import { useHaptics } from '../../hooks/use-haptics';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function ConfirmationDelight() {
  const { state, reset } = useBookingEngine();
  const haptics = useHaptics();
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  // We initialize particles lazily so Math.random is only called once.
  // Since showConfetti is false on initial mount (SSR), there's no hydration mismatch.
  const [particles] = useState(() => [...Array(6)].map(() => ({
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 200 - 100,
    scale: Math.random() * 0.5 + 0.5
  })));

  useEffect(() => {
    // Fire confetti effect slightly after mount
    const t = setTimeout(() => {
      setShowConfetti(true);
      haptics.trigger('medium');
    }, 300);

    // Redirect to appointments dashboard after 4 seconds
    const redirectTimer = setTimeout(() => {
      reset(); // Reset booking state
      router.push('/appointments');
    }, 4000);

    return () => {
      clearTimeout(t);
      clearTimeout(redirectTimer);
    };
  }, [haptics, router, reset]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full relative overflow-hidden">
      
      {/* Decorative Background Blob */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="absolute top-1/4 -z-10 w-64 h-64 bg-primary/20 blur-3xl rounded-full"
      />

      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, delay: 0.1 }}
      >
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto text-primary relative">
          <CheckCircle2 size={48} strokeWidth={1.5} />
          
          {/* Confetti particles */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {particles.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{ 
                    x: p.x, 
                    y: p.y, 
                    opacity: 0,
                    scale: p.scale
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-primary"
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold tracking-tight mb-2"
      >
        Your chair is waiting.
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-8 text-lg"
      >
        We&apos;ve reserved {state.timeSlot ? new Intl.DateTimeFormat('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(state.timeSlot) : "your time"}.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-sm font-medium text-primary mb-8 animate-pulse"
      >
        Redirecting to dashboard...
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm space-y-3"
      >
        <Button variant="default" size="lg" className="w-full gap-2">
          <Calendar size={18} />
          Add to Calendar
        </Button>
        <Button variant="outline" size="lg" className="w-full gap-2 bg-background/50 backdrop-blur" onClick={() => window.open('https://www.google.com/maps?gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgzNDA4ajBqNKgCALACAQ&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KUN-FHYAg887McSa-386Ei1A&daddr=9HQ6%2BWJR,+Sahakar+Maharshi+Keshavrao+Sonawane+Marg,+near+icici+bank,+Mantri+Nagar,+Latur,+Maharashtra+413531', '_blank')}>
          <MapPin size={18} />
          Get Directions
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute top-6 right-6"
      >
        <Button variant="ghost" size="icon" onClick={reset} className="rounded-full bg-secondary/50 backdrop-blur-md">
          <X size={20} />
        </Button>
      </motion.div>
    </div>
  );
}

"use client";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Crown, ArrowRight, QrCode, Wallet, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingEngine } from "../booking/booking-orchestrator";
import { useTheme } from "next-themes";
import { getFullApiUrl } from "@/lib/api";
import { toast } from "sonner";

interface StatusHubProps {
  urgencyState: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  urgentAction?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  predictiveBooking?: any;
  financials?: {
    walletBalance: number;
    rewardPoints: number;
    nextTier: string;
    pointsToNextTier: number;
  };
}

export function StatusHub({ urgencyState, urgentAction, predictiveBooking, financials }: StatusHubProps) {
  const router = useRouter();
  const { goToDimension, loadPrediction, reset } = useBookingEngine();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Reschedule State
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);
  const [displayAction, setDisplayAction] = useState(urgentAction);

  useEffect(() => {
    if (urgentAction) setDisplayAction(urgentAction);
  }, [urgentAction]);

  const handleConfirmReschedule = async () => {
    if (!selectedSlot || !displayAction?.id) return;
    setIsRescheduling(true);
    
    try {
      const selectedDate = new Date(selectedSlot);
      const token = localStorage.getItem("anex_device_token");
      
      const res = await fetch(getFullApiUrl(`/api/v1/me/appointments/${displayAction.id}/reschedule`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          date: selectedDate.toISOString().split('T')[0],
          startTime: selectedDate.toISOString()
        })
      });

      if (!res.ok) {
        throw new Error('Failed to reschedule');
      }
      
      setRescheduleSuccess(true);
      setDisplayAction({ ...displayAction, time: selectedSlot });
      
      setTimeout(() => {
        setRescheduleSuccess(false);
        setShowReschedule(false);
        setSelectedSlot(null);
      }, 1500);
    } catch (error) {
      console.error('Failed to reschedule:', error);
      toast.error('Failed to reschedule appointment. Please try again.');
    } finally {
      setIsRescheduling(false);
    }
  };

  const getDummySlots = () => {
    if (!displayAction?.time) return [];
    const baseTime = new Date(displayAction.time);
    return [
      new Date(baseTime.getTime() + 15 * 60000).toISOString(),
      new Date(baseTime.getTime() + 30 * 60000).toISOString(),
      new Date(baseTime.getTime() + 60 * 60000).toISOString(),
    ];
  };
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isLight = mounted && resolvedTheme === 'light';
  
  // 3D Tilt Effect
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };
  
  const handleMouseLeave = () => {
    animate(mouseX, 0.5, { type: "spring", stiffness: 300, damping: 30 });
    animate(mouseY, 0.5, { type: "spring", stiffness: 300, damping: 30 });
  };
  
  const rotateX = useMotionTemplate`${(mouseY.get() - 0.5) * -15}deg`;
  const rotateY = useMotionTemplate`${(mouseX.get() - 0.5) * 15}deg`;

  // Animated gradient background mesh
  const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];
  const color = useMotionValue(COLORS_TOP[0]);

  React.useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);
  
  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, ${isLight ? '#f8fafc' : '#020617'} 50%, ${color})`;

  // Calculate progress for Circular Ring
  const totalPointsForTier = 1000; // Mock threshold
  const points = financials?.rewardPoints || 0;
  const progressPercentage = Math.min((points / totalPointsForTier) * 100, 100);
  const strokeDasharray = `${progressPercentage} 100`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      style={{
        transformStyle: "preserve-3d",
        backgroundImage
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/10 shadow-2xl transition-all duration-300"
    >
      {/* Dynamic Frosted Overlay */}
      <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm pointer-events-none" />

      {/* Reschedule Overlay */}
      <AnimatePresence>
        {showReschedule && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl p-6 flex flex-col justify-center rounded-[2.5rem]"
          >
            {rescheduleSuccess ? (
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white">Slot Updated</h3>
                <p className="text-zinc-500 text-sm">We've adjusted your time. Drive safely!</p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-white">Running Late?</h3>
                    <p className="text-sm text-zinc-500">Pick a new time for today</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 h-8 w-8" onClick={() => setShowReschedule(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {getDummySlots().map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 px-1 rounded-xl text-[13px] font-semibold transition-all border ${
                        selectedSlot === slot 
                          ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                          : 'bg-black/5 dark:bg-white/5 border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </button>
                  ))}
                </div>

                <Button 
                  className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold h-12 rounded-2xl shadow-xl"
                  disabled={!selectedSlot || isRescheduling}
                  onClick={handleConfirmReschedule}
                  haptic="medium"
                >
                  {isRescheduling ? 'Confirming...' : 'Confirm New Time'}
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Status Section */}
      <motion.div 
        style={{ rotateX, rotateY, translateZ: 50 }}
        className="p-7 pb-6 relative z-10"
      >
        {urgencyState === "APPOINTMENT_TODAY" && displayAction ? (
          <div className="space-y-5">
            <div className="inline-flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/30 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Today
            </div>
            
            <div>
              <h2 className="text-4xl font-serif text-zinc-900 dark:text-white tracking-tight mb-2">
                {new Date(displayAction.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 font-medium text-sm">
                {displayAction.title} {displayAction.subtitle}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold rounded-2xl h-12 shadow-lg shadow-black/5 dark:shadow-white/5" haptic="medium" onClick={() => window.open('https://www.google.com/maps?gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgzNDA4ajBqNKgCALACAQ&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KUN-FHYAg887McSa-386Ei1A&daddr=9HQ6%2BWJR,+Sahakar+Maharshi+Keshavrao+Sonawane+Marg,+near+icici+bank,+Mantri+Nagar,+Latur,+Maharashtra+413531', '_blank')}>
                <MapPin className="w-4 h-4 mr-2" /> Directions
              </Button>
              <Button variant="outline" className="flex-1 border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-2xl h-12 backdrop-blur-md" haptic="light" onClick={() => setShowReschedule(true)}>
                Running Late?
              </Button>
            </div>
          </div>
        ) : urgencyState === "RETURNING" && predictiveBooking ? (
          <div className="space-y-5">
            <div className="inline-flex items-center gap-1.5 bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-black/10 dark:border-white/20 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-primary" />
              VIP Concierge
            </div>
            
            <div>
              <h2 className="text-3xl font-serif text-zinc-900 dark:text-white tracking-tight mb-2">
                The Usual?
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 font-medium text-sm leading-relaxed max-w-[90%]">
                {predictiveBooking.subtitle}
              </p>
            </div>

            <div className="pt-2">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl h-14 text-base shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all active:scale-[0.98]" 
                haptic="medium"
                onClick={() => {
                  reset();
                  router.push('/book');
                }}
              >
                Book Appointment <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20 backdrop-blur-md">
                <Crown className="w-3 h-3 text-primary" />
                Welcome Back
              </div>
              
              <div>
                <h2 className="text-3xl font-serif text-white tracking-tight mb-2">
                  Ready for a refresh?
                </h2>
                <p className="text-zinc-400 font-light text-sm leading-relaxed mb-4">
                  Explore our curated services and discover a new look today.
                </p>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary/95 text-black font-semibold rounded-xl h-12 text-sm shadow-lg shadow-primary/10 transition-all active:scale-[0.98]" 
                  haptic="medium"
                  onClick={() => {
                    reset();
                    router.push('/book');
                  }}
                >
                  Book an Appointment
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}

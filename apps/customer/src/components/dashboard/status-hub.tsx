"use client";

import React from 'react';
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { Sparkles, MapPin, Crown, ArrowRight, QrCode, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingEngine } from "../booking/booking-orchestrator";

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
  const { goToDimension, loadPrediction } = useBookingEngine();
  
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
  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;

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
      className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-300"
    >
      {/* Dynamic Frosted Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />

      {/* Main Status Section */}
      <motion.div 
        style={{ rotateX, rotateY, translateZ: 50 }}
        className="p-7 pb-6 relative z-10"
      >
        {urgencyState === "APPOINTMENT_TODAY" && urgentAction ? (
          <div className="space-y-5">
            <div className="inline-flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/30 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Today
            </div>
            
            <div>
              <h2 className="text-4xl font-serif text-white tracking-tight mb-2">
                {new Date(urgentAction.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </h2>
              <p className="text-zinc-300 font-medium text-sm">
                {urgentAction.title} {urgentAction.subtitle}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-white text-black hover:bg-zinc-200 font-semibold rounded-2xl h-12 shadow-lg shadow-white/5" haptic="medium">
                <MapPin className="w-4 h-4 mr-2" /> Directions
              </Button>
              <Button variant="outline" className="flex-1 border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-2xl h-12 backdrop-blur-md" haptic="light">
                Running Late?
              </Button>
            </div>
          </div>
        ) : urgencyState === "RETURNING" && predictiveBooking ? (
          <div className="space-y-5">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-zinc-200 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-primary" />
              VIP Concierge
            </div>
            
            <div>
              <h2 className="text-3xl font-serif text-white tracking-tight mb-2">
                The Usual?
              </h2>
              <p className="text-zinc-300 font-medium text-sm leading-relaxed max-w-[90%]">
                {predictiveBooking.subtitle}
              </p>
            </div>

            <div className="pt-2">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl h-14 text-base shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all active:scale-[0.98]" 
                haptic="medium"
                onClick={() => {
                  loadPrediction(predictiveBooking);
                  goToDimension('TIME');
                }}
              >
                Book It Again <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center gap-1.5 bg-white/10 text-zinc-200 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 backdrop-blur-md">
                <Crown className="w-3 h-3 text-primary" />
                Welcome Back
              </div>
              
              <div>
                <h2 className="text-3xl font-serif text-white tracking-tight mb-2">
                  Ready for a refresh?
                </h2>
                <p className="text-zinc-400 font-medium text-sm leading-relaxed mb-4">
                  Explore our curated services and discover a new look today.
                </p>
                
                <Button 
                  className="w-full bg-white hover:bg-zinc-200 text-black font-bold rounded-2xl h-12 text-sm shadow-lg transition-all active:scale-[0.98]" 
                  haptic="medium"
                  onClick={() => goToDimension('SERVICE')}
                >
                  Book an Appointment
                </Button>
              </div>
            </div>

            {/* Glowing Circular Progress Ring for Loyalty */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 rounded-full blur-md" />
              <svg className="w-24 h-24 transform -rotate-90 relative z-10" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-primary"
                  strokeWidth="3"
                  strokeDasharray={`${strokeDasharray}`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-lg font-bold text-white">{points}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-medium -mt-1">Pts</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Identity & Financials Footer (Integrated) */}
      {financials && (
        <div className="relative z-10 bg-black/40 backdrop-blur-md border-t border-white/5 p-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Wallet</p>
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                  <span className="text-lg font-bold text-white tracking-tight">₹{financials.walletBalance}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Points</p>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-lg font-bold text-white tracking-tight">{financials.rewardPoints}</span>
                <span className="text-[10px] text-zinc-400 font-semibold">PTS</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

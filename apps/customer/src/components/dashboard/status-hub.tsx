"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock, MapPin, QrCode, Crown, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingEngine } from "../booking/booking-orchestrator";
import { cn } from "@/lib/utils";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl"
    >
      {/* Immersive glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Status Section */}
      <div className="p-6 pb-5 relative z-10">
        {urgencyState === "APPOINTMENT_TODAY" && urgentAction ? (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Today
            </div>
            
            <div>
              <h2 className="text-3xl font-serif text-white tracking-tight mb-1">
                {new Date(urgentAction.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </h2>
              <p className="text-zinc-400 font-medium text-sm">
                {urgentAction.title} {urgentAction.subtitle}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-white text-black hover:bg-zinc-200 font-semibold rounded-2xl h-12 shadow-lg shadow-white/5" haptic="medium">
                <MapPin className="w-4 h-4 mr-2" /> Directions
              </Button>
              <Button variant="outline" className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl h-12" haptic="light">
                Running Late?
              </Button>
            </div>
          </div>
        ) : urgencyState === "RETURNING" && predictiveBooking ? (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-white/5 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              VIP Concierge
            </div>
            
            <div>
              <h2 className="text-2xl font-serif text-white tracking-tight mb-1">
                The Usual?
              </h2>
              <p className="text-zinc-400 font-medium text-sm leading-relaxed">
                {predictiveBooking.subtitle}
              </p>
            </div>

            <div className="pt-2">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl h-14 text-base shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
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
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-white/5 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
              <Crown className="w-3.5 h-3.5 text-primary" />
              Welcome Back
            </div>
            
            <div>
              <h2 className="text-2xl font-serif text-white tracking-tight mb-1">
                Ready for a refresh?
              </h2>
              <p className="text-zinc-400 font-medium text-sm">
                Explore our curated services and discover a new look today.
              </p>
            </div>

            <div className="pt-2">
              <Button 
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold rounded-2xl h-14 text-base shadow-lg transition-all active:scale-[0.98]" 
                haptic="medium"
                onClick={() => goToDimension('SERVICE')}
              >
                Book an Appointment
              </Button>
            </div>
          </div>
        )}
      </div>

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

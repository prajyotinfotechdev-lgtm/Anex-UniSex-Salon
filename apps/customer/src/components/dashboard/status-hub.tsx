"use client";

import React, { useEffect, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Crown, ArrowRight, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingEngine } from "../booking/booking-orchestrator";
import { useTheme } from "next-themes";
import { getFullApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { reset } = useBookingEngine();
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
    if (!selectedSlot) return;
    setIsRescheduling(true);
    try {
      const selectedDate = new Date(selectedSlot);
      const token = localStorage.getItem("anex_device_token");

      if (displayAction?.id) {
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

        if (!res.ok) throw new Error('Failed to reschedule');
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      setRescheduleSuccess(true);
      setDisplayAction({ ...displayAction, time: selectedSlot });

      setTimeout(() => {
        setRescheduleSuccess(false);
        setShowReschedule(false);
        setSelectedSlot(null);
      }, 1800);
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

  useEffect(() => { setMounted(true); }, []);

  const isLight = mounted && resolvedTheme === 'light';

  // Loyalty Ring
  const totalPointsForTier = 1000;
  const points = financials?.rewardPoints || 0;
  const progressPercentage = Math.min((points / totalPointsForTier) * 100, 100);
  const strokeDasharray = `${progressPercentage} 100`;

  // ── Light-mode premium card skin ──────────────────────────────
  const cardBase = isLight
    ? "bg-gradient-to-br from-[#fffdf9] via-[#fdf7ee] to-[#faf2e4] border border-[#cba876]/20 shadow-[0_8px_48px_rgba(203,168,118,0.14)]"
    : "bg-gradient-to-br from-zinc-900/80 to-black/80 border border-white/10 shadow-2xl";

  return (
    <div className="space-y-4">
      {/* ── PRIMARY STATUS CARD ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
        className={cn("relative rounded-[2rem] overflow-hidden transition-all duration-300", cardBase)}
      >
        {/* Ambient shimmer — light only */}
        {isLight && (
          <>
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#cba876]/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[#cba876]/05 blur-2xl pointer-events-none" />
          </>
        )}

        {/* Reschedule Overlay */}
        <AnimatePresence>
          {showReschedule && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={cn(
                "absolute inset-0 z-50 backdrop-blur-2xl p-6 flex flex-col justify-center rounded-[2rem]",
                isLight ? "bg-white/97" : "bg-black/95"
              )}
            >
              {rescheduleSuccess ? (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white">Slot Updated!</h3>
                  <p className="text-zinc-500 text-sm">We've adjusted your time. Drive safely!</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-white">Running Late?</h3>
                      <p className="text-sm text-zinc-500 mt-0.5">Pick a new slot for today</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full h-9 w-9 border",
                        isLight
                          ? "bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600"
                          : "bg-white/10 border-white/10 hover:bg-white/20 text-white"
                      )}
                      onClick={() => setShowReschedule(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {getDummySlots().map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "py-3 px-1 rounded-2xl text-[13px] font-semibold transition-all border",
                          selectedSlot === slot
                            ? isLight
                              ? "bg-[#cba876] text-white border-[#cba876] shadow-md shadow-[#cba876]/30"
                              : "bg-white text-black border-white shadow-md"
                            : isLight
                              ? "bg-[#fdf6ed] border-[#cba876]/20 text-zinc-700 hover:bg-[#cba876]/10 hover:border-[#cba876]/40"
                              : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                        )}
                      >
                        {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </button>
                    ))}
                  </div>

                  <Button
                    className={cn(
                      "w-full font-bold h-13 rounded-2xl text-sm shadow-xl",
                      isLight
                        ? "bg-zinc-900 hover:bg-zinc-800 text-white shadow-zinc-900/20"
                        : "bg-white hover:bg-zinc-100 text-black"
                    )}
                    disabled={!selectedSlot || isRescheduling}
                    onClick={handleConfirmReschedule}
                    haptic="medium"
                  >
                    {isRescheduling ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Confirming...
                      </span>
                    ) : 'Confirm New Time'}
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Card Content ───────────────────────────── */}
        <div className="p-7 pb-6 relative z-10">
          {urgencyState === "APPOINTMENT_TODAY" && displayAction ? (
            <div className="space-y-5">
              {/* Status Badge */}
              <div className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border",
                isLight
                  ? "bg-[#cba876]/12 text-[#8a6d3b] border-[#cba876]/25"
                  : "bg-primary/20 text-primary border-primary/30"
              )}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cba876] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#cba876]" />
                </span>
                Today's Visit
              </div>

              {/* Time & Service */}
              <div>
                <h2 className={cn(
                  "text-5xl font-serif tracking-tight mb-1.5 font-light",
                  isLight ? "text-zinc-900" : "text-white"
                )}>
                  {new Date(displayAction.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h2>
                <p className={cn("font-medium text-sm", isLight ? "text-zinc-500" : "text-zinc-400")}>
                  {displayAction.title}{displayAction.subtitle ? ` · ${displayAction.subtitle}` : ''}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-1">
                <Button
                  className={cn(
                    "flex-1 font-semibold rounded-2xl h-12 text-sm gap-2 shadow-md",
                    isLight
                      ? "bg-zinc-900 hover:bg-zinc-800 text-white shadow-zinc-900/15"
                      : "bg-white hover:bg-zinc-100 text-black"
                  )}
                  haptic="medium"
                  onClick={() => window.open('https://www.google.com/maps?gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgzNDA4ajBqNKgCALACAQ&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KUN-FHYAg887McSa-386Ei1A&daddr=9HQ6%2BWJR,+Sahakar+Maharshi+Keshavrao+Sonawane+Marg,+near+icici+bank,+Mantri+Nagar,+Latur,+Maharashtra+413531', '_blank')}
                >
                  <MapPin className="w-4 h-4" />
                  Directions
                </Button>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 rounded-2xl h-12 text-sm font-medium border",
                    isLight
                      ? "bg-[#fdf6ed] border-[#cba876]/30 text-zinc-700 hover:bg-[#cba876]/10 hover:border-[#cba876]/50"
                      : "bg-white/5 border-white/15 text-white hover:bg-white/10"
                  )}
                  haptic="light"
                  onClick={() => setShowReschedule(true)}
                >
                  <Clock className="w-4 h-4 mr-1.5" />
                  Running Late?
                </Button>
              </div>
            </div>

          ) : urgencyState === "UPCOMING_APPOINTMENT" && displayAction ? (
            <div className="space-y-5">
              <div className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border",
                isLight
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-blue-500/15 text-blue-300 border-blue-500/25"
              )}>
                <Clock className="w-3 h-3" />
                Upcoming
              </div>
              <div>
                <h2 className={cn("text-3xl font-serif tracking-tight mb-1", isLight ? "text-zinc-900" : "text-white")}>
                  {new Date(displayAction.time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </h2>
                <p className={cn("text-sm font-medium", isLight ? "text-zinc-500" : "text-zinc-400")}>
                  {new Date(displayAction.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {displayAction.title ? ` · ${displayAction.title}` : ''}
                </p>
              </div>
              <Button
                className={cn(
                  "w-full font-semibold rounded-2xl h-12 text-sm",
                  isLight
                    ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                    : "bg-white hover:bg-zinc-100 text-black"
                )}
                haptic="medium"
                onClick={() => router.push('/appointments')}
              >
                Manage Appointment <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

          ) : urgencyState === "RETURNING" && predictiveBooking ? (
            <div className="space-y-5">
              <div className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border",
                isLight
                  ? "bg-[#cba876]/12 text-[#8a6d3b] border-[#cba876]/25"
                  : "bg-white/10 text-zinc-200 border-white/20"
              )}>
                <Sparkles className="w-3 h-3 text-[#cba876]" />
                VIP Concierge
              </div>
              <div>
                <h2 className={cn("text-3xl font-serif tracking-tight mb-2", isLight ? "text-zinc-900" : "text-white")}>
                  The Usual?
                </h2>
                <p className={cn("text-sm leading-relaxed max-w-[90%]", isLight ? "text-zinc-500" : "text-zinc-400")}>
                  {predictiveBooking.subtitle}
                </p>
              </div>
              <Button
                className={cn(
                  "w-full font-bold rounded-2xl h-13 text-sm gap-2",
                  isLight
                    ? "bg-[#cba876] hover:bg-[#b8966a] text-white shadow-lg shadow-[#cba876]/30"
                    : "bg-primary hover:bg-primary/90 text-black"
                )}
                haptic="medium"
                onClick={() => { reset(); router.push('/book'); }}
              >
                Book Appointment <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

          ) : (
            /* Default / First-time */
            <div className="space-y-5">
              <div className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border",
                isLight
                  ? "bg-[#cba876]/12 text-[#8a6d3b] border-[#cba876]/25"
                  : "bg-primary/10 text-primary border-primary/20"
              )}>
                <Crown className="w-3 h-3" />
                Welcome
              </div>
              <div>
                <h2 className={cn("text-3xl font-serif tracking-tight mb-2", isLight ? "text-zinc-900" : "text-white")}>
                  Ready for a refresh?
                </h2>
                <p className={cn("text-sm leading-relaxed", isLight ? "text-zinc-500" : "text-zinc-400")}>
                  Discover premium styling tailored just for you.
                </p>
              </div>
              <Button
                className={cn(
                  "w-full font-bold rounded-2xl h-13 text-sm gap-2",
                  isLight
                    ? "bg-zinc-900 hover:bg-zinc-800 text-white shadow-md shadow-zinc-900/10"
                    : "bg-white hover:bg-zinc-100 text-black"
                )}
                haptic="medium"
                onClick={() => { reset(); router.push('/book'); }}
              >
                Book Your First Look <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* ── Loyalty Progress Footer ───────────────────────── */}
        {financials && (
          <div className={cn(
            "mx-5 mb-5 rounded-2xl p-4 flex items-center gap-4",
            isLight
              ? "bg-[#fdf6ed]/80 border border-[#cba876]/15"
              : "bg-white/5 border border-white/8"
          )}>
            {/* Circular Progress Ring */}
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none"
                  strokeWidth="2.5"
                  stroke={isLight ? "#e9d8be" : "#2a2a2a"}
                />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  strokeWidth="2.5"
                  stroke={isLight ? "#cba876" : "#e6c896"}
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <Crown className="absolute inset-0 m-auto w-4 h-4 text-[#cba876]" />
            </div>

            {/* Points Info */}
            <div className="flex-1 min-w-0">
              <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-0.5", isLight ? "text-[#cba876]/70" : "text-[#e6c896]/60")}>
                Reward Points
              </p>
              <p className={cn("text-lg font-bold font-serif tracking-tight leading-tight", isLight ? "text-zinc-900" : "text-white")}>
                {financials.rewardPoints} <span className={cn("text-sm font-normal", isLight ? "text-zinc-400" : "text-zinc-500")}>pts</span>
              </p>
            </div>

            {/* Wallet */}
            <div className="text-right shrink-0">
              <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-0.5", isLight ? "text-zinc-400" : "text-zinc-500")}>
                Wallet
              </p>
              <p className={cn("text-base font-bold tracking-tight", isLight ? "text-zinc-900" : "text-white")}>
                ₹{financials.walletBalance}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

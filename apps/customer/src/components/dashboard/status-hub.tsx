"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Crown, ArrowRight, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingEngine } from "../booking/booking-orchestrator";
import { getFullApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
        const res = await fetch(
          getFullApiUrl(`/api/v1/me/appointments/${displayAction.id}/reschedule`),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              date: selectedDate.toISOString().split('T')[0],
              startTime: selectedDate.toISOString()
            })
          }
        );
        if (!res.ok) throw new Error('Failed to reschedule');
      } else {
        await new Promise(r => setTimeout(r, 800));
      }

      setRescheduleSuccess(true);
      setDisplayAction({ ...displayAction, time: selectedSlot });
      setTimeout(() => {
        setRescheduleSuccess(false);
        setShowReschedule(false);
        setSelectedSlot(null);
      }, 1800);
    } catch {
      toast.error('Failed to reschedule. Please try again.');
    } finally {
      setIsRescheduling(false);
    }
  };

  const getSlots = () => {
    if (!displayAction?.time) return [];
    const base = new Date(displayAction.time);
    return [15, 30, 60].map(m => new Date(base.getTime() + m * 60000).toISOString());
  };

  const points = financials?.rewardPoints || 0;
  const progress = Math.min((points / 1000) * 100, 100);
  const dash = `${progress} 100`;

  return (
    <div className="space-y-3">
      {/* ═══════════════════════════════════════════════════════
          MAIN STATUS CARD
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
        className="relative rounded-[2rem] overflow-hidden
          /* Light: creamy white with gold shadow */
          bg-white border border-stone-200/80
          shadow-[0_4px_32px_rgba(201,169,110,0.14),0_1px_3px_rgba(0,0,0,0.04)]
          /* Dark: near-black with subtle border */
          dark:bg-[#0f0f0f] dark:border-white/8 dark:shadow-none"
      >
        {/* ── Light mode: warm gradient orb top-right ── */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none
            bg-[radial-gradient(circle,rgba(201,169,110,0.18)_0%,transparent_70%)]
            dark:bg-[radial-gradient(circle,rgba(228,194,126,0.08)_0%,transparent_70%)]"
        />
        {/* ── Light mode: warm gradient orb bottom-left ── */}
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none
            bg-[radial-gradient(circle,rgba(201,169,110,0.10)_0%,transparent_70%)]
            dark:opacity-0"
        />

        {/* ── RESCHEDULE OVERLAY ── */}
        <AnimatePresence>
          {showReschedule && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-50 flex flex-col justify-center p-6 rounded-[2rem]
                bg-white/98 backdrop-blur-md
                dark:bg-black/96"
            >
              {rescheduleSuccess ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex flex-col items-center justify-center gap-5 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">Time Updated!</h3>
                    <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">Your appointment has been moved. Drive safe!</p>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">Running Late?</h3>
                      <p className="text-sm text-stone-500 dark:text-zinc-400 mt-0.5">Pick a new time for today</p>
                    </div>
                    <button
                      onClick={() => setShowReschedule(false)}
                      className="w-9 h-9 rounded-full flex items-center justify-center
                        bg-stone-100 border border-stone-200 text-stone-500 hover:bg-stone-200 transition-colors
                        dark:bg-white/8 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/15"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Time slot grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {getSlots().map((slot, i) => {
                      const active = selectedSlot === slot;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedSlot(slot)}
                          className={`
                            py-3.5 rounded-2xl text-[13px] font-semibold border transition-all duration-200
                            ${active
                              ? 'bg-[#c9a96e] border-[#c9a96e] text-white shadow-md shadow-[#c9a96e]/30 dark:bg-[#e4c27e] dark:border-[#e4c27e] dark:text-black dark:shadow-[#e4c27e]/25'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-[#c9a96e]/50 hover:bg-[#c9a96e]/5 dark:bg-white/5 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/25 dark:hover:bg-white/10'
                            }
                          `}
                        >
                          {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </button>
                      );
                    })}
                  </div>

                  {/* Confirm button */}
                  <button
                    disabled={!selectedSlot || isRescheduling}
                    onClick={handleConfirmReschedule}
                    className="w-full h-13 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                      bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]
                      disabled:opacity-40 disabled:pointer-events-none
                      dark:bg-white dark:text-black dark:hover:bg-zinc-100
                      shadow-lg shadow-stone-900/15 dark:shadow-white/10"
                  >
                    {isRescheduling ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Confirming…
                      </>
                    ) : 'Confirm New Time'}
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CARD BODY ── */}
        <div className="relative z-10 p-7 pb-6">

          {/* ──────────────────────── APPOINTMENT TODAY ──────────────── */}
          {urgencyState === "APPOINTMENT_TODAY" && displayAction ? (
            <div className="space-y-5">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border
                bg-[#c9a96e]/10 border-[#c9a96e]/30 text-[#8a6030]
                dark:bg-[#e4c27e]/12 dark:border-[#e4c27e]/25 dark:text-[#e4c27e]
                text-[10px] font-bold uppercase tracking-[0.16em]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9a96e] opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c9a96e]" />
                </span>
                Today's Visit
              </div>

              {/* Time */}
              <div>
                <div className="text-5xl font-serif font-light tracking-tight text-stone-900 dark:text-white leading-none">
                  {new Date(displayAction.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2 font-medium">
                  {displayAction.title}{displayAction.subtitle ? ` · ${displayAction.subtitle}` : ''}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => window.open('https://www.google.com/maps?gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgzNDA4ajBqNKgCALACAQ&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KUN-FHYAg887McSa-386Ei1A&daddr=9HQ6%2BWJR,+Sahakar+Maharshi+Keshavrao+Sonawane+Marg,+near+icici+bank,+Mantri+Nagar,+Latur,+Maharashtra+413531', '_blank')}
                  className="flex-1 h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
                    bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]
                    dark:bg-white dark:text-black dark:hover:bg-zinc-100
                    shadow-md shadow-stone-900/12"
                >
                  <MapPin className="w-4 h-4" /> Directions
                </button>
                <button
                  onClick={() => setShowReschedule(true)}
                  className="flex-1 h-12 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all border
                    bg-[#c9a96e]/8 border-[#c9a96e]/30 text-[#8a6030] hover:bg-[#c9a96e]/15 hover:border-[#c9a96e]/50
                    dark:bg-[#e4c27e]/8 dark:border-[#e4c27e]/20 dark:text-[#e4c27e] dark:hover:bg-[#e4c27e]/15"
                >
                  <Clock className="w-4 h-4" /> Running Late?
                </button>
              </div>
            </div>

          /* ──────────────────────── UPCOMING ───────────────────────── */
          ) : urgencyState === "UPCOMING_APPOINTMENT" && displayAction ? (
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.16em]
                bg-sky-50 border-sky-200 text-sky-700
                dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-400">
                <Clock className="w-3 h-3" /> Upcoming
              </div>
              <div>
                <div className="text-3xl font-serif tracking-tight text-stone-900 dark:text-white">
                  {new Date(displayAction.time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1.5 font-medium">
                  {new Date(displayAction.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {displayAction.title ? ` · ${displayAction.title}` : ''}
                </p>
              </div>
              <button
                onClick={() => router.push('/appointments')}
                className="w-full h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
                  bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]
                  dark:bg-white dark:text-black dark:hover:bg-zinc-100
                  shadow-md shadow-stone-900/12"
              >
                Manage Appointment <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          /* ──────────────────────── VIP RETURNING ──────────────────── */
          ) : urgencyState === "RETURNING" && predictiveBooking ? (
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.16em]
                bg-[#c9a96e]/10 border-[#c9a96e]/28 text-[#8a6030]
                dark:bg-[#e4c27e]/10 dark:border-[#e4c27e]/20 dark:text-[#e4c27e]">
                <Sparkles className="w-3 h-3" /> VIP Concierge
              </div>
              <div>
                <div className="text-3xl font-serif tracking-tight text-stone-900 dark:text-white">The Usual?</div>
                <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1.5 leading-relaxed">{predictiveBooking.subtitle}</p>
              </div>
              <button
                onClick={() => { reset(); router.push('/book'); }}
                className="w-full h-13 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                  bg-gradient-to-r from-[#c9a96e] to-[#b8934a] text-white hover:from-[#b8934a] hover:to-[#a07840] active:scale-[0.98]
                  dark:from-[#e4c27e] dark:to-[#c9a96e] dark:text-black
                  shadow-lg shadow-[#c9a96e]/30"
              >
                Book Appointment <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          /* ──────────────────────── DEFAULT / FIRST TIME ───────────── */
          ) : (
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.16em]
                bg-[#c9a96e]/10 border-[#c9a96e]/28 text-[#8a6030]
                dark:bg-[#e4c27e]/10 dark:border-[#e4c27e]/20 dark:text-[#e4c27e]">
                <Crown className="w-3 h-3" /> Welcome
              </div>
              <div>
                <div className="text-3xl font-serif tracking-tight text-stone-900 dark:text-white">Ready for a refresh?</div>
                <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1.5 leading-relaxed">Discover premium styling tailored just for you.</p>
              </div>
              <button
                onClick={() => { reset(); router.push('/book'); }}
                className="w-full h-13 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                  bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]
                  dark:bg-white dark:text-black dark:hover:bg-zinc-100
                  shadow-md shadow-stone-900/12"
              >
                Book Your First Look <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── LOYALTY FOOTER ── */}
        {financials && (
          <div className="mx-5 mb-5 rounded-2xl px-4 py-3.5 flex items-center gap-4
            bg-stone-50/80 border border-stone-200/60
            dark:bg-white/4 dark:border-white/8">
            {/* Progress ring */}
            <div className="relative w-11 h-11 shrink-0">
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5"
                  stroke="currentColor"
                  className="text-stone-200 dark:text-white/10"
                />
                <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5"
                  stroke="#c9a96e"
                  className="dark:stroke-[#e4c27e]"
                  strokeDasharray={dash}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <Crown className="absolute inset-0 m-auto w-3.5 h-3.5 text-[#c9a96e] dark:text-[#e4c27e]" />
            </div>

            {/* Points */}
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c9a96e]/70 dark:text-[#e4c27e]/60 mb-0.5">
                Reward Points
              </p>
              <p className="text-lg font-bold font-serif tracking-tight text-stone-900 dark:text-white leading-none">
                {financials.rewardPoints}
                <span className="text-xs font-normal text-stone-400 dark:text-zinc-500 ml-1">pts</span>
              </p>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-stone-200 dark:bg-white/10" />

            {/* Wallet */}
            <div className="text-right shrink-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-zinc-500 mb-0.5">
                Wallet
              </p>
              <p className="text-base font-bold tracking-tight text-stone-900 dark:text-white">
                ₹{financials.walletBalance}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCustomerProfile } from "@/components/providers/CustomerProfileContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useHaptics } from "@/hooks/use-haptics";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  RotateCcw,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { OnboardingCard } from "../../components/onboarding/onboarding-card";
import { PremiumLoader } from "../../components/ui/premium-loader";

export default function AppointmentsPage() {
  const { profile, isGuest, isLoading: profileLoading } = useCustomerProfile();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const haptics = useHaptics();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading: isAppointmentsLoading, refetch } = useQuery({
    queryKey: ["customer-appointments"],
    queryFn: async () => {
      try {
        const res = await api.get("/me/appointments");
        // Check if response has a success wrapper or is a direct array
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        return list;
      } catch (e) {
        console.warn("Failed fetching from real endpoint, returning fallbacks:", e);
        return [];
      }
    },
    enabled: !isGuest && !!profile,
  });

  // Cancel Appointment Mutation
  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      return api.post(`/me/appointments/${appointmentId}/cancel`);
    },
    onSuccess: () => {
      haptics.trigger("medium");
      toast.success("Appointment cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["customer-appointments"] });
      refetch();
    },
    onError: (err: any) => {
      haptics.trigger("error");
      toast.error(err.message || "Failed to cancel appointment");
    }
  });

  const handleCancel = (id: string) => {
    haptics.trigger("medium");
    if (confirm("Are you sure you want to cancel this appointment?")) {
      cancelMutation.mutate(id);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-500/20">
            <CheckCircle2 size={11} /> Confirmed
          </span>
        );
      case "PENDING":
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-primary/20">
            <Sparkles size={11} className="animate-pulse" /> Pending
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-500/20">
            <Clock size={11} /> Active
          </span>
        );
      case "COMPLETED":
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-800/40 px-2.5 py-1 rounded-full flex items-center gap-1 border border-zinc-700/30">
            Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-rose-500/20">
            <XCircle size={11} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-800/40 px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  const upcomingStatuses = ["PENDING", "CONFIRMED", "ARRIVED", "IN_PROGRESS"];
  
  const upcomingAppointments = appointments.filter((app: any) => 
    upcomingStatuses.includes(app.status)
  );
  
  const pastAppointments = appointments.filter((app: any) => 
    !upcomingStatuses.includes(app.status)
  );

  const displayedAppointments = activeTab === "upcoming" ? upcomingAppointments : pastAppointments;
  const showLoading = profileLoading || (isAppointmentsLoading && !isGuest);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black pb-32">
      {/* Onboarding Dialog */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingCard onClose={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="px-6 pt-12 pb-6 bg-gradient-to-b from-zinc-950 to-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary font-serif font-medium">Your Schedule</span>
          </div>
          <h1 className="text-3xl font-serif font-semibold tracking-tight text-white mb-1">
            Appointments
          </h1>
          <p className="text-zinc-400 text-sm font-light">
            View details, schedule adjustments, and history of your salon treatments.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="bg-zinc-900/60 border border-zinc-800/50 p-1 rounded-2xl flex">
          <button
            onClick={() => {
              haptics.trigger("light");
              setActiveTab("upcoming");
            }}
            className={cn(
              "flex-1 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all",
              activeTab === "upcoming"
                ? "bg-primary text-black font-bold shadow-md shadow-primary/5"
                : "text-zinc-400 hover:text-white"
            )}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => {
              haptics.trigger("light");
              setActiveTab("past");
            }}
            className={cn(
              "flex-1 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all",
              activeTab === "past"
                ? "bg-primary text-black font-bold shadow-md shadow-primary/5"
                : "text-zinc-400 hover:text-white"
            )}
          >
            History ({pastAppointments.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 space-y-4">
        {showLoading ? (
          <div className="flex items-center justify-center h-64">
            <PremiumLoader text="Loading your appointments..." />
          </div>
        ) : isGuest ? (
          // Guest User State
          <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-950/40 border border-zinc-900/60 rounded-3xl p-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Calendar className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-serif font-medium text-white mb-2">Login to View Bookings</h3>
            <p className="text-zinc-400 text-xs font-light max-w-xs mb-8 leading-relaxed">
              Create an account or login to access your scheduled salon appointments, active perks, and check-in history.
            </p>
            <Button
              onClick={() => {
                haptics.trigger("medium");
                setShowOnboarding(true);
              }}
              className="bg-primary hover:bg-primary/95 text-black font-semibold rounded-xl gap-2 w-full max-w-[240px] h-12 text-sm shadow-lg shadow-primary/10"
            >
              <UserPlus size={16} />
              <span>Verify & Continue</span>
            </Button>
          </div>
        ) : displayedAppointments.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-950/40 border border-zinc-900/60 rounded-3xl p-6">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900/60 flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6 text-zinc-500" />
            </div>
            <h3 className="text-lg font-serif font-medium text-white mb-1.5">No Appointments Found</h3>
            <p className="text-zinc-500 text-xs font-light max-w-xs mb-8">
              {activeTab === "upcoming" 
                ? "You don't have any treatments booked. Let's arrange a luxury slot today!" 
                : "You don't have any past appointment history registered."}
            </p>
            {activeTab === "upcoming" && (
              <Link href="/book" className="w-full">
                <Button
                  onClick={() => haptics.trigger("medium")}
                  className="w-full bg-primary hover:bg-primary/95 text-black font-semibold rounded-xl h-12 text-sm shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
                >
                  Book an Appointment
                </Button>
              </Link>
            )}
          </div>
        ) : (
          // Appointments list
          displayedAppointments.map((app: any) => {
            // Sum prices from items
            const total = app.items?.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0) || 0;
            const primaryItem = app.items?.[0];
            const startTimeStr = primaryItem?.startTime || app.createdAt;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-950/80 border border-zinc-900/80 rounded-3xl p-6 relative overflow-hidden"
              >
                {/* Accent line based on status */}
                <div 
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    app.status === "CONFIRMED" ? "bg-emerald-400" : 
                    app.status === "PENDING" ? "bg-primary" : "bg-zinc-800"
                  )} 
                />

                {/* Status + Date */}
                <div className="flex items-start justify-between mb-4 pl-1">
                  <div>
                    <h3 className="font-serif font-semibold text-lg text-white">
                      {formatDate(app.date || startTimeStr)}
                    </h3>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-light mt-1">
                      <Clock size={13} className="text-primary/70" />
                      <span>{formatTime(startTimeStr)}</span>
                    </div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                {/* Items List */}
                <div className="space-y-3 pl-1 mb-5 border-t border-zinc-900/60 pt-4">
                  {app.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div>
                        <p className="font-medium text-zinc-200">{item.service?.name}</p>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">
                          Duration: {item.service?.durationMinutes || 45} mins
                        </p>
                      </div>
                      <p className="font-medium text-white">₹{Number(item.price).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>

                {/* Branch Info */}
                {app.branch && (
                  <div className="flex items-center gap-2 pl-1 mb-5 text-xs text-zinc-400 font-light">
                    <MapPin size={13} className="text-primary/70 shrink-0" />
                    <span className="line-clamp-1">{app.branch.name} • {app.branch.address || "Main Salon HQ"}</span>
                  </div>
                )}

                {/* Footer details & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-900/60 pl-1">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block">Total Bill</span>
                    <span className="text-white font-serif font-bold text-base mt-0.5 block">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Cancel button only for PENDING/CONFIRMED upcoming appts */}
                  {activeTab === "upcoming" && ["PENDING", "CONFIRMED"].includes(app.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(app.id)}
                      disabled={cancelMutation.isPending}
                      className="border-rose-950/60 hover:bg-rose-950/20 text-rose-400 rounded-xl px-4 text-xs h-9 font-semibold"
                    >
                      {cancelMutation.isPending && cancelMutation.variables === app.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
                      ) : (
                        "Cancel"
                      )}
                    </Button>
                  )}

                  {/* Rebook option for past/cancelled ones */}
                  {activeTab === "past" && (
                    <Link href="/book">
                      <Button
                        onClick={() => haptics.trigger("light")}
                        variant="ghost"
                        className="text-primary hover:bg-primary/5 rounded-xl gap-1 text-xs h-9 font-semibold hover:text-primary pr-2"
                      >
                        <span>Rebook</span>
                        <RotateCcw size={12} />
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

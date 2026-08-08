"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookingEngine } from "@/components/booking/booking-orchestrator";
import { useHaptics } from "@/hooks/use-haptics";
import { PremiumLoader } from "@/components/ui/premium-loader";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle2, Clock, Sparkles, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function BookPage() {
  const { state, selectService, deselectService, goToDimension } = useBookingEngine();
  const haptics = useHaptics();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const searchParams = useSearchParams();
  const inspirationId = searchParams.get("inspirationId");
  const skipToTime = searchParams.get("skipToTime");
  const serviceIdParam = searchParams.get("serviceId");
  const { setInspiration } = useBookingEngine();

  // Fetch inspiration details if ID is present
  const { data: inspirationRes } = useQuery({
    queryKey: ["inspiration-post", inspirationId],
    queryFn: async () => {
      if (!inspirationId) return null;
      const res = await api.get(`/public/inspiration/${inspirationId}`);
      return res.data;
    },
    enabled: !!inspirationId
  });

  const inspirationPost = inspirationRes?.data;

  // Sync with context
  useEffect(() => {
    if (inspirationPost) {
      const media = inspirationPost.heroMedia?.url || inspirationPost.heroMedia?.key;
      setInspiration(inspirationPost.id, media);
    }
  }, [inspirationPost, setInspiration]);

  const { data: response, isLoading } = useQuery({
    queryKey: ["public-services"],
    queryFn: async () => {
      try {
        const res = await api.get("/public/services");
        return res.data || [];
      } catch (e) {
        // Fallback fallback data for luxury demo experience if API is not fully running locally
        return [
          { id: "srv_1", name: "Signature Haircut", description: "Tailored haircut, wash, conditioning, and professional blow dry styling.", durationMinutes: 45, basePrice: 800, category: "Hair" },
          { id: "srv_2", name: "Beard Sculpting", description: "Precision trimming, hot towel therapy, razor lining, and signature oil finish.", durationMinutes: 30, basePrice: 400, category: "Grooming" },
          { id: "srv_3", name: "Premium Balayage", description: "Custom hand-painted French highlighting technique for natural, sun-kissed color.", durationMinutes: 120, basePrice: 4500, category: "Color" },
          { id: "srv_4", name: "Deep Tissue Massage", description: "Therapeutic massage targeting deep muscle layers to release persistent tension.", durationMinutes: 60, basePrice: 1500, category: "Spa" },
          { id: "srv_5", name: "Luxury Charcoal Facial", description: "Deep cleansing facial treatment with activated charcoal mask and face massage.", durationMinutes: 50, basePrice: 1200, category: "Skin" },
          { id: "srv_6", name: "Global Hair Coloring", description: "Even root-to-tip high-quality permanent color application with gloss finish.", durationMinutes: 90, basePrice: 2800, category: "Color" },
        ];
      }
    },
  });

  const services = Array.isArray(response) ? response : (response?.data || []);

  const hasSkipped = useRef(false);

  // Handle skipToTime
  useEffect(() => {
    if (skipToTime === 'true' && !isLoading && !hasSkipped.current) {
      if (serviceIdParam) {
        if (!state.serviceIds.includes(serviceIdParam)) {
          selectService(serviceIdParam);
        }
      } else if (state.serviceIds.length === 0 && services.length > 0) {
        // If no service is provided, and none selected, auto-select a default one so they can pick a time
        selectService(services[0].id);
      }
      
      hasSkipped.current = true;
      // Add a slight delay to ensure state updates smoothly before transition
      const timer = setTimeout(() => {
        if (state.currentDimension !== 'TIME') {
          goToDimension('TIME');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [skipToTime, serviceIdParam, state.serviceIds, state.currentDimension, selectService, goToDimension, isLoading, services]);



  const toggleService = (id: string) => {
    haptics.trigger("light");
    if (state.serviceIds.includes(id)) {
      deselectService(id);
    } else {
      selectService(id);
    }
  };

  const getCategory = (service: any) => {
    return service.serviceCategory?.name || service.category || "Other";
  };

  // Get unique categories list
  const categories = ["All", ...Array.from(new Set(services.map((s: any) => getCategory(s))))] as string[];

  // Filter services by search, selected category and gender keywords
  const filteredServices = services.filter((service: any) => {
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) || 
                          (service.description && service.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || getCategory(service) === selectedCategory;

    let matchesGender = true;
    if (selectedGender === "Men") {
      const name = service.name.toLowerCase();
      const hasMenKeyword = name.includes("men") || name.includes("beard") || name.includes("shave") || name.includes("grooming") || name.includes("boy");
      const hasWomenKeyword = name.includes("women") || name.includes("girl") || name.includes("bridal") || name.includes("lady") || name.includes("ladies");
      if (hasWomenKeyword && !hasMenKeyword) {
        matchesGender = false;
      }
    } else if (selectedGender === "Women") {
      const name = service.name.toLowerCase();
      const hasWomenKeyword = name.includes("women") || name.includes("girl") || name.includes("bridal") || name.includes("lady") || name.includes("ladies") || name.includes("waxing");
      const hasMenKeyword = name.includes("men") || name.includes("beard") || name.includes("shave");
      if (hasMenKeyword && !hasWomenKeyword) {
        matchesGender = false;
      }
    }

    return matchesSearch && matchesCategory && matchesGender;
  });

  const hasSelection = state.serviceIds.length > 0;
  
  const totalPrice = state.serviceIds.reduce((acc, id) => {
    const s = services.find((srv: any) => srv.id === id);
    return acc + (s ? Number(s.basePrice) : 0);
  }, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black pb-32">
      {/* Header Banner */}
      <div className="px-6 pt-12 pb-4 bg-gradient-to-b from-zinc-950 to-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        {/* Premium Inspired By Banner */}
        <AnimatePresence>
          {inspirationPost && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-20 mb-6 flex items-center gap-4 bg-zinc-900/60 border border-primary/20 p-3 rounded-2xl backdrop-blur-md"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10 shadow-lg relative">
                {(inspirationPost.heroMedia?.url || inspirationPost.heroMedia?.key) ? (
                  <img src={inspirationPost.heroMedia.url || inspirationPost.heroMedia.key} alt="Inspiration" className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-1">Inspired By</p>
                <h3 className="text-white font-serif text-sm line-clamp-1">{inspirationPost.title}</h3>
                <p className="text-zinc-400 text-xs mt-0.5 line-clamp-1">{inspirationPost.description || "Let's bring this look to life."}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-primary font-serif font-medium">Anex Experience</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-white mb-2">
            Our Services
          </h1>
          <p className="text-zinc-400 text-sm max-w-sm font-light">
            Select one or more services to curate your personalized premium pampering session.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 pb-4 bg-black flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hair, spa, facials..."
            className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
          />
        </div>

        {/* Gender Selection Tabs */}
        <div className="flex bg-zinc-900/40 p-1 rounded-2xl border border-zinc-800/50">
          {["All", "Men", "Women"].map((g) => {
            const isActive = selectedGender === g;
            return (
              <button
                key={g}
                onClick={() => {
                  haptics.trigger("light");
                  setSelectedGender(g);
                }}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all",
                  isActive
                    ? "bg-primary text-black font-bold shadow-md"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Horizontal Categories Filter */}
      <div className="px-6 pb-6 bg-black">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex gap-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => {
                    haptics.trigger("light");
                    setSelectedCategory(category);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all border whitespace-nowrap",
                    isActive
                      ? "bg-primary border-primary text-black font-semibold shadow-md shadow-primary/10"
                      : "bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Grid/List */}
      <div className="flex-1 px-6 space-y-4 bg-black">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <PremiumLoader text="Loading services..." />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Filter className="w-12 h-12 text-zinc-700 mb-4" />
            <h3 className="text-lg font-medium text-zinc-300">No services found</h3>
            <p className="text-zinc-500 text-sm max-w-xs mt-1">
              Try adjusting your filters or search query to find your desired service.
            </p>
          </div>
        ) : (
          filteredServices.map((service: any) => {
            const isSelected = state.serviceIds.includes(service.id);
            return (
              <motion.div
                key={service.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleService(service.id)}
                className={cn(
                  "p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between overflow-hidden",
                  isSelected
                    ? "bg-primary/5 border-primary/80 shadow-lg shadow-primary/5"
                    : "bg-zinc-950/80 border-zinc-900/60 hover:border-zinc-800"
                )}
              >
                {/* Selected Backdrop Glow */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                )}

                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-primary font-serif font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                      {getCategory(service)}
                    </span>
                    <h3 className="font-serif font-semibold text-lg text-white mt-1.5 leading-snug">
                      {service.name}
                    </h3>
                  </div>
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center transition-colors shrink-0",
                      isSelected
                        ? "border-primary bg-primary text-black"
                        : "border-zinc-700 bg-transparent text-transparent"
                    )}
                  >
                    {isSelected && <CheckCircle2 size={16} strokeWidth={3} />}
                  </div>
                </div>

                {service.description && (
                  <p className="text-xs text-zinc-400 font-light line-clamp-2 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-900/40">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-light">
                    <Clock size={13} className="text-primary/70" />
                    <span>{service.durationMinutes} mins</span>
                  </div>
                  <div className="text-white font-serif font-semibold text-base">
                    ₹{Number(service.basePrice).toLocaleString("en-IN")}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Luxury Sticky Book Bar */}
      <AnimatePresence>
        {hasSelection && (
          <div 
            className="fixed bottom-[110px] md:bottom-[120px] left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-[26rem] pointer-events-none" 
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="pointer-events-auto"
            >
              <div className="bg-zinc-950/90 border border-primary/30 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-black/80">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold">Selected</p>
                  <h4 className="text-white font-serif font-semibold text-base">
                    {state.serviceIds.length} Treatment{state.serviceIds.length > 1 ? "s" : ""}
                  </h4>
                  <p className="text-primary font-semibold text-xs mt-0.5">
                    Total: ₹{totalPrice.toLocaleString("en-IN")}
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/95 text-black font-semibold rounded-xl gap-1 px-5 shadow-lg shadow-primary/10 h-12 text-sm"
                  onClick={() => {
                    haptics.trigger("medium");
                    goToDimension("TIME");
                  }}
                >
                  <span>Choose Slot</span>
                  <ChevronRight size={16} strokeWidth={2.5} />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

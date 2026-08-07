"use client";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { Sparkles, Clock, Compass, Handshake, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBookingEngine } from "../booking/booking-orchestrator";

interface HeroCardProps {
  urgencyState: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  urgentAction?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  predictiveBooking?: any;
}

export function HeroCard({ urgencyState, urgentAction, predictiveBooking }: HeroCardProps) {
  const router = useRouter();
  const { goToDimension, loadPrediction, reset } = useBookingEngine();

  // Appointment Today
  if (urgencyState === "APPOINTMENT_TODAY" && urgentAction) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card glass className="relative overflow-hidden bg-gradient-to-br from-primary/20 to-background border-primary/30">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Clock className="w-5 h-5" />
              {new Date(urgentAction.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </CardTitle>
            <CardDescription className="text-foreground/80 font-medium mt-1">
              {urgentAction.title} {urgentAction.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button className="flex-1 shadow-xl shadow-primary/20" haptic="medium">
              <MapPin className="w-4 h-4 mr-2" /> Directions
            </Button>
            <Button variant="outline" className="flex-1 border-white/20 bg-background/50" haptic="medium">
              Running Late?
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Returning Customer (The Usual)
  if (urgencyState === "RETURNING" && predictiveBooking) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card glass className="relative overflow-hidden bg-gradient-to-br from-secondary/50 to-background border-white/10 dark:border-white/5">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/50 blur-3xl rounded-full" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-primary" />
              The Usual?
            </CardTitle>
            <CardDescription className="mt-1">
              {predictiveBooking.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full text-lg h-14 shadow-lg shadow-primary/10" 
              haptic="medium"
              onClick={() => {
                reset();
                router.push('/book');
              }}
            >
              Book Appointment
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Inactive Customer (Re-engagement)
  if (urgencyState === "INACTIVE") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card glass className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-primary" />
              Time for a refresh
            </CardTitle>
            <CardDescription className="mt-1">
              Tap to claim a complimentary wash with your next cut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full shadow-lg shadow-primary/20" 
              haptic="success"
              onClick={() => {
                reset();
                router.push('/book');
              }}
            >
              Claim Offer & Book
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // First Time
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card glass className="relative overflow-hidden bg-gradient-to-br from-primary/30 via-background to-background border-primary/20">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Compass className="w-6 h-6 text-primary" />
            Start Your Journey
          </CardTitle>
          <CardDescription className="mt-2 text-base">
            Discover premium styling tailored just for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full text-lg h-14 shadow-xl shadow-primary/20" 
            haptic="medium"
            onClick={() => {
              reset();
              router.push('/book');
            }}
          >
            Book Your First Look
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

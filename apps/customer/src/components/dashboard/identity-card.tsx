"use client";

import { motion } from "framer-motion";
import { QrCode, Crown, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface IdentityCardProps {
  financials: {
    walletBalance: number;
    rewardPoints: number;
    nextTier: string;
    pointsToNextTier: number;
  };
}

export function IdentityCard({ financials }: IdentityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card glass className="bg-black text-white border-white/10 relative overflow-hidden">
        {/* Holographic effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 opacity-50" />
        
        <CardContent className="p-6 relative z-10 flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-1">ANEX Digital Card</p>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="font-medium">VIP Member</span>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="rounded-full w-10 h-10 bg-white/5 hover:bg-white/10 text-white" haptic="light">
              <QrCode className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-xs text-white/50">Wallet Balance</p>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-white/70" />
                <span className="text-xl font-bold tracking-tight">₹{financials.walletBalance}</span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <p className="text-xs text-white/50">Reward Points</p>
              <div className="flex items-center justify-end gap-1">
                <span className="text-xl font-bold tracking-tight text-primary">{financials.rewardPoints}</span>
                <span className="text-xs text-primary/70 uppercase">pts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

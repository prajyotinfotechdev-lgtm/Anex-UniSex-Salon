"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Recommendation {
  type: string;
  title: string;
  subtitle: string;
  actionId: string;
}

interface ContextualRecommendationsProps {
  recommendations: Recommendation[];
}

export function ContextualRecommendations({ recommendations }: ContextualRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold tracking-tight px-2">Just For You</h3>
      <div className="grid gap-3 px-2">
        {recommendations.map((rec, i) => (
          <Card key={i} className="border-white/5 bg-secondary/20 hover:bg-secondary/30 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {rec.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{rec.subtitle}</p>
              </div>
              <Button size="sm" variant="secondary" className="h-8 rounded-lg text-xs" haptic="light">
                Add
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

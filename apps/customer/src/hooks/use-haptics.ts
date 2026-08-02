"use client";

import { useCallback } from "react";

type HapticStyle = "light" | "medium" | "heavy" | "success" | "error" | "none";

export function useHaptics() {
  const trigger = useCallback((style: HapticStyle = "light") => {
    if (typeof window === "undefined" || !navigator.vibrate || style === "none") {
      return;
    }

    try {
      switch (style) {
        case "light":
          navigator.vibrate(10);
          break;
        case "medium":
          navigator.vibrate(20);
          break;
        case "heavy":
          navigator.vibrate(40);
          break;
        case "success":
          navigator.vibrate([10, 50, 20]);
          break;
        case "error":
          navigator.vibrate([20, 50, 20, 50, 40]);
          break;
      }
    } catch {
      // Ignore vibration errors securely
    }
  }, []);

  return { trigger };
}

"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-background/20 backdrop-blur-lg border border-white/10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] text-foreground hover:bg-background/30",
      },
      size: {
        default: "h-14 px-6 py-2",
        sm: "h-10 rounded-xl px-4 text-xs",
        lg: "h-16 rounded-2xl px-8 text-base",
        icon: "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onAnimationStart" | "onDragStart" | "onDragEnd">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  haptic?: "light" | "medium" | "heavy" | "success" | "error" | "none";
}

const MotionButton = motion.button;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, haptic = "light", ...props }, ref) => {
    const { trigger } = useHaptics();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      trigger(haptic);
      if (onClick) onClick(e);
    };

    // If asChild is true, we can't easily wrap with framer-motion without a custom component wrapper.
    // For simplicity in a native-feel PWA, standard buttons get the spring physics.
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref as React.Ref<HTMLElement>}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={handleClick as any}
          {...props}
        />
      );
    }

    return (
      <MotionButton
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick={handleClick as any}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(props as any)}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mediaQuery.matches);
    onChange();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    }

    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, []);

  return (
    <motion.div
      className={cn(className)}
      initial={
        reducedMotion
          ? false
          : { opacity: 0, y: 14, filter: "blur(8px)" }
      }
      whileInView={
        reducedMotion
          ? undefined
          : { opacity: 1, y: 0, filter: "blur(0px)" }
      }
      viewport={{ once: true, amount: 0.25 }}
      transition={
        reducedMotion
          ? undefined
          : { duration: 0.65, ease: "easeOut", delay }
      }
    >
      {children}
    </motion.div>
  );
}

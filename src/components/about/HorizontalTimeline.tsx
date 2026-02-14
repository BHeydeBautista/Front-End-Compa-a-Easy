"use client";

import * as React from "react";
import { animate, motion, useMotionValue, useMotionValueEvent } from "motion/react";
import { cn } from "@/lib/utils";

export type TimelineItem = {
  year: string;
  title: string;
  points: string[];
};

export function HorizontalTimeline({
  items,
  className,
  defaultIndex = 0,
  autoplay = true,
  intervalMs = 12000,
}: {
  items: TimelineItem[];
  className?: string;
  defaultIndex?: number;
  autoplay?: boolean;
  intervalMs?: number;
}) {
  const [activeIndex, setActiveIndex] = React.useState(() =>
    Math.max(0, Math.min(items.length - 1, defaultIndex))
  );
  const activeIndexRef = React.useRef(activeIndex);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  const segment = useMotionValue(0);
  const [fillPct, setFillPct] = React.useState(0);
  const animationRef = React.useRef<ReturnType<typeof animate> | null>(null);

  React.useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  React.useEffect(() => {
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

  const stopAnimation = React.useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);

  const startAutoplay = React.useCallback(
    (startIndex: number) => {
      stopAnimation();
      if (!autoplay) return;
      if (reducedMotion) return;
      if (items.length <= 1) return;

      setActiveIndex(Math.max(0, Math.min(items.length - 1, startIndex)));
      segment.set(0);

      const durationSec = Math.max(3, intervalMs) / 1000;
      animationRef.current = animate(segment, 1, {
        duration: durationSec,
        ease: "linear",
        onComplete: () => {
          const isLast = startIndex >= items.length - 1;
          const nextIndex = isLast ? 0 : startIndex + 1;
          startAutoplay(nextIndex);
        },
      });
    },
    [autoplay, intervalMs, items.length, reducedMotion, segment, stopAnimation]
  );

  React.useEffect(() => {
    startAutoplay(activeIndex);
    return () => stopAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reducedMotion, items.length, intervalMs]);

  useMotionValueEvent(segment, "change", (v) => {
    if (items.length <= 1) {
      setFillPct(0);
      return;
    }

    const t = Math.max(0, Math.min(1, v));
    const denom = items.length - 1;
    const pct = ((activeIndexRef.current + t) / denom) * 100;
    setFillPct(Math.max(0, Math.min(100, pct)));
  });

  const onSelect = React.useCallback(
    (idx: number) => {
      const safe = Math.max(0, Math.min(items.length - 1, idx));
      stopAnimation();
      setActiveIndex(safe);
      segment.set(0);

      if (!reducedMotion && autoplay) {
        startAutoplay(safe);
      }
    },
    [autoplay, items.length, reducedMotion, segment, startAutoplay, stopAnimation]
  );

  const active = items[activeIndex];
  const visualFill = reducedMotion
    ? items.length <= 1
      ? 0
      : (activeIndex / (items.length - 1)) * 100
    : fillPct;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="rounded-2xl border border-foreground/10 bg-background p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-foreground">Línea de tiempo</p>
          <p className="text-xs font-semibold text-foreground/60">2023–2026</p>
        </div>

        <div className="mt-5">
          <div className="relative">
            <div className="h-2 w-full rounded-full bg-foreground/10" aria-hidden="true" />
            <motion.div
              className="absolute left-0 top-0 h-2 rounded-full bg-foreground/30"
              style={{ width: `${visualFill}%` }}
              transition={reducedMotion ? undefined : { duration: 0.6, ease: "easeOut" }}
              aria-hidden="true"
            />

            <div className="absolute inset-0 flex items-center justify-between">
              {items.map((item, idx) => {
                const isActive = idx === activeIndex;
                const isLit = idx < activeIndex || (idx === activeIndex && !reducedMotion);

                return (
                  <button
                    key={item.year}
                    type="button"
                    onClick={() => onSelect(idx)}
                    className={cn(
                      "group relative -m-2 rounded-full p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                    )}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span className="relative block">
                      <span
                        className={cn(
                          "block h-4 w-4 rounded-full border border-foreground/20 bg-background transition-transform duration-300 group-hover:scale-110",
                          isLit ? "bg-foreground/15" : "bg-background"
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          "pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/15 blur-xl opacity-0 transition-opacity duration-300",
                          isActive ? "opacity-100" : "group-hover:opacity-70"
                        )}
                        aria-hidden="true"
                      />
                    </span>

                    <span className="sr-only">
                      {item.year}: {item.title}
                    </span>

                    <span
                      className={cn(
                        "pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold transition-colors",
                        isActive ? "text-foreground" : "text-foreground/60"
                      )}
                      aria-hidden="true"
                    >
                      {item.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        key={active?.year}
        className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6"
        initial={reducedMotion ? false : { opacity: 0, y: 8, filter: "blur(6px)" }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={reducedMotion ? undefined : { duration: 0.45, ease: "easeOut" }}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-sm font-semibold text-foreground">{active?.year}</p>
          <p className="text-sm font-semibold text-foreground/80">{active?.title}</p>
        </div>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/70">
          {active?.points.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <button
              key={item.year}
              type="button"
              onClick={() => onSelect(idx)}
              className={cn(
                "rounded-full border border-foreground/10 bg-background px-3 py-1 text-xs font-semibold text-foreground/70 transition-colors hover:text-foreground",
                idx === activeIndex ? "bg-foreground/5 text-foreground" : ""
              )}
            >
              {item.year}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import * as React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LogoImage } from "@/components/about/LogoImage";

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mediaQuery.matches);
    onChange();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    }

    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, []);

  return reduced;
}

export function DivisionPanel({
  name,
  previousName,
  crestSrc,
  previousLogoSrc,
  description,
  functionsTitle = "Funciones principales",
  functions,
  accent = "plain",
  className,
}: {
  name: string;
  previousName: string;
  crestSrc: string;
  previousLogoSrc: string;
  description: string;
  functionsTitle?: string;
  functions: string[];
  accent?: "plain" | "soft";
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "p-6 sm:p-8",
        accent === "soft" ? "bg-foreground/5" : "bg-background",
        className
      )}
      initial={reducedMotion ? false : { opacity: 0, y: 14, filter: "blur(10px)" }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={reducedMotion ? undefined : { duration: 0.65, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="mt-1 text-xs font-semibold text-foreground/60">Antes: {previousName} (Cerberus)</p>
        </div>

        <motion.div
          className="relative"
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, -4, 0],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <div className="pointer-events-none absolute -inset-7 rounded-full bg-foreground/10 blur-2xl" aria-hidden="true" />
          <div className="relative h-24 w-24 sm:h-28 sm:w-28">
            <Image
              src={crestSrc}
              alt={`Logo de ${name}`}
              fill
              sizes="112px"
              className="object-contain"
              priority={false}
            />
          </div>
        </motion.div>
      </div>

      <div className="mt-6 rounded-2xl border border-foreground/10 bg-background/60 p-5">
        <div className="grid min-w-0 grid-cols-1 items-center gap-4 overflow-hidden sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="flex min-w-0 items-center justify-center">
            <LogoImage
              src={previousLogoSrc}
              alt={`Logo ${previousName} (Cerberus)`}
              variant="wide"
              className="max-w-full"
            />
          </div>

          <div className="flex items-center justify-center">
            <motion.div
              className="relative"
              animate={reducedMotion ? undefined : { opacity: [0.6, 1, 0.6] }}
              transition={reducedMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="pointer-events-none absolute inset-0 rounded-full bg-foreground/15 blur-xl" aria-hidden="true" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 text-sm font-semibold text-foreground">
                →
              </div>
            </motion.div>
          </div>

          <div className="flex min-w-0 items-center justify-center">
            <LogoImage
              src={crestSrc}
              alt={`Logo ${name} (Easy)`}
              variant="wide"
              className="max-w-full"
            />
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm leading-7 text-foreground/70">{description}</p>

      <p className="mt-5 text-xs font-semibold text-foreground/80">{functionsTitle}</p>
      <ul className="mt-3 grid gap-x-8 gap-y-2 text-sm leading-7 text-foreground/70 sm:grid-cols-2">
        {functions.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" aria-hidden="true" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

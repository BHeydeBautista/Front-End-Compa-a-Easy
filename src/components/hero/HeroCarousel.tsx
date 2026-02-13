"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FancyText } from "@/components/ui/fancy-text";
import ThreeDCard from "@/components/ui/three-d-card";
import Image from "next/image";

export function HeroCarousel() {
  const heroVideoSrc = process.env.NEXT_PUBLIC_HERO_VIDEO_SRC ?? "/video/trailer.mp4";
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
    <section
      id="inicio"
      className="relative overflow-hidden"
      aria-label="Presentación"
    >
      <div className="relative">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={heroVideoSrc}
          autoPlay={!reducedMotion}
          muted
          loop={!reducedMotion}
          playsInline
          preload="metadata"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/75 via-background/35 to-background/80"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl items-center justify-center px-4 sm:px-6">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.7, ease: "easeOut" }}
          >
            <div className="mx-auto mb-6 w-fit">
              <ThreeDCard
                className="rounded-3xl"
                variant="bare"
                maxRotation={10}
                glowOpacity={0.9}
                parallaxOffset={26}
                enableParallax={!reducedMotion}
                enableGlow={!reducedMotion}
                enableTilt={!reducedMotion}
              >
                <Image
                  src="/brand/logo2.png"
                  alt="Escudo de Compañía Easy"
                  width={240}
                  height={240}
                  priority
                  className="h-28 w-28 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:h-36 sm:w-36"
                />
              </ThreeDCard>
            </div>

            <div className="relative text-balance">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-20 w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/10 blur-3xl sm:h-28 sm:w-[34rem]"
                aria-hidden="true"
              />
              {reducedMotion ? (
                <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
                  Compañía Easy
                </h1>
              ) : (
                <FancyText
                  className="whitespace-nowrap text-5xl font-extrabold leading-none tracking-tight text-foreground/10 sm:text-7xl"
                  fillClassName="text-foreground"
                  stagger={0.06}
                  duration={1.1}
                >
                  Compañía Easy
                </FancyText>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

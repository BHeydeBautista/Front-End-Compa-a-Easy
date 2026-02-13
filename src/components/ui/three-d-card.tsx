"use client";

import React, { useCallback, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ThreeDCardProps {
  children: ReactNode;
  className?: string;
  variant?: "framed" | "bare";
  maxRotation?: number;
  glowOpacity?: number;
  parallaxOffset?: number;
  transitionDuration?: string;
  backgroundImage?: string | null;
  enableGlow?: boolean;
  enableParallax?: boolean;
  enableTilt?: boolean;
}

export default function ThreeDCard({
  children,
  className = "",
  variant = "framed",
  maxRotation = 10,
  glowOpacity = 0.2,
  parallaxOffset = 40,
  transitionDuration = "0.6s",
  backgroundImage = null,
  enableGlow = true,
  enableParallax = true,
  enableTilt = true,
}: ThreeDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    glowX: 50,
    glowY: 50,
    isHovered: false,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enableTilt) return;
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const { width, height, left, top } = rect;

      const mouseX = e.clientX - left;
      const mouseY = e.clientY - top;

      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;

      const newRotateX = yPct * -1 * maxRotation;
      const newRotateY = xPct * maxRotation;

      setTransform((prev) => ({
        ...prev,
        rotateX: newRotateX,
        rotateY: newRotateY,
        glowX: (mouseX / width) * 100,
        glowY: (mouseY / height) * 100,
      }));
    },
    [enableTilt, maxRotation],
  );

  const handleMouseEnter = useCallback(() => {
    setTransform((prev) => ({ ...prev, isHovered: true }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform({
      rotateX: 0,
      rotateY: 0,
      glowX: 50,
      glowY: 50,
      isHovered: false,
    });
  }, []);

  const cardStyle: CSSProperties = useMemo(
    () => ({
      transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale3d(1, 1, 1)`,
      transition: `transform ${transitionDuration} cubic-bezier(0.23, 1, 0.32, 1)`,
      transformStyle: "preserve-3d",
      willChange: "transform",
    }),
    [transform.rotateX, transform.rotateY, transitionDuration],
  );

  const backgroundStyle: CSSProperties = useMemo(() => {
    if (!backgroundImage) return {};
    return {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: transform.isHovered ? 1 : 0,
      transition: "opacity 0.5s ease-in-out",
    };
  }, [backgroundImage, transform.isHovered]);

  const contentStyle: CSSProperties = useMemo(() => {
    if (!enableParallax) return {};
    return {
      transform: `translateZ(${parallaxOffset}px)`,
      transformStyle: "preserve-3d",
    };
  }, [enableParallax, parallaxOffset]);

  return (
    <div style={{ perspective: "1000px" }} className={className}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={cardStyle}
        className={cn(
          variant === "bare"
            ? "relative overflow-visible rounded-3xl"
            : "relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/25 backdrop-blur",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
        )}
        role="img"
        tabIndex={0}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {backgroundImage ? (
          <div className="absolute inset-0 rounded-2xl" style={backgroundStyle} aria-hidden="true" />
        ) : null}

        {variant === "bare" ? null : (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl border border-foreground/10"
            aria-hidden="true"
          />
        )}

        {enableGlow ? (
          <div
            className="pointer-events-none absolute inset-0 z-0 rounded-2xl transition-opacity duration-500"
            style={{ opacity: transform.isHovered ? 1 : 0 }}
            aria-hidden="true"
          >
            <div
              className="absolute h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/15 blur-3xl"
              style={{
                left: `${transform.glowX}%`,
                top: `${transform.glowY}%`,
                opacity: glowOpacity,
              }}
            />
          </div>
        ) : null}

        <div style={contentStyle} className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}

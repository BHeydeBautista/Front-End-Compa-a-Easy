"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  variant?: "default" | "slim";
};

export function Progress({ value, variant = "default", className, ...props }: ProgressProps) {
  const clamped = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative w-full overflow-hidden rounded-full border border-foreground/10 bg-foreground/5",
        variant === "slim" ? "h-2" : "h-3",
        className
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-foreground/25"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

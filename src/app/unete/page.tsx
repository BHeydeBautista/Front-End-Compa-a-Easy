"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export default function UnetePage() {
  const router = useRouter();

  return (
    <div className="relative">
      <div className="absolute left-4 top-4 z-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-10 items-center justify-center rounded-full border border-foreground/10 bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          Volver atrás
        </button>
      </div>
      <div className="px-6 py-24">
        <React.Suspense fallback={null}>
          <LoginForm />
        </React.Suspense>
      </div>
    </div>
  );
}


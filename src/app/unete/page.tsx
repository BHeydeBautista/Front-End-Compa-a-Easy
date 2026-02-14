"use client";

import Login4 from "@/components/auth/Login4";
import { useRouter } from "next/navigation";

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
      <Login4 />
    </div>
  );
}


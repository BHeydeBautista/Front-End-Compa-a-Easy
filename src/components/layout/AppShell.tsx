"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "next-auth/react";
import { SessionExpiryWatcher } from "@/components/auth/SessionExpiryWatcher";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/unete" || pathname.startsWith("/auth/");

  return (
    <SessionProvider refetchInterval={60} refetchOnWindowFocus>
      <SessionExpiryWatcher />
      <div className="flex min-h-dvh flex-col">
        {hideNavbar ? null : <Navbar />}
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SessionProvider>
  );
}

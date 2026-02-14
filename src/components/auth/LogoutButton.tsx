"use client";

import { signOut } from "next-auth/react";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "inline-flex h-10 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/10"
      }
    >
      Cerrar sesión
    </button>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import NavbarFlow from "@/components/ui/navbar-flow";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

function getInitials(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return (first + second).toUpperCase();
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    if (menuOpen) {
      window.addEventListener("pointerdown", onPointerDown);
      return () => window.removeEventListener("pointerdown", onPointerDown);
    }
  }, [menuOpen]);

  const links = [
    { text: "Inicio", url: "/" },
    { text: "Galería", url: "/#galeria" },
    { text: "Sobre nosotros", url: "/sobre" },
    { text: "Reglas", url: "/reglas" },
    { text: "Miembros", url: "/miembros" },
  ];

  const sessionUserIdRaw = (session?.user as any)?.id;
  const sessionUserId = Number(sessionUserIdRaw);
  const hasBackendSession =
    typeof (session as any)?.accessToken === "string" &&
    (session as any).accessToken.length > 0 &&
    Number.isFinite(sessionUserId) &&
    sessionUserId > 0;

  const isAuthenticated = status === "authenticated" && hasBackendSession;
  const displayName =
    (session?.user as any)?.name ?? (session?.user as any)?.email ?? "Usuario";
  const role = (session?.user as any)?.role as string | undefined;
  const normalizedRole = (role ?? "").toLowerCase();
  const isSuperAdmin = normalizedRole === "super_admin";
  const isInfraestructura = normalizedRole === "infraestructura";
  const isFormacion = normalizedRole === "formacion";
  const initials = useMemo(() => getInitials(String(displayName)), [displayName]);

  return (
    <NavbarFlow
      emblem={
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="group -m-2 inline-flex rounded-full p-2 transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          <span className="flex items-center gap-3">
            <span className="relative h-10 w-10 overflow-hidden rounded-full border border-foreground/10 bg-foreground/5">
              <Image
                src="/brand/logo.png"
                alt="Compañía Easy"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </span>
            <span className="hidden sm:inline leading-none">Compañía Easy</span>
          </span>
        </Link>
      }
      links={links}
      rightComponent={
        isAuthenticated ? (
          <div
            ref={menuRef}
            className="relative"
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
          >
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-3 rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-left transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="relative h-9 w-9 overflow-hidden rounded-full border border-foreground/10 bg-foreground/5 grid place-items-center">
                <span className="text-xs font-semibold text-foreground/80">{initials}</span>
              </span>

              <span className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm font-semibold text-foreground">{displayName}</span>
              </span>
            </button>

            {menuOpen ? (
              <div
                role="menu"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-sm"
              >
                <Link
                  href="/dashboard"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-foreground transition-colors hover:bg-foreground/5"
                >
                  Ajustes de perfil
                </Link>

                {isSuperAdmin ? (
                  <Link
                    href="/dashboard/admin"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-foreground transition-colors hover:bg-foreground/5"
                  >
                    Panel de administrador
                  </Link>
                ) : null}

                {isInfraestructura ? (
                  <Link
                    href="/dashboard/infraestructura"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-foreground transition-colors hover:bg-foreground/5"
                  >
                    Panel de asistencias
                  </Link>
                ) : null}

                {isFormacion ? (
                  <Link
                    href="/dashboard/formacion"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-foreground transition-colors hover:bg-foreground/5"
                  >
                    Panel de formación
                  </Link>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  onClick={async () => {
                    setMenuOpen(false);

                    try {
                      await withTimeout(signOut({ redirect: false }), 2500);
                    } catch {
                      // ignore
                    }

                    try {
                      await withTimeout(
                        fetch("/api/auth/logout", {
                          method: "POST",
                          credentials: "include",
                          cache: "no-store",
                          keepalive: true,
                        }),
                        2500,
                      );
                    } catch {
                      // ignore
                    }

                    window.location.assign("/");
                  }}
                  className="block w-full cursor-pointer text-left px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <a
            href="/unete"
            className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          >
            Únete
          </a>
        )
      }
    />
  );
}

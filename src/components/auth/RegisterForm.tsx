"use client";

import * as React from "react";
import Link from "next/link";
import { getProviders, signIn } from "next-auth/react";

async function warmupBackend(options?: {
  totalBudgetMs?: number;
  perTryTimeoutMs?: number;
  pauseMs?: number;
}) {
  const totalBudgetMs = options?.totalBudgetMs ?? 25_000;
  const perTryTimeoutMs = options?.perTryTimeoutMs ?? 8_000;
  const pauseMs = options?.pauseMs ?? 700;

  const start = Date.now();
  while (Date.now() - start < totalBudgetMs) {
    const controller = new AbortController();
    const id = window.setTimeout(() => controller.abort(), perTryTimeoutMs);
    try {
      const res = await fetch("/api/auth/warmup", {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      if (res.ok) return true;
    } catch {
      // ignore
    } finally {
      window.clearTimeout(id);
    }

    await new Promise((r) => window.setTimeout(r, pauseMs));
  }

  return false;
}

function GoogleIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={props.className} focusable="false">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.559 32.66 29.149 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.281 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.281 4 24 4c-7.682 0-14.34 4.334-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.179 0 9.86-1.981 13.409-5.197l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.129 0-9.526-3.317-11.284-7.946l-6.52 5.023C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a11.96 11.96 0 0 1-4.084 5.565l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function MicrosoftIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={props.className}
      focusable="false"
    >
      <path fill="#F25022" d="M2 2h9v9H2V2z" />
      <path fill="#7FBA00" d="M13 2h9v9h-9V2z" />
      <path fill="#00A4EF" d="M2 13h9v9H2v-9z" />
      <path fill="#FFB900" d="M13 13h9v9h-9v-9z" />
    </svg>
  );
}

export function RegisterForm() {
  const [microsoftEnabled, setMicrosoftEnabled] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetch("/api/auth/warmup", { method: "GET", cache: "no-store" }).catch(() => {});
  }, []);

  React.useEffect(() => {
    let alive = true;
    getProviders()
      .then((providers) => {
        if (!alive) return;
        setMicrosoftEnabled(Boolean(providers?.["azure-ad"]));
      })
      .catch(() => {
        if (!alive) return;
        setMicrosoftEnabled(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-foreground/10 bg-background p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Crear Cuenta</h1>
      <p className="mt-2 text-sm text-foreground/70">Regístrese para acceder a su cuenta segura</p>

      <div className="mt-4 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm text-foreground">
        El registro manual (correo/contraseña) está deshabilitado por ahora. Regístrate con Google o Microsoft.
      </div>
      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={async () => {
            await warmupBackend();
            await signIn("google", { callbackUrl: "/dashboard" });
          }}
          className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-foreground/10 bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          <GoogleIcon className="h-5 w-5" />
          Registrarse con Google
        </button>

        {microsoftEnabled ? (
          <button
            type="button"
            onClick={async () => {
              await warmupBackend();
              await signIn("azure-ad", { callbackUrl: "/dashboard" });
            }}
            className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-foreground/10 bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          >
            <MicrosoftIcon className="h-5 w-5" />
            Registrarse con Microsoft
          </button>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Microsoft no está configurado (faltan variables de entorno)"
            className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-foreground/10 bg-background px-4 text-sm font-semibold text-foreground/50"
          >
            <MicrosoftIcon className="h-5 w-5" />
            Registrarse con Microsoft
          </button>
        )}
      </div>

      <p className="pt-6 text-center text-sm text-foreground/70">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/unete" className="font-semibold text-foreground hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}

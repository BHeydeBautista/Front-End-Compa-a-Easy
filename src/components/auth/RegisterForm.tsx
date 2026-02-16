"use client";

import * as React from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("TIMEOUT")), ms);
    promise
      .then((v) => {
        clearTimeout(id);
        resolve(v);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
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

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
          const payload = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          };

          const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            cache: "no-store",
          });

          if (!res.ok) {
            const raw = await res.text();
            try {
              const parsed = raw ? (JSON.parse(raw) as any) : null;
              const message =
                parsed?.message ||
                parsed?.error ||
                (typeof parsed === "string" ? parsed : null);
              setError(String(message ?? "No se pudo crear la cuenta"));
            } catch {
              setError(raw || "No se pudo crear la cuenta");
            }
            return;
          }

          const signInRes = await withTimeout(
            signIn("credentials", {
              email,
              password,
              redirect: false,
            }),
            12_000,
          );

          if (signInRes?.error) {
            if (signInRes.error === "CredentialsSignin") {
              setError("Cuenta creada, pero correo/contraseña inválidos");
            } else {
              setError("Cuenta creada, pero no se pudo conectar con el servidor de autenticación");
            }
            return;
          }

          router.push("/dashboard");
          router.refresh();
        } catch (err) {
          if (err instanceof Error && err.message === "TIMEOUT") {
            setError("El servidor tardó demasiado en responder. Intenta nuevamente.");
          } else {
            setError("No se pudo crear la cuenta");
          }
        } finally {
          setBusy(false);
        }
      }}
      className="mx-auto w-full max-w-md rounded-2xl border border-foreground/10 bg-background p-6"
    >
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Crear Cuenta</h1>
      <p className="mt-2 text-sm text-foreground/70">Regístrese para acceder a su cuenta segura</p>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-foreground/10 bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          <GoogleIcon className="h-5 w-5" />
          Registrarse con Google
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-foreground/10" />
        <p className="text-xs text-foreground/60">O crea tu cuenta con correo electrónico</p>
        <div className="h-px flex-1 bg-foreground/10" />
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            autoComplete="name"
            className="block w-full rounded-xl border border-foreground/10 bg-background px-3 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="Tu nombre"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Correo Electrónico</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            className="block w-full rounded-xl border border-foreground/10 bg-background px-3 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="block w-full rounded-xl border border-foreground/10 bg-background px-3 py-3 pr-10 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm text-foreground">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:opacity-60"
        >
          {busy ? "Creando..." : "Crear cuenta"}
        </button>

        <p className="pt-2 text-center text-sm text-foreground/70">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/unete" className="font-semibold text-foreground hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </form>
  );
}

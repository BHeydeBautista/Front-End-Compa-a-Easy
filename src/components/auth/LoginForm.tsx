"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
          const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (res?.error) {
            setError("Email o contraseña incorrectos");
            return;
          }

          router.push("/dashboard");
          router.refresh();
        } catch {
          setError("No se pudo iniciar sesión");
        } finally {
          setBusy(false);
        }
      }}
      className="mx-auto w-full max-w-md rounded-2xl border border-foreground/10 bg-background p-6"
    >
      <h1 className="text-xl font-semibold tracking-tight text-foreground">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-foreground/70">
        Accedé con tu correo y contraseña.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            className="block w-full rounded-xl border border-foreground/10 bg-background px-3 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="test@test.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            className="block w-full rounded-xl border border-foreground/10 bg-background px-3 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="••••••••"
            required
          />
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
          {busy ? "Ingresando..." : "Ingresar"}
        </button>
      </div>
    </form>
  );
}

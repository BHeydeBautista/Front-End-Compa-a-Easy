"use client";

import * as React from "react";
import { getProviders, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={props.className}
      focusable="false"
    >
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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [microsoftEnabled, setMicrosoftEnabled] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [canResendVerification, setCanResendVerification] = React.useState(false);
  const [resendBusy, setResendBusy] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState<string | null>(null);

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

  React.useEffect(() => {
    const err = searchParams?.get("error");
    if (!err) return;

    const messageByCode: Record<string, string> = {
      AccessDenied: "No se pudo completar el inicio de sesión.",
      OAuthSignin: "No se pudo iniciar sesión con Google.",
      OAuthCallback: "No se pudo completar el inicio de sesión con Google.",
      OAuthAccountNotLinked:
        "Ya existe una cuenta con ese correo. Inicia sesión con el método usado originalmente.",
      GoogleBackendNotConfigured:
        "Google está habilitado, pero el servidor no está configurado para validar el inicio de sesión.",
      GoogleNoIdToken:
        "No se pudo obtener el token de Google. Intenta nuevamente.",
      GoogleExchangeFailed:
        "No se pudo validar el inicio de sesión con el servidor. Intenta nuevamente.",
      GoogleExchangeInvalid:
        "La respuesta del servidor fue inválida. Intenta nuevamente.",
      GoogleExchangeError:
        "El servidor tardó demasiado en responder al validar Google (puede estar iniciando). Intenta nuevamente.",

      MicrosoftBackendNotConfigured:
        "Microsoft está habilitado, pero el servidor no está configurado para validar el inicio de sesión.",
      MicrosoftNoIdToken:
        "No se pudo obtener el token de Microsoft. Intenta nuevamente.",
      MicrosoftExchangeFailed:
        "No se pudo validar el inicio de sesión con el servidor. Intenta nuevamente.",
      MicrosoftExchangeInvalid:
        "La respuesta del servidor fue inválida. Intenta nuevamente.",
      MicrosoftExchangeError:
        "El servidor tardó demasiado en responder al validar Microsoft (puede estar iniciando). Intenta nuevamente.",
    };

    setError(messageByCode[err] ?? "No se pudo completar el inicio de sesión.");
  }, [searchParams]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setResendMessage(null);
        setCanResendVerification(false);
        setBusy(true);
        try {
          const res = await withTimeout(
            signIn("credentials", {
              email,
              password,
              redirect: false,
            }),
            35_000,
          );

          if (!res) {
            setError("No se pudo completar el inicio de sesión. Intenta nuevamente.");
            return;
          }

          if (res?.error) {
            if (res.error === "CredentialsSignin") {
              setError("Correo o contraseña incorrectos");
            } else if (res.error === "EmailNotVerified") {
              setError("Debes verificar tu correo antes de iniciar sesión.");
              setCanResendVerification(true);
            } else {
              setError("No se pudo conectar con el servidor de autenticación");
            }
            return;
          }

          if (res.ok === false) {
            setError("No se pudo iniciar sesión");
            return;
          }

          router.push("/dashboard");
          router.refresh();
        } catch (err) {
          if (err instanceof Error && err.message === "TIMEOUT") {
            setError(
              "El servidor tardó demasiado en responder (Render puede estar iniciando). Intenta nuevamente.",
            );
          } else {
            setError("No se pudo iniciar sesión");
          }
        } finally {
          setBusy(false);
        }
      }}
      className="mx-auto w-full max-w-md rounded-2xl border border-foreground/10 bg-background p-6"
    >
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Inicio de Sesión</h1>
      <p className="mt-2 text-sm text-foreground/70">Acceda a su cuenta segura</p>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-foreground/10 bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          <GoogleIcon className="h-5 w-5" />
          Iniciar sesión con Google
        </button>

        {microsoftEnabled ? (
          <button
            type="button"
            onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
            className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-foreground/10 bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          >
            <MicrosoftIcon className="h-5 w-5" />
            Iniciar sesión con Microsoft
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
            Iniciar sesión con Microsoft
          </button>
        )}

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-foreground/10 bg-background px-4 text-sm font-semibold text-foreground/50"
          title="Próximamente"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-foreground/10 text-[11px] font-extrabold">
            X
          </span>
          Iniciar sesión con Twitter
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-foreground/10" />
        <p className="text-xs text-foreground/60">O inicia sesión con correo electrónico</p>
        <div className="h-px flex-1 bg-foreground/10" />
      </div>

      <div className="mt-6 space-y-4">
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
              autoComplete="current-password"
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

        <div className="flex items-center justify-between gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-foreground/70">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border border-foreground/20"
            />
            Mantenerme conectado
          </label>

          <a href="#" className="text-sm font-semibold text-emerald-600 hover:underline" onClick={(e) => e.preventDefault()}>
            Restablecer contraseña
          </a>
        </div>

        {error ? (
          <div className="rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm text-foreground">
            {error}

            {canResendVerification ? (
              <div className="mt-3">
                <button
                  type="button"
                  disabled={resendBusy || !email.trim()}
                  onClick={async () => {
                    setResendMessage(null);
                    setResendBusy(true);
                    try {
                      const res = await fetch("/api/auth/resend-verification", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: email.trim().toLowerCase() }),
                        cache: "no-store",
                      });

                      if (!res.ok) {
                        setResendMessage("No se pudo reenviar el correo. Intenta nuevamente.");
                        return;
                      }

                      setResendMessage(
                        "Listo. Si el correo es correcto, te llegará un email de verificación (revisa spam).",
                      );
                    } catch {
                      setResendMessage("No se pudo conectar con el servidor.");
                    } finally {
                      setResendBusy(false);
                    }
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-xs font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
                >
                  {resendBusy ? "Reenviando..." : "Reenviar verificación"}
                </button>

                {resendMessage ? (
                  <div className="mt-2 text-xs text-foreground/70">{resendMessage}</div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:opacity-60"
        >
          {busy ? "Ingresando..." : "Inicia sesión en tu cuenta"}
        </button>

        <p className="pt-2 text-center text-sm text-foreground/70">
          ¿Eres nuevo en nuestra plataforma?{" "}
          <Link href="/auth/register" className="font-semibold text-foreground hover:underline">
            Crear Cuenta
          </Link>
        </p>
      </div>
    </form>
  );
}

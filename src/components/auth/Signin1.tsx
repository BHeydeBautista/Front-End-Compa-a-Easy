"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { signIn } from "next-auth/react";

const UserIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3,6 12,13 21,6" />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s4-7 10-7c2.2 0 4.2.7 6 1.8" />
    <path d="M22 12s-4 7-10 7c-2.2 0-4.2-.7-6-1.8" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function Signin1() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const inputBase =
    "w-full rounded-xl border border-foreground/10 bg-background pl-12 pr-3 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20";

  const handleStep1 = () => {
    if (!fullName.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleStep2 = () => {
    if (!email) return setError("El email es obligatorio");
    if (!password) return setError("La contraseña es obligatoria");
    if (password.length < 6)
      return setError("La contraseña debe tener al menos 6 caracteres");
    if (password !== confirmPassword)
      return setError("Las contraseñas no coinciden");
    setError("");
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError("El nombre es obligatorio");
      setStep(1);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      if (!res.ok) {
        let message = "Error al crear la cuenta";
        try {
          const data = await res.json();
          if (typeof (data as any)?.message === "string") message = (data as any).message;
          if (Array.isArray((data as any)?.message)) message = (data as any).message.join(", ");
        } catch {
          // ignore
        }
        setError(message);
        return;
      }

      window.location.href = "/auth/login";
    } catch {
      setError("Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      const res = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (res?.error) {
        setError("Google no está configurado o no se pudo iniciar sesión.");
        return;
      }

      if (res?.url) {
        window.location.href = res.url;
        return;
      }

      setError("No se pudo iniciar sesión con Google.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-foreground/10 bg-background p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-foreground/5">
              <Image
                src="/brand/logo.png"
                alt="Compañía Easy"
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
                priority
              />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Crear cuenta
            </h1>
            <p className="mt-2 text-sm text-foreground/70">Paso {step} de 3</p>

            <p className="text-sm text-foreground/70 mt-3">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="font-semibold text-foreground hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>

        <div className="space-y-5">
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-foreground/10 bg-background py-3 font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:opacity-60"
          >
            <GoogleIcon />
            {isGoogleLoading ? "Conectando con Google..." : "Continuar con Google"}
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-foreground/10" />
            <span className="text-xs text-foreground/50">
              O crea tu cuenta con email
            </span>
            <div className="flex-1 h-px bg-foreground/10" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-5">
          <div className="min-h-[20px]">{error ? <p className="text-sm text-red-600">{error}</p> : null}</div>

          {step === 1 && (
            <>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputBase}
                />
              </div>

              <button
                type="button"
                onClick={handleStep1}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
              >
                Continuar
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <MailIcon />
                </div>
                <input
                  type="email"
                  placeholder="ejemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputBase}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/50 hover:text-foreground/80"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputBase}
                />
              </div>

              <button
                type="button"
                onClick={handleStep2}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
              >
                Continuar
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="bg-slate-100 rounded-lg p-4 text-sm space-y-1">
                <p>
                  <strong>Nombre:</strong> {fullName}
                </p>
                <p>
                  <strong>Email:</strong> {email}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:opacity-60"
              >
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </>
          )}
        </form>
      </div>
      </motion.div>
    </div>
  );
}


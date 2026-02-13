"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  eyebrow: string;
  title: string;
  description: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
};

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function HeroCarousel() {
  const heroVideoSrc = process.env.NEXT_PUBLIC_HERO_VIDEO_SRC ?? "/video/trailer.mp4";
  const slides: Slide[] = useMemo(
    () => [
      {
        eyebrow: "Comunidad",
        title: "Entrenamiento serio, presencia profesional.",
        description:
          "Un sitio elegante para centralizar manuales, cursos y gestión interna: sin fricción, sin ruido, con todo a mano.",
        ctaPrimary: { label: "Explorar manuales", href: "#manuales" },
        ctaSecondary: { label: "Ver miembros", href: "#miembros" },
      },
      {
        eyebrow: "Cursos",
        title: "Manual único de referencia por curso.",
        description:
          "Subí y organizá PDFs por temática. Acceso rápido para instructores y alumnos, con una presentación limpia.",
        ctaPrimary: { label: "Ir a manuales", href: "#manuales" },
        ctaSecondary: { label: "Asistencias", href: "#asistencias" },
      },
      {
        eyebrow: "Gestión",
        title: "Rangos, aprobaciones y asistencias en un solo lugar.",
        description:
          "Cada miembro con su panel: rango, cursos aprobados y asistencias. Preparado para integrar datos desde OneDrive/Excel.",
        ctaPrimary: { label: "Panel de miembros", href: "#miembros" },
        ctaSecondary: { label: "Cargar asistencias", href: "#asistencias" },
      },
    ],
    [],
  );

  const [active, setActive] = useState(0);
  const activeSlide = slides[clampIndex(active, slides.length)];
  const autoplayRef = useRef<number | null>(null);
  const isHovering = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  function stopAutoplay() {
    if (autoplayRef.current) {
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (reducedMotion) return;
    autoplayRef.current = window.setInterval(() => {
      if (isHovering.current) return;
      setActive((v) => clampIndex(v + 1, slides.length));
    }, 7000);
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setReducedMotion(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, reducedMotion]);

  return (
    <section
      id="inicio"
      className="relative overflow-hidden border-b border-foreground/10"
      aria-label="Presentación"
    >
      <div className="relative">
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          src={heroVideoSrc}
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/75 via-background/35 to-background/80"
          aria-hidden="true"
        />

        <div className="relative mx-auto min-h-[calc(100dvh-4rem)] max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <div className="max-w-xl rounded-3xl border border-foreground/10 bg-background/65 p-6 backdrop-blur sm:p-8">
                <p className="inline-flex items-center rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs font-semibold tracking-wide text-foreground/70">
                  {activeSlide.eyebrow}
                </p>
                <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {activeSlide.title}
                </h1>
                <p className="mt-5 text-pretty text-base leading-7 text-foreground/70 sm:text-lg">
                  {activeSlide.description}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href={activeSlide.ctaPrimary.href}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                  >
                    {activeSlide.ctaPrimary.label}
                  </a>
                  {activeSlide.ctaSecondary ? (
                    <a
                      href={activeSlide.ctaSecondary.href}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-foreground/15 bg-background px-5 text-sm font-semibold text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                    >
                      {activeSlide.ctaSecondary.label}
                    </a>
                  ) : null}
                </div>
              </div>

            <div className="mt-8 flex items-center gap-2" aria-label="Controles del carrusel">
              <button
                type="button"
                onClick={() => setActive((v) => clampIndex(v - 1, slides.length))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/15 bg-background text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                aria-label="Anterior"
              >
                <span aria-hidden>‹</span>
              </button>

              <div className="flex items-center gap-2" aria-label="Indicadores">
                {slides.map((_, index) => {
                  const isActive = index === clampIndex(active, slides.length);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActive(index)}
                      className={
                        "h-2.5 w-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 " +
                        (isActive ? "bg-foreground" : "bg-foreground/20 hover:bg-foreground/30")
                      }
                      aria-label={`Ir a la diapositiva ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setActive((v) => clampIndex(v + 1, slides.length))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/15 bg-background text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                aria-label="Siguiente"
              >
                <span aria-hidden>›</span>
              </button>

              <div className="ml-3 hidden text-xs text-foreground/60 sm:block">
                {clampIndex(active, slides.length) + 1} / {slides.length}
              </div>
            </div>
            </div>

          <div
            className="relative"
            onMouseEnter={() => {
              isHovering.current = true;
            }}
            onMouseLeave={() => {
              isHovering.current = false;
            }}
          >
            <div className="rounded-2xl border border-foreground/10 bg-background/70 p-6 backdrop-blur sm:p-8">
              <p className="text-xs font-semibold tracking-wide text-foreground/60">
                Vista rápida
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-foreground/10 bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Manuales en PDF
                  </p>
                  <p className="mt-1 text-sm text-foreground/70">
                    Centralizá documentación por curso.
                  </p>
                </div>
                <div className="rounded-xl border border-foreground/10 bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Panel de miembros
                  </p>
                  <p className="mt-1 text-sm text-foreground/70">
                    Rangos, cursos aprobados y progreso.
                  </p>
                </div>
                <div className="rounded-xl border border-foreground/10 bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Asistencias
                  </p>
                  <p className="mt-1 text-sm text-foreground/70">
                    Carga simple para instructores.
                  </p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-foreground/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-foreground/5 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { LayerStack, Card } from "@/components/ui/layer-stack";

export type MemberDashboardCourseCatalog = Record<string, string>;

type CourseEntry = {
  abbr: string;
  name: string;
  logo: string | null;
};

type Member = {
  nombre: string;
  rango: string;
  rangoImg: string;
  insigniaAlt?: string;
  division?: string;
  cursosAprobados: string[];
  asistencias: {
    misiones: number;
    entrenamientos: number;
  };
  escudoImg?: string;
};

export function MemberDashboard(props: {
  bgSrc: string | null;
  member: Member;
  courseCatalog: MemberDashboardCourseCatalog;
  courseLogos: Record<string, string>;
}) {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  const { bgSrc, member, courseCatalog, courseLogos } = props;

  const normalizeCourseKey = (value: string) => value.replace(/[^a-z0-9]/gi, "").toUpperCase();

  const container: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduceMotion
        ? { duration: 0.2 }
        : { duration: 0.45, ease, staggerChildren: 0.06 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0.2 } : { duration: 0.4, ease },
    },
  };

  const approvedKeySet = new Set(member.cursosAprobados.map((abbr) => normalizeCourseKey(abbr)));

  const toCourseEntry = (abbr: string): CourseEntry => {
    const key = normalizeCourseKey(abbr);
    const logo = courseLogos[key] ?? null;
    const name = courseCatalog[abbr] ?? abbr;
    return { abbr, name, logo };
  };

  const approvedCourses = member.cursosAprobados.map(toCourseEntry);
  const availableCourses = Object.keys(courseCatalog)
    .filter((abbr) => !approvedKeySet.has(normalizeCourseKey(abbr)))
    .map(toCourseEntry);

  return (
    <main className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      {bgSrc ? (
        <Image
          src={bgSrc}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
          aria-hidden="true"
        />
      ) : null}

      {/* Global overlay: makes the HUD readable without feeling like a single floating card */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/80 via-background/55 to-background/85"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.10),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.06),transparent_40%)]"
        aria-hidden="true"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
      >
        {/* Top row */}
        <div className="grid items-start gap-4 lg:grid-cols-[360px_1fr] lg:items-start">
          {/* Left column */}
          <div className="grid gap-4">
            {/* Profile / Identity */}
            <motion.section
              variants={item}
              className={cn(
                "h-fit self-start lg:self-start",
                "relative overflow-hidden",
                "bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/20",
                "border border-foreground/10",
                "rounded-2xl"
              )}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_55%)]" aria-hidden="true" />

              <div className="relative p-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0">
                    <Image
                      src={member.rangoImg}
                      alt={member.insigniaAlt ?? `Rango ${member.rango}`}
                      fill
                      sizes="64px"
                      className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                      priority
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.16em] text-foreground/70">
                      {member.rango.toUpperCase()}
                    </p>
                    <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-foreground">
                      {member.nombre}
                    </h1>
                    {member.division ? (
                      <p className="mt-1 text-sm font-semibold text-foreground/70">{member.division}</p>
                    ) : null}
                  </div>
                </div>

                {member.escudoImg ? (
                  <motion.div
                    variants={item}
                    whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                    className={cn(
                      "mt-5 relative overflow-hidden",
                      "rounded-2xl border border-foreground/10",
                      "bg-foreground/5"
                    )}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.10),transparent_60%)]" aria-hidden="true" />
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={member.escudoImg}
                        alt="Escudo de Compañía Easy"
                        fill
                        sizes="360px"
                        className="object-contain p-10"
                        priority
                      />
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </motion.section>

            {/* Stats under identity */}
            <motion.section
              variants={item}
              className={cn(
                "relative overflow-hidden",
                "bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/20",
                "border border-foreground/10",
                "rounded-2xl"
              )}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_55%)]" aria-hidden="true" />
              <div className="relative p-6">
                <p className="text-sm font-semibold text-foreground">Asistencia a misiones</p>
                <div className="mt-4 flex items-baseline gap-3">
                  <p className="text-5xl font-semibold tracking-tight text-foreground">{member.asistencias.misiones}</p>
                  <p className="text-sm font-semibold tracking-wide text-foreground/70">MISIONES</p>
                </div>
              </div>
            </motion.section>

            <motion.section
              variants={item}
              className={cn(
                "relative overflow-hidden",
                "bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/20",
                "border border-foreground/10",
                "rounded-2xl"
              )}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_55%)]" aria-hidden="true" />
              <div className="relative p-6">
                <p className="text-sm font-semibold text-foreground">Entrenamientos realizados</p>
                <div className="mt-4 flex items-baseline gap-3">
                  <p className="text-5xl font-semibold tracking-tight text-foreground">
                    {member.asistencias.entrenamientos}
                  </p>
                  <p className="text-sm font-semibold tracking-wide text-foreground/70">SESIONES</p>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Courses */}
          <motion.section
            variants={item}
            className={cn(
              "relative overflow-hidden",
              "bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/20",
              "border border-foreground/10",
              "rounded-2xl"
            )}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_55%)]" aria-hidden="true" />
            <div className="relative p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Cursos</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold tracking-wide text-foreground/70">
                    {approvedCourses.length} COMPLETADOS
                  </p>
                  <p className="mt-1 text-xs font-semibold tracking-wide text-foreground/60">
                    {availableCourses.length} DISPONIBLES
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-foreground/70">CURSOS APROBADOS</p>

                <div className="mt-4">
                  <LayerStack cardWidth={360} cardGap={14} stageHeight={220}>
                    {approvedCourses.map((c) => (
                      <Card
                        key={c.abbr}
                        className={cn(
                          "relative overflow-hidden rounded-xl border border-foreground/10",
                          "bg-foreground/5"
                        )}
                      >
                        <div
                          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.10),transparent_55%)]"
                          aria-hidden="true"
                        />
                        <div className="relative flex h-full items-center gap-3 p-4">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-foreground/10 bg-background/40">
                            {c.logo ? (
                              <Image
                                src={c.logo}
                                alt={c.abbr}
                                fill
                                sizes="48px"
                                className="object-contain p-2"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-foreground/60">
                                {c.abbr}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-foreground/60">{c.abbr}</p>
                            <p className="mt-1 whitespace-normal text-sm font-semibold leading-snug text-foreground">
                              {c.name}
                            </p>
                          </div>

                          <span className="inline-flex items-center rounded-full border border-foreground/10 bg-background/30 px-3 py-1 text-[11px] font-semibold text-foreground/75">
                            OK
                          </span>
                        </div>
                      </Card>
                    ))}
                  </LayerStack>
                </div>
              </div>

              <div className="mt-6 border-t border-foreground/10 pt-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-foreground/70">CURSOS DISPONIBLES</p>

                <div className="mt-4">
                  <LayerStack cardWidth={360} cardGap={14} stageHeight={220}>
                    {availableCourses.map((c) => (
                      <Card
                        key={c.abbr}
                        className={cn(
                          "relative overflow-hidden rounded-xl border border-foreground/10",
                          "bg-background/20"
                        )}
                      >
                        <div
                          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_55%)]"
                          aria-hidden="true"
                        />
                        <div className="relative flex h-full items-center gap-3 p-4">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-foreground/10 bg-background/30">
                            {c.logo ? (
                              <Image
                                src={c.logo}
                                alt={c.abbr}
                                fill
                                sizes="48px"
                                className="object-contain p-2 opacity-90"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-foreground/60">
                                {c.abbr}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-foreground/60">{c.abbr}</p>
                            <p className="mt-1 whitespace-normal text-sm font-semibold leading-snug text-foreground/90">
                              {c.name}
                            </p>
                          </div>

                          <span className="inline-flex items-center rounded-full border border-foreground/10 bg-background/20 px-3 py-1 text-[11px] font-semibold text-foreground/70">
                            DISP.
                          </span>
                        </div>
                      </Card>
                    ))}
                  </LayerStack>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

      </motion.div>
    </main>
  );
}

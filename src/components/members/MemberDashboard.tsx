"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { LayerStack, Card } from "@/components/ui/layer-stack";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
  categoria?: string;
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
  profile: {
    name: string;
    steamName: string | null;
    whatsappName: string | null;
    phoneNumber: string | null;
    discord: string | null;
  };
  api: {
    backendBaseUrl: string;
    accessToken: string;
  };
  courseCatalog: MemberDashboardCourseCatalog;
  courseLogos: Record<string, string>;
  readOnly?: boolean;
  showPrivateDetails?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const ease = [0.22, 1, 0.36, 1] as const;

  const {
    bgSrc,
    member,
    profile,
    api,
    courseCatalog,
    courseLogos,
    readOnly = false,
    showPrivateDetails = true,
  } = props;

  const [form, setForm] = useState(() => ({
    name: profile.name ?? "",
    steamName: profile.steamName ?? "",
    whatsappName: profile.whatsappName ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    discord: profile.discord ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  const inputClassName =
    "mt-1 w-full rounded-xl border border-foreground/10 bg-background/40 px-3 py-2 text-sm text-foreground placeholder:text-foreground/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20";

  const labelClassName = "text-xs font-semibold tracking-[0.14em] text-foreground/70 uppercase";

  const canSubmit = useMemo(() => {
    if (readOnly) return false;
    if (saving) return false;
    return form.name.trim().length > 0;
  }, [form.name, readOnly, saving]);

  async function onSaveProfile() {
    if (readOnly) return;
    if (!canSubmit) return;

    setSaving(true);
    setSaveError(null);
    setSaveOk(null);

    try {
      const response = await fetch(`${api.backendBaseUrl}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${api.accessToken}`,
        },
        body: JSON.stringify({
          name: form.name,
          steamName: form.steamName,
          whatsappName: form.whatsappName,
          phoneNumber: form.phoneNumber,
          discord: form.discord,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        window.location.assign("/api/auth/logout");
        return;
      }

      if (!response.ok) {
        const msg = await response.text().catch(() => "");
        setSaveError(msg || "No se pudo guardar los cambios.");
        return;
      }

      setSaveOk("Cambios guardados.");
      router.refresh();
    } catch {
      setSaveError("No se pudo guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

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
                    {member.division || member.categoria ? (
                      <p className="mt-1 text-sm font-semibold text-foreground/70">
                        {[member.division, member.categoria].filter(Boolean).join(" • ")}
                      </p>
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

            {showPrivateDetails ? (
              <>
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
                  <div
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_55%)]"
                    aria-hidden="true"
                  />
                  <div className="relative p-6">
                    <p className="text-sm font-semibold text-foreground">Asistencia a misiones</p>
                    <div className="mt-4 flex items-baseline gap-3">
                      <p className="text-5xl font-semibold tracking-tight text-foreground">
                        {member.asistencias.misiones}
                      </p>
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
                  <div
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_55%)]"
                    aria-hidden="true"
                  />
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

                {/* Profile settings */}
                <motion.section
                  variants={item}
                  className={cn(
                    "relative overflow-hidden",
                    "bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/20",
                    "border border-foreground/10",
                    "rounded-2xl"
                  )}
                >
                  <div
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_55%)]"
                    aria-hidden="true"
                  />
                  <div className="relative p-6">
                    <p className="text-sm font-semibold text-foreground">Datos del perfil</p>
                    <p className="mt-1 text-xs font-semibold tracking-wide text-foreground/60">
                      {readOnly
                        ? "Información del perfil del miembro."
                        : "Actualizá tu nombre y datos de contacto."}
                    </p>

                    <div className="mt-5 grid gap-4">
                      <div>
                        <label className={labelClassName} htmlFor="profile-name">
                          Nombre
                        </label>
                        <input
                          id="profile-name"
                          className={inputClassName}
                          value={form.name}
                          onChange={
                            readOnly ? undefined : (e) => setForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="Tu nombre"
                          autoComplete="name"
                          disabled={readOnly}
                          readOnly={readOnly}
                        />
                      </div>

                      <div>
                        <label className={labelClassName} htmlFor="profile-phone">
                          Número de teléfono
                        </label>
                        <input
                          id="profile-phone"
                          className={inputClassName}
                          value={form.phoneNumber}
                          onChange={
                            readOnly
                              ? undefined
                              : (e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
                          }
                          placeholder="Ej: +54 11 1234 5678"
                          autoComplete="tel"
                          disabled={readOnly}
                          readOnly={readOnly}
                        />
                      </div>

                      <div>
                        <label className={labelClassName} htmlFor="profile-discord">
                          Discord
                        </label>
                        <input
                          id="profile-discord"
                          className={inputClassName}
                          value={form.discord}
                          onChange={
                            readOnly
                              ? undefined
                              : (e) => setForm((prev) => ({ ...prev, discord: e.target.value }))
                          }
                          placeholder="Ej: usuario#1234"
                          autoComplete="off"
                          disabled={readOnly}
                          readOnly={readOnly}
                        />
                      </div>

                      <div>
                        <label className={labelClassName} htmlFor="profile-steam">
                          Steam
                        </label>
                        <input
                          id="profile-steam"
                          className={inputClassName}
                          value={form.steamName}
                          onChange={
                            readOnly
                              ? undefined
                              : (e) => setForm((prev) => ({ ...prev, steamName: e.target.value }))
                          }
                          placeholder="Nombre en Steam"
                          autoComplete="off"
                          disabled={readOnly}
                          readOnly={readOnly}
                        />
                      </div>

                      <div>
                        <label className={labelClassName} htmlFor="profile-whatsapp">
                          WhatsApp
                        </label>
                        <input
                          id="profile-whatsapp"
                          className={inputClassName}
                          value={form.whatsappName}
                          onChange={
                            readOnly
                              ? undefined
                              : (e) => setForm((prev) => ({ ...prev, whatsappName: e.target.value }))
                          }
                          placeholder="Nombre en WhatsApp"
                          autoComplete="off"
                          disabled={readOnly}
                          readOnly={readOnly}
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        {!readOnly ? (
                          <>
                            <button
                              type="button"
                              disabled={!canSubmit}
                              onClick={onSaveProfile}
                              className={cn(
                                "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors",
                                canSubmit
                                  ? "bg-foreground text-background hover:bg-foreground/90"
                                  : "bg-foreground/20 text-foreground/50 cursor-not-allowed"
                              )}
                            >
                              {saving ? "Guardando..." : "Guardar"}
                            </button>

                            {saveOk ? <p className="text-xs font-semibold text-foreground/70">{saveOk}</p> : null}
                            {saveError ? (
                              <p className="text-xs font-semibold text-destructive">{saveError}</p>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </motion.section>
              </>
            ) : null}
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
                  {showPrivateDetails ? (
                    <p className="mt-1 text-xs font-semibold tracking-wide text-foreground/60">
                      {availableCourses.length} DISPONIBLES
                    </p>
                  ) : null}
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

              {showPrivateDetails ? (
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
                              <p className="text-[11px] font-semibold tracking-[0.18em] text-foreground/60">
                                {c.abbr}
                              </p>
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
              ) : null}
            </div>
          </motion.section>
        </div>

      </motion.div>
    </main>
  );
}

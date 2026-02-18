"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { Progress } from "@/components/ui/progress";

type Course = {
  id: number;
  code: string;
  name: string;
  type?: "ascenso" | "especialidad" | null;
  requiresAllPreviousAscenso?: boolean;
};

type CandidateUser = {
  id: number;
  name: string;
  email: string;
  deletedAt: string | null;
};

type IneligibleUser = CandidateUser & {
  reason: "NO_RANK" | "NOT_UNLOCKED" | "ALREADY_APPROVED" | "MISSING_PREREQUISITES" | "COURSE_NOT_FOUND" | null;
  missingPrerequisites: Array<{ id: number; code: string; name: string }>;
};

type CandidatesResponse = {
  courseId: number;
  users: CandidateUser[];
  ineligible?: IneligibleUser[];
};

async function apiFetch<T>(
  url: string,
  opts: {
    accessToken: string;
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
  },
): Promise<T> {
  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      ...(opts.body ? { "Content-Type": "application/json" } : null),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

function Button({
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "subtle";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default"
          ? "border-foreground/10 bg-background/40 text-foreground backdrop-blur hover:bg-foreground/5"
          : "border-transparent bg-transparent text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
        className,
      )}
    />
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-foreground/80">{children}</label>;
}

function ControlBase({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-xl border border-foreground/10 bg-background/20 backdrop-blur",
        className,
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-foreground/10 bg-background/20 px-3 py-2 text-sm text-foreground backdrop-blur",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        props.className,
      )}
    />
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-foreground/10 bg-background/20 px-3 py-2 text-sm text-foreground backdrop-blur",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        props.className,
      )}
    />
  );
}

function reasonLabel(reason: IneligibleUser["reason"], missing: IneligibleUser["missingPrerequisites"]) {
  if (reason === "NO_RANK") return "No tiene rango";
  if (reason === "NOT_UNLOCKED") return "No desbloqueado por rango";
  if (reason === "ALREADY_APPROVED") return "Ya aprobado";
  if (reason === "COURSE_NOT_FOUND") return "Curso inexistente";
  if (reason === "MISSING_PREREQUISITES") {
    const codes = missing.map((c) => c.code).filter(Boolean);
    return codes.length ? `Faltan prerequisitos: ${codes.join(", ")}` : "Faltan prerequisitos";
  }
  return "No elegible";
}

export function FormationPanel({
  backendBaseUrl,
  accessToken,
}: {
  backendBaseUrl: string;
  accessToken?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState<number | "">("");

  const [includeInactive, setIncludeInactive] = React.useState(false);
  const [includeIneligible, setIncludeIneligible] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const [candidates, setCandidates] = React.useState<CandidatesResponse | null>(null);

  const loadCourses = React.useCallback(async () => {
    if (!accessToken) {
      setCourses([]);
      setSelectedCourseId("");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const rows = await apiFetch<Course[]>(`${backendBaseUrl}/instructor/courses`, { accessToken });
      setCourses(rows);
      if (rows.length && selectedCourseId === "") {
        setSelectedCourseId(rows[0].id);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, selectedCourseId]);

  const loadCandidates = React.useCallback(async () => {
    const courseId = Number(selectedCourseId);
    if (!accessToken || !Number.isFinite(courseId) || courseId <= 0) {
      setCandidates(null);
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const data = await apiFetch<CandidatesResponse>(
        `${backendBaseUrl}/instructor/courses/${courseId}/candidates?includeDeleted=${includeInactive ? "true" : "false"}&includeIneligible=${includeIneligible ? "true" : "false"}`,
        { accessToken },
      );
      setCandidates(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, includeInactive, includeIneligible, selectedCourseId]);

  React.useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  React.useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const approve = async (userId: number) => {
    const courseId = Number(selectedCourseId);
    if (!accessToken || !Number.isFinite(courseId) || courseId <= 0) return;

    setError(null);
    setBusy(true);
    try {
      await apiFetch(`${backendBaseUrl}/instructor/courses/${courseId}/approve`, {
        accessToken,
        method: "POST",
        body: { userId },
      });
      await loadCandidates();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const selectedCourse = React.useMemo(() => {
    const courseId = Number(selectedCourseId);
    if (!Number.isFinite(courseId) || courseId <= 0) return null;
    return courses.find((c) => c.id === courseId) ?? null;
  }, [courses, selectedCourseId]);

  const filteredEligible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = candidates?.users ?? [];
    if (!q) return rows;
    return rows.filter((u) => {
      return (
        String(u.name ?? "").toLowerCase().includes(q) ||
        String(u.email ?? "").toLowerCase().includes(q) ||
        String(u.id).includes(q)
      );
    });
  }, [candidates?.users, search]);

  const filteredIneligible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = candidates?.ineligible ?? [];
    if (!q) return rows;
    return rows.filter((u) => {
      return (
        String(u.name ?? "").toLowerCase().includes(q) ||
        String(u.email ?? "").toLowerCase().includes(q) ||
        String(u.id).includes(q)
      );
    });
  }, [candidates?.ineligible, search]);

  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Reveal>
        <div className="rounded-2xl border border-foreground/10 bg-background/30 backdrop-blur p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">FORMACIÓN</h1>
              <p className="mt-1 text-sm leading-6 text-foreground/70">Aprobar cursos para miembros elegibles.</p>
            </div>
            <div className="hidden w-28 sm:block" aria-hidden="true">
              <Progress value={busy ? 70 : 0} variant="slim" className={busy ? "opacity-100" : "opacity-0"} />
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-foreground/10 bg-background/30 p-4">
              <p className="text-sm text-foreground">
                <span className="font-medium">Error:</span> {error}
              </p>
            </div>
          ) : null}
        </div>
      </Reveal>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <ControlBase className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>Curso</FieldLabel>
              <Select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                disabled={busy || !accessToken}
              >
                {courses.length === 0 ? (
                  <option value="">Sin cursos asignados</option>
                ) : null}
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </Select>
              {selectedCourse?.type ? (
                <p className="text-xs text-foreground/60">Tipo: {selectedCourse.type}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <FieldLabel>Buscar miembro</FieldLabel>
              <Input
                placeholder="Nombre, email o ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={busy}
              />
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-foreground/70">
                  <input
                    type="checkbox"
                    checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                    disabled={busy}
                  />
                  Incluir inactivos
                </label>
                <label className="flex items-center gap-2 text-xs text-foreground/70">
                  <input
                    type="checkbox"
                    checked={includeIneligible}
                    onChange={(e) => setIncludeIneligible(e.target.checked)}
                    disabled={busy}
                  />
                  Mostrar no elegibles (qué falta)
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button type="button" variant="subtle" onClick={loadCandidates} disabled={busy || !selectedCourseId}>
              Recargar
            </Button>
          </div>
        </ControlBase>

        <ControlBase className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Elegibles</p>
              <p className="mt-1 text-xs text-foreground/70">Solo aparecen quienes cumplen desbloqueo y prerequisitos.</p>
            </div>
            <p className="text-xs text-foreground/60">{filteredEligible.length} miembro(s)</p>
          </div>

          <div className="mt-4">
            {filteredEligible.length ? (
              <div className="space-y-2">
                {filteredEligible.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-3 rounded-xl border border-foreground/10 bg-background/20 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                      <p className="truncate text-xs text-foreground/60">ID {u.id} — {u.email}</p>
                    </div>
                    <Button type="button" onClick={() => approve(u.id)} disabled={busy} className="px-3 py-2 text-xs">
                      Aprobar
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground/70">No hay miembros elegibles.</p>
            )}
          </div>
        </ControlBase>

        {includeIneligible ? (
          <ControlBase className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">No elegibles</p>
                <p className="mt-1 text-xs text-foreground/70">Motivo por el cual todavía no puede aprobarse.</p>
              </div>
              <p className="text-xs text-foreground/60">{filteredIneligible.length} miembro(s)</p>
            </div>

            <div className="mt-4">
              {filteredIneligible.length ? (
                <div className="space-y-2">
                  {filteredIneligible.map((u) => (
                    <div key={u.id} className="rounded-xl border border-foreground/10 bg-background/20 px-3 py-2">
                      <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                      <p className="truncate text-xs text-foreground/60">ID {u.id} — {u.email}</p>
                      <p className="mt-1 text-xs text-foreground/70">{reasonLabel(u.reason, u.missingPrerequisites)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/70">No hay miembros para mostrar.</p>
              )}
            </div>
          </ControlBase>
        ) : null}
      </div>
    </div>
  );
}

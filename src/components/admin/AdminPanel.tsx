"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { Progress } from "@/components/ui/progress";
import { motion } from "motion/react";

type UserRole = "super_admin" | "moderator" | "user";

type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  rankId?: number | null;
  rank?: { id: number; name: string } | null;
  deletedAt?: string | null;
};

type Rank = {
  id: number;
  name: string;
  sortOrder: number;
};

type Course = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
};

type ApprovedCourseRow = {
  id: number;
  approvedAt: string;
  course: Course;
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

function ControlBase({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
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

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
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

function Card({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="w-full">
      <motion.section
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={cn(
          "w-full rounded-2xl border border-foreground/10 bg-foreground/5",
          "shadow-sm",
          "backdrop-blur",
          className,
        )}
      >
        <div className="p-5 sm:p-6">{children}</div>
      </motion.section>
    </Reveal>
  );
}

export function AdminPanel({
  backendBaseUrl,
  accessToken,
}: {
  backendBaseUrl: string;
  accessToken?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [users, setUsers] = React.useState<User[]>([]);
  const [ranks, setRanks] = React.useState<Rank[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);

  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);

  const [selectedCourseId, setSelectedCourseId] = React.useState<number | null>(null);
  const [selectedRankId, setSelectedRankId] = React.useState<number | null>(null);

  const selectedCourse = React.useMemo(
    () => courses.find((c) => c.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const selectedRank = React.useMemo(
    () => ranks.find((r) => r.id === selectedRankId) ?? null,
    [ranks, selectedRankId],
  );

  const selectedUser = React.useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const [roleDraft, setRoleDraft] = React.useState<UserRole | "">("");
  const [rankIdDraft, setRankIdDraft] = React.useState<number | "" | null>("");

  const [approvedRows, setApprovedRows] = React.useState<ApprovedCourseRow[]>([]);
  const approvedCourseIds = React.useMemo(() => {
    return new Set(
      approvedRows
        .map((r) => r.course?.id)
        .filter((id): id is number => typeof id === "number"),
    );
  }, [approvedRows]);

  const [courseToToggleId, setCourseToToggleId] = React.useState<number | "">("");

  const [courseEdit, setCourseEdit] = React.useState<{ code: string; name: string; description: string }>(
    { code: "", name: "", description: "" },
  );
  const [courseNew, setCourseNew] = React.useState<{ code: string; name: string; description: string }>(
    { code: "", name: "", description: "" },
  );

  const [rankEdit, setRankEdit] = React.useState<{ name: string; sortOrder: string }>(
    { name: "", sortOrder: "0" },
  );
  const [rankNew, setRankNew] = React.useState<{ name: string; sortOrder: string }>(
    { name: "", sortOrder: "0" },
  );

  const loadBase = React.useCallback(async () => {
    if (!accessToken) return;
    setError(null);
    setBusy(true);
    try {
      const [u, r, c] = await Promise.all([
        apiFetch<User[]>(`${backendBaseUrl}/users?includeDeleted=true`, { accessToken }),
        apiFetch<Rank[]>(`${backendBaseUrl}/ranks`, { accessToken }),
        apiFetch<Course[]>(`${backendBaseUrl}/courses`, { accessToken }),
      ]);
      setUsers(u);
      setRanks(r);
      setCourses(c);

      if (u.length && selectedUserId == null) {
        setSelectedUserId(u[0].id);
      }

      if (c.length && selectedCourseId == null) {
        setSelectedCourseId(c[0].id);
      }

      if (r.length && selectedRankId == null) {
        setSelectedRankId(r[0].id);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, selectedUserId, selectedCourseId, selectedRankId]);

  const loadApproved = React.useCallback(async () => {
    if (!accessToken || !selectedUserId) {
      setApprovedRows([]);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const rows = await apiFetch<ApprovedCourseRow[]>(
        `${backendBaseUrl}/users/${selectedUserId}/courses/approved`,
        { accessToken },
      );
      setApprovedRows(rows);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, selectedUserId]);

  React.useEffect(() => {
    loadBase();
  }, [loadBase]);

  React.useEffect(() => {
    if (!selectedUser) {
      setRoleDraft("");
      setRankIdDraft("");
      setCourseToToggleId("");
      return;
    }
    setRoleDraft(selectedUser.role ?? "user");
    setRankIdDraft(
      typeof selectedUser.rankId === "number" ? selectedUser.rankId : null,
    );
    setCourseToToggleId("");
  }, [selectedUser]);

  React.useEffect(() => {
    if (!selectedCourse) {
      setCourseEdit({ code: "", name: "", description: "" });
      return;
    }
    setCourseEdit({
      code: selectedCourse.code ?? "",
      name: selectedCourse.name ?? "",
      description: selectedCourse.description ?? "",
    });
  }, [selectedCourse]);

  React.useEffect(() => {
    if (!selectedRank) {
      setRankEdit({ name: "", sortOrder: "0" });
      return;
    }
    setRankEdit({
      name: selectedRank.name ?? "",
      sortOrder: String(selectedRank.sortOrder ?? 0),
    });
  }, [selectedRank]);

  React.useEffect(() => {
    loadApproved();
  }, [loadApproved]);

  if (!accessToken) {
    return (
      <div className="rounded-2xl border border-foreground/10 bg-background p-6">
        <p className="text-sm text-foreground/70">Sesión inválida o sin token.</p>
      </div>
    );
  }

  const onDeactivate = async () => {
    if (!selectedUserId) return;
    if (!confirm("¿Dar de baja este usuario?") ) return;

    setError(null);
    setBusy(true);
    try {
      await apiFetch<{ ok: true }>(`${backendBaseUrl}/users/${selectedUserId}`, {
        accessToken,
        method: "DELETE",
      });
      await loadBase();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!selectedUserId) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch<User>(`${backendBaseUrl}/users/${selectedUserId}/restore`, {
        accessToken,
        method: "POST",
      });
      await loadBase();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onSaveRole = async () => {
    if (!selectedUserId || !selectedUser) return;
    if (!roleDraft) return;
    if (roleDraft === selectedUser.role) return;

    setError(null);
    setBusy(true);
    try {
      await apiFetch<User>(`${backendBaseUrl}/users/${selectedUserId}`, {
        accessToken,
        method: "PATCH",
        body: { role: roleDraft },
      });
      await loadBase();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onSaveRank = async () => {
    if (!selectedUserId || !selectedUser) return;

    const current = typeof selectedUser.rankId === "number" ? selectedUser.rankId : null;
    const next = typeof rankIdDraft === "number" ? rankIdDraft : null;
    if (current === next) return;

    setError(null);
    setBusy(true);
    try {
      await apiFetch<User>(`${backendBaseUrl}/users/${selectedUserId}`, {
        accessToken,
        method: "PATCH",
        body: { rankId: next },
      });
      await loadBase();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onToggleCourse = async () => {
    if (!selectedUserId) return;
    if (courseToToggleId === "") return;

    const courseId = Number(courseToToggleId);
    const isApproved = approvedCourseIds.has(courseId);

    setError(null);
    setBusy(true);
    try {
      if (isApproved) {
        await apiFetch<{ ok: true }>(
          `${backendBaseUrl}/users/${selectedUserId}/courses/approved/${courseId}`,
          { accessToken, method: "DELETE" },
        );
      } else {
        await apiFetch<ApprovedCourseRow>(
          `${backendBaseUrl}/users/${selectedUserId}/courses/approved`,
          { accessToken, method: "POST", body: { courseId } },
        );
      }

      await loadApproved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onCreateCourse = async () => {
    const code = courseNew.code.trim();
    const name = courseNew.name.trim();
    const description = courseNew.description.trim();
    if (!code || !name) return;

    setError(null);
    setBusy(true);
    try {
      const created = await apiFetch<Course>(`${backendBaseUrl}/courses`, {
        accessToken,
        method: "POST",
        body: {
          code,
          name,
          description: description || undefined,
        },
      });

      setCourseNew({ code: "", name: "", description: "" });
      await loadBase();
      setSelectedCourseId(created.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onUpdateCourse = async () => {
    if (!selectedCourseId || !selectedCourse) return;
    const patch: { code?: string; name?: string; description?: string } = {};

    const code = courseEdit.code.trim();
    const name = courseEdit.name.trim();
    const description = courseEdit.description.trim();

    if (code !== selectedCourse.code) patch.code = code;
    if (name !== selectedCourse.name) patch.name = name;
    if ((selectedCourse.description ?? "") !== description) patch.description = description || undefined;

    if (Object.keys(patch).length === 0) return;

    setError(null);
    setBusy(true);
    try {
      await apiFetch<Course>(`${backendBaseUrl}/courses/${selectedCourseId}`, {
        accessToken,
        method: "PATCH",
        body: patch,
      });
      await loadBase();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onCreateRank = async () => {
    const name = rankNew.name.trim();
    const sortOrder = Number(rankNew.sortOrder);
    if (!name || !Number.isFinite(sortOrder) || sortOrder < 0) return;

    setError(null);
    setBusy(true);
    try {
      const created = await apiFetch<Rank>(`${backendBaseUrl}/ranks`, {
        accessToken,
        method: "POST",
        body: { name, sortOrder },
      });
      setRankNew({ name: "", sortOrder: "0" });
      await loadBase();
      setSelectedRankId(created.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onUpdateRank = async () => {
    if (!selectedRankId || !selectedRank) return;

    const name = rankEdit.name.trim();
    const sortOrder = Number(rankEdit.sortOrder);
    if (!name || !Number.isFinite(sortOrder) || sortOrder < 0) return;

    const patch: Partial<Rank> = {};
    if (name !== selectedRank.name) patch.name = name;
    if (sortOrder !== selectedRank.sortOrder) patch.sortOrder = sortOrder;
    if (Object.keys(patch).length === 0) return;

    setError(null);
    setBusy(true);
    try {
      await apiFetch<Rank>(`${backendBaseUrl}/ranks/${selectedRankId}`, {
        accessToken,
        method: "PATCH",
        body: patch,
      });
      await loadBase();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Reveal>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
              Panel Admin
            </h1>
            <p className="mt-2 text-sm leading-6 text-foreground/70">
              Usuarios, roles, rangos, cursos aprobados, y administración de cursos/rangos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden w-44 sm:block" aria-hidden="true">
              <Progress value={busy ? 70 : 0} variant="slim" className={busy ? "opacity-100" : "opacity-0"} />
            </div>
            <Button type="button" onClick={loadBase} disabled={busy}>
              Recargar
            </Button>
          </div>
        </div>
      </Reveal>

      {error ? (
        <Card delay={0.05} className="mt-6">
          <div className="rounded-xl border border-foreground/10 bg-background/30 p-4">
            <p className="text-sm text-foreground">
              <span className="font-medium">Error:</span> {error}
            </p>
          </div>
        </Card>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card delay={0.08}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Usuarios</h2>
                <p className="mt-1 text-sm text-foreground/70">Alta/baja y selección de usuario.</p>
              </div>
              {busy ? (
                <span className="rounded-full border border-foreground/10 bg-background/30 px-3 py-1 text-xs text-foreground/70 animate-pulse">
                  trabajando…
                </span>
              ) : null}
            </div>

            <div className="mt-5 space-y-3">
              <div className="space-y-2">
                <FieldLabel>Usuario</FieldLabel>
                <Select
                  value={selectedUserId ?? ""}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  disabled={busy}
                >
                  <option value="" disabled>
                    Seleccionar…
                  </option>
                  {users.map((u) => {
                    const tag = u.deletedAt ? "(baja)" : "";
                    return (
                      <option key={u.id} value={u.id}>
                        #{u.id} {u.name} — {u.email} {tag}
                      </option>
                    );
                  })}
                </Select>
              </div>

              {selectedUser ? (
                <ControlBase className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{selectedUser.name}</p>
                      <p className="truncate text-sm text-foreground/70">{selectedUser.email}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border border-foreground/10 bg-background/30 px-3 py-1 text-xs",
                        selectedUser.deletedAt ? "text-foreground/70" : "text-foreground",
                      )}
                    >
                      {selectedUser.deletedAt ? "BAJA" : "ACTIVO"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-foreground/70">rol</p>
                      <p className="font-medium text-foreground">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/70">rango</p>
                      <p className="font-medium text-foreground">{selectedUser.rank?.name ?? "(sin rango)"}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    {selectedUser.deletedAt ? (
                      <Button type="button" onClick={onRestore} disabled={busy} className="w-full sm:w-auto">
                        Dar de alta
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={onDeactivate}
                        disabled={busy || !selectedUserId}
                        className="w-full sm:w-auto"
                      >
                        Dar de baja
                      </Button>
                    )}
                  </div>
                </ControlBase>
              ) : (
                <p className="text-sm text-foreground/70">Seleccioná un usuario para editar.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card delay={0.12}>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Permisos y cursos</h2>
              <p className="mt-1 text-sm text-foreground/70">Rol, rango y cursos aprobados del usuario.</p>
            </div>

            {selectedUser ? (
              <div className="mt-5 grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ControlBase className="p-4">
                    <p className="text-sm font-medium text-foreground">Rol</p>
                    <p className="mt-1 text-xs text-foreground/70">Solo user o moderator.</p>
                    <div className="mt-3 flex gap-3">
                      <Select
                        value={roleDraft}
                        onChange={(e) => setRoleDraft(e.target.value as UserRole)}
                        disabled={busy}
                      >
                        <option value="user">user</option>
                        <option value="moderator">moderator</option>
                      </Select>
                      <Button
                        type="button"
                        onClick={onSaveRole}
                        disabled={busy || !roleDraft || roleDraft === selectedUser.role}
                      >
                        Guardar
                      </Button>
                    </div>
                  </ControlBase>

                  <ControlBase className="p-4">
                    <p className="text-sm font-medium text-foreground">Rango</p>
                    <p className="mt-1 text-xs text-foreground/70">Asignar o dejar sin rango.</p>
                    <div className="mt-3 flex gap-3">
                      <Select
                        value={rankIdDraft === null ? "" : rankIdDraft}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRankIdDraft(v === "" ? null : Number(v));
                        }}
                        disabled={busy}
                      >
                        <option value="">Sin rango</option>
                        {ranks
                          .slice()
                          .sort((a, b) => (a.sortOrder - b.sortOrder) || (a.id - b.id))
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                      </Select>
                      <Button
                        type="button"
                        onClick={onSaveRank}
                        disabled={
                          busy ||
                          (typeof selectedUser.rankId === "number" ? selectedUser.rankId : null) ===
                            (typeof rankIdDraft === "number" ? rankIdDraft : null)
                        }
                      >
                        Guardar
                      </Button>
                    </div>
                  </ControlBase>
                </div>

                <ControlBase className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Cursos aprobados</p>
                      <p className="mt-1 text-xs text-foreground/70">Cambiar estado aprobado/no aprobado.</p>
                    </div>
                    <Button type="button" variant="subtle" onClick={loadApproved} disabled={busy}>
                      Recargar
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Select
                      value={courseToToggleId}
                      onChange={(e) =>
                        setCourseToToggleId(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      disabled={busy}
                    >
                      <option value="">Seleccionar curso…</option>
                      {courses.map((c) => {
                        const tag = approvedCourseIds.has(c.id) ? "(aprobado)" : "";
                        return (
                          <option key={c.id} value={c.id}>
                            {c.code} — {c.name} {tag}
                          </option>
                        );
                      })}
                    </Select>

                    <Button type="button" onClick={onToggleCourse} disabled={busy || courseToToggleId === ""}>
                      Cambiar
                    </Button>
                  </div>

                  <div className="mt-5">
                    {approvedRows.length ? (
                      <ul className="space-y-2">
                        {approvedRows.map((row) => (
                          <li
                            key={row.id}
                            className="flex flex-col justify-between gap-2 rounded-xl border border-foreground/10 bg-background/20 px-3 py-2 sm:flex-row sm:items-center"
                          >
                            <span className="text-sm text-foreground">
                              {row.course.code} — {row.course.name}
                            </span>
                            <Button
                              type="button"
                              onClick={async () => {
                                if (!selectedUserId) return;
                                if (!confirm("¿Marcar como NO aprobado?") ) return;

                                setError(null);
                                setBusy(true);
                                try {
                                  await apiFetch<{ ok: true }>(
                                    `${backendBaseUrl}/users/${selectedUserId}/courses/approved/${row.course.id}`,
                                    { accessToken, method: "DELETE" },
                                  );
                                  await loadApproved();
                                } catch (e) {
                                  setError((e as Error).message);
                                } finally {
                                  setBusy(false);
                                }
                              }}
                              disabled={busy}
                              className="px-3 py-2 text-xs"
                            >
                              Reprobar
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-foreground/70">No hay cursos aprobados.</p>
                    )}
                  </div>
                </ControlBase>
              </div>
            ) : (
              <p className="mt-5 text-sm text-foreground/70">Seleccioná un usuario para habilitar edición.</p>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card delay={0.16}>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Cursos</h2>
            <p className="mt-1 text-sm text-foreground/70">Crear y modificar cursos.</p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4">
            <ControlBase className="p-4">
              <p className="text-sm font-medium text-foreground">Editar curso</p>
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <FieldLabel>Curso</FieldLabel>
                  <Select
                    value={selectedCourseId ?? ""}
                    onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                    disabled={busy}
                  >
                    <option value="" disabled>
                      Seleccionar…
                    </option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel>Código</FieldLabel>
                    <Input
                      value={courseEdit.code}
                      onChange={(e) => setCourseEdit((s) => ({ ...s, code: e.target.value }))}
                      disabled={busy || !selectedCourse}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Nombre</FieldLabel>
                    <Input
                      value={courseEdit.name}
                      onChange={(e) => setCourseEdit((s) => ({ ...s, name: e.target.value }))}
                      disabled={busy || !selectedCourse}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FieldLabel>Descripción (opcional)</FieldLabel>
                  <Textarea
                    className="min-h-[90px]"
                    value={courseEdit.description}
                    onChange={(e) => setCourseEdit((s) => ({ ...s, description: e.target.value }))}
                    disabled={busy || !selectedCourse}
                  />
                </div>

                <Button type="button" onClick={onUpdateCourse} disabled={busy || !selectedCourseId} className="w-full">
                  Guardar cambios
                </Button>
              </div>
            </ControlBase>

            <ControlBase className="p-4">
              <p className="text-sm font-medium text-foreground">Crear curso</p>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel>Código</FieldLabel>
                    <Input
                      value={courseNew.code}
                      onChange={(e) => setCourseNew((s) => ({ ...s, code: e.target.value }))}
                      disabled={busy}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Nombre</FieldLabel>
                    <Input
                      value={courseNew.name}
                      onChange={(e) => setCourseNew((s) => ({ ...s, name: e.target.value }))}
                      disabled={busy}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FieldLabel>Descripción (opcional)</FieldLabel>
                  <Textarea
                    className="min-h-[90px]"
                    value={courseNew.description}
                    onChange={(e) => setCourseNew((s) => ({ ...s, description: e.target.value }))}
                    disabled={busy}
                  />
                </div>

                <Button
                  type="button"
                  onClick={onCreateCourse}
                  disabled={busy || !courseNew.code.trim() || !courseNew.name.trim()}
                  className="w-full"
                >
                  Crear
                </Button>
              </div>
            </ControlBase>
          </div>
        </Card>

        <Card delay={0.2}>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Rangos</h2>
            <p className="mt-1 text-sm text-foreground/70">Crear y modificar rangos.</p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4">
            <ControlBase className="p-4">
              <p className="text-sm font-medium text-foreground">Editar rango</p>
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <FieldLabel>Rango</FieldLabel>
                  <Select
                    value={selectedRankId ?? ""}
                    onChange={(e) => setSelectedRankId(Number(e.target.value))}
                    disabled={busy}
                  >
                    <option value="" disabled>
                      Seleccionar…
                    </option>
                    {ranks
                      .slice()
                      .sort((a, b) => (a.sortOrder - b.sortOrder) || (a.id - b.id))
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (sortOrder: {r.sortOrder})
                        </option>
                      ))}
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel>Nombre</FieldLabel>
                    <Input
                      value={rankEdit.name}
                      onChange={(e) => setRankEdit((s) => ({ ...s, name: e.target.value }))}
                      disabled={busy || !selectedRank}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Sort order</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={rankEdit.sortOrder}
                      onChange={(e) => setRankEdit((s) => ({ ...s, sortOrder: e.target.value }))}
                      disabled={busy || !selectedRank}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={onUpdateRank}
                  disabled={busy || !selectedRankId || !rankEdit.name.trim()}
                  className="w-full"
                >
                  Guardar cambios
                </Button>
              </div>
            </ControlBase>

            <ControlBase className="p-4">
              <p className="text-sm font-medium text-foreground">Crear rango</p>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel>Nombre</FieldLabel>
                    <Input
                      value={rankNew.name}
                      onChange={(e) => setRankNew((s) => ({ ...s, name: e.target.value }))}
                      disabled={busy}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Sort order</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={rankNew.sortOrder}
                      onChange={(e) => setRankNew((s) => ({ ...s, sortOrder: e.target.value }))}
                      disabled={busy}
                    />
                  </div>
                </div>

                <Button type="button" onClick={onCreateRank} disabled={busy || !rankNew.name.trim()} className="w-full">
                  Crear
                </Button>
              </div>
            </ControlBase>
          </div>
        </Card>
      </div>
    </div>
  );
}

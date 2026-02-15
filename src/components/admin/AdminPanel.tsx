"use client";

import * as React from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  rankId?: number | null;
  rank?: { id: number; name: string } | null;
  category?: string | null;
  division?: string | null;
  steamName?: string | null;
  whatsappName?: string | null;
  phoneNumber?: string | null;
  discord?: string | null;
  deletedAt?: string | null;
};

type Course = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  type?: string | null;
  requiresAllPreviousAscenso?: boolean;
};

type Rank = {
  id: number;
  name: string;
  sortOrder: number;
};

type ApprovedCourseRow = {
  id: number;
  approvedAt: string;
  course: Course;
};

type UnlockRow = {
  id: number;
  course: Course;
};

type PrerequisiteRow = {
  id: number;
  prerequisite: Course;
};

async function apiFetch<T>(
  url: string,
  opts: {
    accessToken: string;
    method?: string;
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

  return (await res.json()) as T;
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
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [ranks, setRanks] = React.useState<Rank[]>([]);

  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = React.useState<number | null>(null);
  const [selectedRankId, setSelectedRankId] = React.useState<number | null>(null);

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;
  const selectedRank = ranks.find((r) => r.id === selectedRankId) ?? null;

  const [userPatch, setUserPatch] = React.useState<Partial<User>>({});

  const [coursePatch, setCoursePatch] = React.useState<Partial<Course>>({});
  const [rankPatch, setRankPatch] = React.useState<Partial<Rank>>({});

  const [approved, setApproved] = React.useState<ApprovedCourseRow[]>([]);
  const [available, setAvailable] = React.useState<Course[]>([]);

  const [prereqs, setPrereqs] = React.useState<PrerequisiteRow[]>([]);
  const [prereqToAddId, setPrereqToAddId] = React.useState<number | null>(null);

  const [unlocks, setUnlocks] = React.useState<UnlockRow[]>([]);
  const [unlockToAddCourseId, setUnlockToAddCourseId] = React.useState<number | null>(null);

  const [newCourse, setNewCourse] = React.useState<Partial<Course>>({
    code: "",
    name: "",
    type: null,
    requiresAllPreviousAscenso: false,
  });

  const [newRank, setNewRank] = React.useState<Partial<Rank>>({
    name: "",
    sortOrder: 0,
  });

  const loadBase = React.useCallback(async () => {
    if (!accessToken) return;
    setError(null);
    setBusy(true);
    try {
      const [u, c, r] = await Promise.all([
        apiFetch<User[]>(`${backendBaseUrl}/users?includeDeleted=true`, { accessToken }),
        apiFetch<Course[]>(`${backendBaseUrl}/courses`, { accessToken }),
        apiFetch<Rank[]>(`${backendBaseUrl}/ranks`, { accessToken }),
      ]);
      setUsers(u);
      setCourses(c);
      setRanks(r);

      if (u.length && selectedUserId == null) setSelectedUserId(u[0].id);
      if (c.length && selectedCourseId == null) setSelectedCourseId(c[0].id);
      if (r.length && selectedRankId == null) setSelectedRankId(r[0].id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, selectedUserId, selectedCourseId, selectedRankId]);

  React.useEffect(() => {
    loadBase();
  }, [loadBase]);

  const seedRanks = React.useCallback(async () => {
    if (!accessToken) return;
    setError(null);
    setBusy(true);
    try {
      // Source: Frontend About -> RankTables
      const ranksToSeed: Array<{ name: string; sortOrder: number }> = [
        { name: "Coronel", sortOrder: 15 },
        { name: "Teniente Coronel", sortOrder: 14 },
        { name: "Mayor", sortOrder: 13 },
        { name: "Capitán", sortOrder: 12 },
        { name: "Comandante del Aire", sortOrder: 12 },

        { name: "Teniente Primero", sortOrder: 11 },
        { name: "Teniente Segundo", sortOrder: 10 },
        { name: "Sargento Mayor", sortOrder: 9 },
        { name: "Sargento Maestro", sortOrder: 8 },
        { name: "Sargento Primero", sortOrder: 7 },
        { name: "Sargento", sortOrder: 6 },
        { name: "Cabo Primero", sortOrder: 5 },
        { name: "Cabo", sortOrder: 4 },
        { name: "Soldado de Primera", sortOrder: 3 },
        { name: "Soldado", sortOrder: 2 },
        { name: "Recluta", sortOrder: 1 },
        { name: "Aspirante", sortOrder: 0 },

        { name: "Primer Teniente", sortOrder: 11 },
        { name: "Teniente Piloto", sortOrder: 10 },
        { name: "Sargento Técnico", sortOrder: 7 },
        { name: "Sargento de Personal", sortOrder: 6 },
        { name: "Piloto Primero", sortOrder: 5 },
        { name: "Piloto", sortOrder: 4 },
        { name: "Cadete de Primera", sortOrder: 3 },
        { name: "Cadete", sortOrder: 2 },
      ];

      await apiFetch(`${backendBaseUrl}/ranks/bulk`, {
        accessToken,
        method: "POST",
        body: { ranks: ranksToSeed },
      });

      await loadBase();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, loadBase]);

  React.useEffect(() => {
    setUserPatch({});
  }, [selectedUserId]);

  React.useEffect(() => {
    setCoursePatch({});
    setPrereqToAddId(null);
  }, [selectedCourseId]);

  React.useEffect(() => {
    setRankPatch({});
    setUnlockToAddCourseId(null);
  }, [selectedRankId]);

  const loadUserCourses = React.useCallback(async () => {
    if (!accessToken || !selectedUserId) return;
    setError(null);
    setBusy(true);
    try {
      const [a, v] = await Promise.all([
        apiFetch<ApprovedCourseRow[]>(
          `${backendBaseUrl}/users/${selectedUserId}/courses/approved`,
          { accessToken },
        ),
        apiFetch<Course[]>(
          `${backendBaseUrl}/users/${selectedUserId}/courses/available`,
          { accessToken },
        ),
      ]);
      setApproved(a);
      setAvailable(v);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, selectedUserId]);

  React.useEffect(() => {
    loadUserCourses();
  }, [loadUserCourses]);

  const loadPrereqs = React.useCallback(async () => {
    if (!accessToken || !selectedCourseId) return;
    setError(null);
    setBusy(true);
    try {
      const rows = await apiFetch<PrerequisiteRow[]>(
        `${backendBaseUrl}/courses/${selectedCourseId}/prerequisites`,
        { accessToken },
      );
      setPrereqs(rows);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, selectedCourseId]);

  React.useEffect(() => {
    loadPrereqs();
  }, [loadPrereqs]);

  const loadUnlocks = React.useCallback(async () => {
    if (!accessToken || !selectedRankId) return;
    setError(null);
    setBusy(true);
    try {
      const rows = await apiFetch<UnlockRow[]>(
        `${backendBaseUrl}/ranks/${selectedRankId}/unlocks`,
        { accessToken },
      );
      setUnlocks(rows);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, selectedRankId]);

  React.useEffect(() => {
    loadUnlocks();
  }, [loadUnlocks]);

  if (!accessToken) {
    return (
      <div className="rounded-2xl border border-foreground/10 bg-background p-6">
        <p className="text-sm text-foreground/70">Sesión inválida o sin token.</p>
      </div>
    );
  }

  const onSaveUser = async () => {
    if (!selectedUserId) return;
    if (Object.keys(userPatch).length === 0) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch<User>(`${backendBaseUrl}/users/${selectedUserId}`, {
        accessToken,
        method: "PATCH",
        body: userPatch,
      });
      await loadBase();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onDeactivateUser = async () => {
    if (!selectedUserId) return;
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

  const onRestoreUser = async () => {
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

  const onApprove = async (courseId: number) => {
    if (!selectedUserId) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`${backendBaseUrl}/users/${selectedUserId}/courses/approved`, {
        accessToken,
        method: "POST",
        body: { courseId },
      });
      await loadUserCourses();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onUnapprove = async (courseId: number) => {
    if (!selectedUserId) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`${backendBaseUrl}/users/${selectedUserId}/courses/approved/${courseId}`, {
        accessToken,
        method: "DELETE",
      });
      await loadUserCourses();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onCreateCourse = async () => {
    setError(null);
    setBusy(true);
    try {
      await apiFetch<Course>(`${backendBaseUrl}/courses`, {
        accessToken,
        method: "POST",
        body: {
          code: String(newCourse.code ?? "").trim(),
          name: String(newCourse.name ?? "").trim(),
          type: newCourse.type ?? null,
          requiresAllPreviousAscenso: Boolean(newCourse.requiresAllPreviousAscenso),
          description: newCourse.description ?? null,
        },
      });
      setNewCourse({ code: "", name: "", type: null, requiresAllPreviousAscenso: false });
      await loadBase();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onSaveCourse = async () => {
    if (!selectedCourseId) return;
    if (Object.keys(coursePatch).length === 0) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch<Course>(`${backendBaseUrl}/courses/${selectedCourseId}`, {
        accessToken,
        method: "PATCH",
        body: coursePatch,
      });
      setCoursePatch({});
      await loadBase();
      await loadPrereqs();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onDeleteCourse = async () => {
    if (!selectedCourseId) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`${backendBaseUrl}/courses/${selectedCourseId}`, {
        accessToken,
        method: "DELETE",
      });
      setSelectedCourseId(null);
      setPrereqs([]);
      await loadBase();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onAddPrereq = async () => {
    if (!selectedCourseId || !prereqToAddId) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`${backendBaseUrl}/courses/${selectedCourseId}/prerequisites`, {
        accessToken,
        method: "POST",
        body: { prerequisiteCourseId: prereqToAddId },
      });
      setPrereqToAddId(null);
      await loadPrereqs();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onRemovePrereq = async (prerequisiteCourseId: number) => {
    if (!selectedCourseId) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(
        `${backendBaseUrl}/courses/${selectedCourseId}/prerequisites/${prerequisiteCourseId}`,
        { accessToken, method: "DELETE" },
      );
      await loadPrereqs();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onCreateRank = async () => {
    setError(null);
    setBusy(true);
    try {
      await apiFetch<Rank>(`${backendBaseUrl}/ranks`, {
        accessToken,
        method: "POST",
        body: {
          name: String(newRank.name ?? "").trim(),
          sortOrder: Number(newRank.sortOrder ?? 0),
        },
      });
      setNewRank({ name: "", sortOrder: 0 });
      await loadBase();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onSaveRank = async () => {
    if (!selectedRankId) return;
    if (Object.keys(rankPatch).length === 0) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch<Rank>(`${backendBaseUrl}/ranks/${selectedRankId}`, {
        accessToken,
        method: "PATCH",
        body: rankPatch,
      });
      setRankPatch({});
      await loadBase();
      await loadUnlocks();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onDeleteRank = async () => {
    if (!selectedRankId) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`${backendBaseUrl}/ranks/${selectedRankId}`, {
        accessToken,
        method: "DELETE",
      });
      setSelectedRankId(null);
      setUnlocks([]);
      await loadBase();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onAddUnlock = async () => {
    if (!selectedRankId || !unlockToAddCourseId) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`${backendBaseUrl}/ranks/${selectedRankId}/unlocks`, {
        accessToken,
        method: "POST",
        body: { courseId: unlockToAddCourseId },
      });
      setUnlockToAddCourseId(null);
      await loadUnlocks();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onRemoveUnlock = async (courseId: number) => {
    if (!selectedRankId) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`${backendBaseUrl}/ranks/${selectedRankId}/unlocks/${courseId}`, {
        accessToken,
        method: "DELETE",
      });
      await loadUnlocks();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-2xl border border-foreground/10 bg-background p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-foreground/10 bg-background p-6">
        <p className="text-xs font-semibold tracking-[0.30em] text-foreground/60 uppercase">
          Estado
        </p>
        <p className="mt-2 text-sm text-foreground/70">
          {busy ? "Cargando…" : "Listo"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-foreground/10 bg-background p-6">
          <h3 className="text-sm font-semibold tracking-[0.30em] text-foreground uppercase">
            Usuarios
          </h3>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-semibold text-foreground/70">Seleccionar</span>
              <select
                className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                value={selectedUserId ?? ""}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    #{u.id} {u.name} ({u.email}){u.deletedAt ? " [BAJA]" : ""}
                  </option>
                ))}
              </select>
            </label>

            {selectedUser ? (
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-foreground/70">Nombre</span>
                    <input
                      className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                      defaultValue={selectedUser.name}
                      onChange={(e) => setUserPatch((p) => ({ ...p, name: e.target.value }))}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-foreground/70">Email</span>
                    <input
                      className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                      defaultValue={selectedUser.email}
                      onChange={(e) => setUserPatch((p) => ({ ...p, email: e.target.value }))}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-foreground/70">Rol</span>
                    <select
                      className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                      defaultValue={selectedUser.role}
                      onChange={(e) => setUserPatch((p) => ({ ...p, role: e.target.value }))}
                    >
                      <option value="user">user</option>
                      <option value="moderator">moderator</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-foreground/70">Rank ID</span>
                    <select
                      className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                      value={
                        (userPatch.rankId ?? selectedUser.rankId ?? "") as any
                      }
                      onChange={(e) =>
                        setUserPatch((p) => ({
                          ...p,
                          rankId: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    >
                      <option value="">(sin rango)</option>
                      {ranks.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className="h-10 rounded-xl border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold"
                    onClick={onSaveUser}
                    disabled={busy}
                  >
                    Guardar cambios
                  </button>

                  <button
                    className="h-10 rounded-xl border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold"
                    onClick={onDeactivateUser}
                    disabled={busy}
                  >
                    Dar de baja
                  </button>

                  <button
                    className="h-10 rounded-xl border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold"
                    onClick={onRestoreUser}
                    disabled={busy}
                  >
                    Levantar (restore)
                  </button>
                </div>

                <p className="text-xs text-foreground/60">
                  Estado: {selectedUser.deletedAt ? "Baja" : "Activo"}
                </p>

                <p className="text-xs text-foreground/60">
                  Rango actual: {selectedUser.rank?.name ?? "(sin rango)"}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-background p-6">
          <h3 className="text-sm font-semibold tracking-[0.30em] text-foreground uppercase">
            Aprobaciones de cursos
          </h3>

          {selectedUser ? (
            <div className="mt-4 grid gap-6">
              <div>
                <p className="text-xs font-semibold text-foreground/70">Aprobados</p>
                <div className="mt-2 space-y-2">
                  {approved.length ? (
                    approved.map((row) => (
                      <div
                        key={row.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-foreground/10 bg-background px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {row.course.code} — {row.course.name}
                          </p>
                          <p className="text-xs text-foreground/60">{new Date(row.approvedAt).toLocaleString()}</p>
                        </div>
                        <button
                          className="h-9 rounded-xl border border-foreground/10 bg-foreground/5 px-3 text-sm font-semibold"
                          onClick={() => onUnapprove(row.course.id)}
                          disabled={busy}
                        >
                          Quitar
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-foreground/60">Sin cursos aprobados.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground/70">Disponibles</p>
                <div className="mt-2 space-y-2">
                  {available.length ? (
                    available.map((course) => (
                      <div
                        key={course.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-foreground/10 bg-background px-4 py-3"
                      >
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">{course.code}</span> — {course.name}
                        </p>
                        <button
                          className="h-9 rounded-xl border border-foreground/10 bg-foreground/5 px-3 text-sm font-semibold"
                          onClick={() => onApprove(course.id)}
                          disabled={busy}
                        >
                          Marcar aprobado
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-foreground/60">Sin cursos disponibles.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-foreground/10 bg-background p-6">
          <h3 className="text-sm font-semibold tracking-[0.30em] text-foreground uppercase">
            Cursos
          </h3>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-foreground/70">Código</span>
                <input
                  className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                  value={String(newCourse.code ?? "")}
                  onChange={(e) => setNewCourse((p) => ({ ...p, code: e.target.value }))}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-foreground/70">Nombre</span>
                <input
                  className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                  value={String(newCourse.name ?? "")}
                  onChange={(e) => setNewCourse((p) => ({ ...p, name: e.target.value }))}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-foreground/70">Tipo</span>
                <select
                  className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                  value={String(newCourse.type ?? "")}
                  onChange={(e) =>
                    setNewCourse((p) => ({
                      ...p,
                      type: e.target.value ? e.target.value : null,
                    }))
                  }
                >
                  <option value="">(sin tipo)</option>
                  <option value="ascenso">ascenso</option>
                  <option value="especialidad">especialidad</option>
                </select>
              </label>

              <label className="flex items-center gap-3 pt-7">
                <input
                  type="checkbox"
                  checked={Boolean(newCourse.requiresAllPreviousAscenso)}
                  onChange={(e) =>
                    setNewCourse((p) => ({
                      ...p,
                      requiresAllPreviousAscenso: e.target.checked,
                    }))
                  }
                />
                <span className="text-xs font-semibold text-foreground/70">TODOS (ascensos anteriores)</span>
              </label>
            </div>

            <button
              className="h-10 rounded-xl border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold"
              onClick={onCreateCourse}
              disabled={busy}
            >
              Crear curso
            </button>

            <div className="h-px bg-foreground/10" />

            <label className="grid gap-2">
              <span className="text-xs font-semibold text-foreground/70">Seleccionar curso</span>
              <select
                className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                value={selectedCourseId ?? ""}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedCourse ? (
              <div className="grid gap-3">
                <p className="text-xs text-foreground/60">
                  Curso: <span className="font-semibold">{selectedCourse.code}</span>
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-foreground/70">Código</span>
                    <input
                      className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                      defaultValue={selectedCourse.code}
                      onChange={(e) => setCoursePatch((p) => ({ ...p, code: e.target.value }))}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-foreground/70">Nombre</span>
                    <input
                      className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                      defaultValue={selectedCourse.name}
                      onChange={(e) => setCoursePatch((p) => ({ ...p, name: e.target.value }))}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-foreground/70">Tipo</span>
                    <select
                      className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                      defaultValue={selectedCourse.type ?? ""}
                      onChange={(e) =>
                        setCoursePatch((p) => ({
                          ...p,
                          type: e.target.value ? e.target.value : null,
                        }))
                      }
                    >
                      <option value="">(sin tipo)</option>
                      <option value="ascenso">ascenso</option>
                      <option value="especialidad">especialidad</option>
                    </select>
                  </label>

                  <label className="flex items-center gap-3 pt-7">
                    <input
                      type="checkbox"
                      defaultChecked={Boolean(selectedCourse.requiresAllPreviousAscenso)}
                      onChange={(e) =>
                        setCoursePatch((p) => ({
                          ...p,
                          requiresAllPreviousAscenso: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-xs font-semibold text-foreground/70">TODOS</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className="h-10 rounded-xl border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold"
                    onClick={onSaveCourse}
                    disabled={busy}
                  >
                    Guardar curso
                  </button>
                  <button
                    className="h-10 rounded-xl border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold"
                    onClick={onDeleteCourse}
                    disabled={busy}
                  >
                    Eliminar curso
                  </button>
                </div>

                <div className="grid gap-2">
                  <p className="text-xs font-semibold text-foreground/70">Prerequisitos</p>

                  <div className="flex flex-wrap gap-3">
                    <select
                      className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                      value={prereqToAddId ?? ""}
                      onChange={(e) => setPrereqToAddId(Number(e.target.value))}
                    >
                      <option value="">Seleccionar…</option>
                      {courses
                        .filter((c) => c.id !== selectedCourse.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} — {c.name}
                          </option>
                        ))}
                    </select>
                    <button
                      className="h-10 rounded-xl border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold"
                      onClick={onAddPrereq}
                      disabled={busy}
                    >
                      Agregar
                    </button>
                  </div>

                  <div className="mt-2 space-y-2">
                    {prereqs.length ? (
                      prereqs.map((row) => (
                        <div
                          key={row.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-foreground/10 bg-background px-4 py-3"
                        >
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">{row.prerequisite.code}</span> — {row.prerequisite.name}
                          </p>
                          <button
                            className="h-9 rounded-xl border border-foreground/10 bg-foreground/5 px-3 text-sm font-semibold"
                            onClick={() => onRemovePrereq(row.prerequisite.id)}
                            disabled={busy}
                          >
                            Quitar
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-foreground/60">Sin prerequisitos.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-background p-6">
          <h3 className="text-sm font-semibold tracking-[0.30em] text-foreground uppercase">
            Rangos
          </h3>

          <div className="mt-4 grid gap-4">
            <button
              className="h-10 rounded-xl border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold"
              onClick={seedRanks}
              disabled={busy}
            >
              Cargar rangos (Sobre nosotros)
            </button>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-foreground/70">Nombre</span>
                <input
                  className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                  value={String(newRank.name ?? "")}
                  onChange={(e) => setNewRank((p) => ({ ...p, name: e.target.value }))}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-foreground/70">Sort order</span>
                <input
                  className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                  inputMode="numeric"
                  value={String(newRank.sortOrder ?? 0)}
                  onChange={(e) => setNewRank((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                />
              </label>
            </div>

            <button
              className="h-10 rounded-xl border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold"
              onClick={onCreateRank}
              disabled={busy}
            >
              Crear rango
            </button>

            <div className="h-px bg-foreground/10" />

            <label className="grid gap-2">
              <span className="text-xs font-semibold text-foreground/70">Seleccionar rango</span>
              <select
                className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                value={selectedRankId ?? ""}
                onChange={(e) => setSelectedRankId(Number(e.target.value))}
              >
                {ranks.map((r) => (
                  <option key={r.id} value={r.id}>
                    #{r.id} {r.name} (sort {r.sortOrder})
                  </option>
                ))}
              </select>
            </label>

            {selectedRank ? (
              <div className="grid gap-3">
                <p className="text-xs text-foreground/60">
                  Rango: <span className="font-semibold">{selectedRank.name}</span>
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-foreground/70">Nombre</span>
                    <input
                      className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                      defaultValue={selectedRank.name}
                      onChange={(e) => setRankPatch((p) => ({ ...p, name: e.target.value }))}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-foreground/70">Sort order</span>
                    <input
                      className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                      inputMode="numeric"
                      defaultValue={String(selectedRank.sortOrder)}
                      onChange={(e) =>
                        setRankPatch((p) => ({
                          ...p,
                          sortOrder: Number(e.target.value),
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className="h-10 rounded-xl border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold"
                    onClick={onSaveRank}
                    disabled={busy}
                  >
                    Guardar rango
                  </button>
                  <button
                    className="h-10 rounded-xl border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold"
                    onClick={onDeleteRank}
                    disabled={busy}
                  >
                    Eliminar rango
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                    value={unlockToAddCourseId ?? ""}
                    onChange={(e) => setUnlockToAddCourseId(Number(e.target.value))}
                  >
                    <option value="">Seleccionar curso…</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="h-10 rounded-xl border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold"
                    onClick={onAddUnlock}
                    disabled={busy}
                  >
                    Asignar unlock
                  </button>
                </div>

                <div className="mt-2 space-y-2">
                  {unlocks.length ? (
                    unlocks.map((row) => (
                      <div
                        key={row.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-foreground/10 bg-background px-4 py-3"
                      >
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">{row.course.code}</span> — {row.course.name}
                        </p>
                        <button
                          className="h-9 rounded-xl border border-foreground/10 bg-foreground/5 px-3 text-sm font-semibold"
                          onClick={() => onRemoveUnlock(row.course.id)}
                          disabled={busy}
                        >
                          Quitar
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-foreground/60">Sin unlocks.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

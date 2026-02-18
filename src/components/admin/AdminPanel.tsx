"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { Progress } from "@/components/ui/progress";
import { motion } from "motion/react";
import { resolveRankImage } from "@/lib/rank-images";
import { Ban, CheckCircle2, Crown, Pencil, RotateCcw, Shield, User as UserIcon } from "lucide-react";

type UserRole = "super_admin" | "moderator" | "infraestructura" | "formacion" | "user";

type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  rankId?: number | null;
  rank?: { id: number; name: string } | null;
  division?: string | null;
  missionAttendanceCount?: number;
  trainingAttendanceCount?: number;
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
  type?: "ascenso" | "especialidad" | null;
  requiresAllPreviousAscenso?: boolean;
};

type ApprovedCourseRow = {
  id: number;
  approvedAt: string;
  course: Course;
};

type RankUnlockRow = {
  id: number;
  createdAt: string;
  note?: string | null;
  course: Course;
};

type CourseInstructorRow = {
  id: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
};

type AttendanceType = "mission" | "training";

type AttendanceSessionSummary = {
  id: number;
  date: string;
  type: AttendanceType;
  presentCount: number;
};

type AttendanceSessionUsers = {
  session: {
    id: number;
    date: string;
    type: AttendanceType;
  };
  presentCount: number;
  users: Array<{
    id: number;
    name: string;
    email: string;
    deletedAt?: string | null;
    present: boolean;
  }>;
};

type AuditEvent = {
  id: string;
  at: string;
  action: string;
  detail?: string;
};

const adminBackgroundOptions = [
  { label: "Táctico 1", value: "20260205002446_1.jpg" },
  { label: "Táctico 2", value: "20260212004024_1.jpg" },
  { label: "Táctico 3", value: "20260123233043_1.jpg" },
];

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

const normalizeKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();

// Rank images are resolved via shared helper to match the canonical mapping in "Sobre nosotros".

function guessRankCategory(rankName: string): string {
  const key = normalizeKey(rankName);

  const altoMando = new Set([
    "CORONEL",
    "TENIENTECORONEL",
    "MAYOR",
    "CAPITAN",
    "COMANDANTEDELAIRE",
  ]);
  if (altoMando.has(key)) return "Alto Mando";

  const oficiales = new Set([
    "TENIENTEPRIMERO",
    "TENIENTESEGUNDO",
    "PRIMERTENIENTE",
    "TENIENTEPILOTO",
  ]);
  if (oficiales.has(key)) return "Oficiales";

  const suboficiales = new Set([
    "SARGENTOMAYOR",
    "SARGENTOMAESTRO",
    "SARGENTOPRIMERO",
    "SARGENTOTECNICO",
    "SARGENTODEPERSONAL",
    "SARGENTO",
    "CABOPRIMERO",
    "CABO",
    "PILOTOPRIMERO",
    "PILOTO",
  ]);
  if (suboficiales.has(key)) return "Suboficiales";

  const enlistados = new Set([
    "SOLDADODEPRIMERA",
    "SOLDADODEPRIMERO",
    "SOLDADO",
    "RECLUTA",
    "ASPIRANTE",
    "CADETEDEPRIMERA",
    "CADETEDEPRIMERO",
    "CADETE",
  ]);
  if (enlistados.has(key)) return "Enlistados";

  return "";
}

function RankInsigniaCell({ rankName }: { rankName: string }) {
  const src = resolveRankImage(rankName, null);

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-12 w-12">
        <Image src={src} alt={`Insignia ${rankName}`} fill sizes="48px" className="object-contain" />
      </div>
    </div>
  );
}

type AdminSection = "users" | "courses" | "divisions" | "ranks" | "attendance" | "audit" | "settings";

type AdminPanelMode = "full" | "attendanceOnly";

function initials(name: string) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const a = parts[0]?.[0] ?? "U";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-foreground/10 bg-background/30 px-2.5 py-1 text-[11px] font-medium text-foreground/80",
        className,
      )}
    >
      {children}
    </span>
  );
}

function IconPill({
  icon,
  children,
  className,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Pill className={cn("gap-1.5", className)}>
      <span className="inline-flex h-4 w-4 items-center justify-center">{icon}</span>
      {children}
    </Pill>
  );
}

function IconButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-foreground/10",
        "bg-background/30 text-foreground/80 backdrop-blur transition-colors",
        "hover:bg-foreground/5 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === "super_admin") {
    return (
      <IconPill icon={<Crown className="h-3.5 w-3.5" />} className="border-leader/30 bg-leader/15 text-foreground">
        SUPER ADMIN
      </IconPill>
    );
  }

  if (role === "moderator") {
    return (
      <IconPill icon={<Shield className="h-3.5 w-3.5" />} className="border-foreground/15 bg-foreground/10 text-foreground">
        MODERATOR
      </IconPill>
    );
  }

  if (role === "infraestructura") {
    return (
      <IconPill icon={<Shield className="h-3.5 w-3.5" />} className="border-foreground/15 bg-foreground/10 text-foreground">
        INFRA
      </IconPill>
    );
  }

  if (role === "formacion") {
    return (
      <IconPill icon={<Shield className="h-3.5 w-3.5" />} className="border-foreground/15 bg-foreground/10 text-foreground">
        FORMACIÓN
      </IconPill>
    );
  }

  return (
    <IconPill icon={<UserIcon className="h-3.5 w-3.5" />} className="text-foreground/80">
      USER
    </IconPill>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <IconPill
      icon={<CheckCircle2 className="h-3.5 w-3.5" />}
      className="border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
    >
      ACTIVO
    </IconPill>
  ) : (
    <IconPill icon={<Ban className="h-3.5 w-3.5" />} className="border-reserve/30 bg-reserve/15 text-reserve">
      INACTIVO
    </IconPill>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background/20 backdrop-blur px-4 py-3">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-foreground/60 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function AdminPanel({
  backendBaseUrl,
  accessToken,
  mode = "full",
}: {
  backendBaseUrl: string;
  accessToken?: string;
  mode?: AdminPanelMode;
}) {
  const USERS_PAGE_SIZE = 10;

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [activeSection, setActiveSection] = React.useState<AdminSection>(
    mode === "attendanceOnly" ? "attendance" : "users",
  );

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

  const [missionAttendanceDraft, setMissionAttendanceDraft] = React.useState<string>("0");
  const [trainingAttendanceDraft, setTrainingAttendanceDraft] = React.useState<string>("0");

  const [approvedRows, setApprovedRows] = React.useState<ApprovedCourseRow[]>([]);
  const approvedCourseIds = React.useMemo(() => {
    return new Set(
      approvedRows
        .map((r) => r.course?.id)
        .filter((id): id is number => typeof id === "number"),
    );
  }, [approvedRows]);

  const [courseToToggleId, setCourseToToggleId] = React.useState<number | "">("");

  const [userSearch, setUserSearch] = React.useState("");
  const [userRoleFilter, setUserRoleFilter] = React.useState<UserRole | "all">("all");
  const [userStatusFilter, setUserStatusFilter] = React.useState<"all" | "active" | "inactive">("all");
  const [userDivisionFilter, setUserDivisionFilter] = React.useState<string | "all">("all");

  const [userPage, setUserPage] = React.useState(1);

  const [adminBackground, setAdminBackground] = React.useState<string>(adminBackgroundOptions[0]?.value ?? "20260205002446_1.jpg");
  const [auditEvents, setAuditEvents] = React.useState<AuditEvent[]>([]);

  const [courseEdit, setCourseEdit] = React.useState<{ code: string; name: string; description: string }>(
    { code: "", name: "", description: "" },
  );
  const [courseNew, setCourseNew] = React.useState<{ code: string; name: string; description: string }>(
    { code: "", name: "", description: "" },
  );

  const [courseInstructors, setCourseInstructors] = React.useState<CourseInstructorRow[]>([]);
  const [courseInstructorUserId, setCourseInstructorUserId] = React.useState<number | "">("");

  const [rankEdit, setRankEdit] = React.useState<{ name: string; sortOrder: string }>(
    { name: "", sortOrder: "0" },
  );
  const [rankNew, setRankNew] = React.useState<{ name: string; sortOrder: string }>(
    { name: "", sortOrder: "0" },
  );

  const [rankUnlocks, setRankUnlocks] = React.useState<RankUnlockRow[]>([]);
  const [rankUnlockCourseId, setRankUnlockCourseId] = React.useState<number | "">("");

  const [attendanceSessions, setAttendanceSessions] = React.useState<AttendanceSessionSummary[]>([]);
  const [attendanceSelectedDate, setAttendanceSelectedDate] = React.useState<string>("");
  const [attendanceSelectedType, setAttendanceSelectedType] = React.useState<AttendanceType>("mission");
  const [attendanceSessionUsers, setAttendanceSessionUsers] = React.useState<AttendanceSessionUsers | null>(null);
  const [attendanceIncludeInactive, setAttendanceIncludeInactive] = React.useState(false);
  const [attendanceUserSearch, setAttendanceUserSearch] = React.useState("");
  const [attendanceChartRange, setAttendanceChartRange] = React.useState<"week" | "month" | "year">("week");

  const toDateStringLocal = React.useCallback((d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const startOfWeekLocal = React.useCallback(
    (d: Date) => {
      const day = d.getDay();
      const mondayOffset = (day + 6) % 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - mondayOffset);
      monday.setHours(0, 0, 0, 0);
      return monday;
    },
    [],
  );

  const endOfWeekLocal = React.useCallback(
    (d: Date) => {
      const monday = startOfWeekLocal(d);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(0, 0, 0, 0);
      return sunday;
    },
    [startOfWeekLocal],
  );

  const endOfMonthLocal = React.useCallback((d: Date) => {
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    last.setHours(0, 0, 0, 0);
    return last;
  }, []);

  const rangeBounds = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (attendanceChartRange === "week") {
      const start = toDateStringLocal(startOfWeekLocal(today));
      const end = toDateStringLocal(endOfWeekLocal(today));
      return { start, end };
    }

    if (attendanceChartRange === "month") {
      const start = toDateStringLocal(new Date(today.getFullYear(), today.getMonth(), 1));
      const end = toDateStringLocal(endOfMonthLocal(today));
      return { start, end };
    }

    // "Año": para no confundir con meses futuros, mostramos/permitimos hasta fin del mes actual.
    const start = toDateStringLocal(new Date(today.getFullYear(), 0, 1));
    const end = toDateStringLocal(endOfMonthLocal(today));
    return { start, end };
  }, [attendanceChartRange, endOfMonthLocal, endOfWeekLocal, startOfWeekLocal, toDateStringLocal]);

  const formatDateLabel = React.useCallback((dateString: string) => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;
    const d = new Date(`${dateString}T00:00:00.000Z`);
    const dow = days[d.getUTCDay()] ?? "";
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${dow} ${dd}/${mm}`;
  }, []);

  const getWeekDate = React.useCallback(
    (weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
      // Monday-based week
      const today = new Date();
      const day = today.getDay();
      const mondayOffset = (day + 6) % 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() - mondayOffset);
      const target = new Date(monday);
      target.setDate(monday.getDate() + ((weekday + 7 - 1) % 7));
      return toDateStringLocal(target);
    },
    [toDateStringLocal],
  );

  const attendanceSelectedSessionId = React.useMemo(() => {
    if (!attendanceSelectedDate) return null;
    const found = attendanceSessions.find(
      (s) => s.date === attendanceSelectedDate && s.type === attendanceSelectedType,
    );
    return found?.id ?? null;
  }, [attendanceSelectedDate, attendanceSelectedType, attendanceSessions]);

  const attendanceDatesInRange = React.useMemo(() => {
    const dates = Array.from(new Set(attendanceSessions.map((s) => s.date)));
    return dates
      .filter((d) => d >= rangeBounds.start && d <= rangeBounds.end)
      .sort((a, b) => b.localeCompare(a));
  }, [attendanceSessions, rangeBounds.end, rangeBounds.start]);

  React.useEffect(() => {
    if (!attendanceDatesInRange.length) return;
    setAttendanceSelectedDate((prev) => {
      if (prev && attendanceDatesInRange.includes(prev)) return prev;
      return attendanceDatesInRange[0];
    });
  }, [attendanceDatesInRange]);

  const loadBase = React.useCallback(async () => {
    if (!accessToken || mode !== "full") return;
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
  }, [accessToken, backendBaseUrl, mode, selectedUserId, selectedCourseId, selectedRankId]);

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

  const loadCourseInstructors = React.useCallback(async () => {
    if (!accessToken || mode !== "full" || !selectedCourseId) {
      setCourseInstructors([]);
      setCourseInstructorUserId("");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const rows = await apiFetch<CourseInstructorRow[]>(
        `${backendBaseUrl}/courses/${selectedCourseId}/instructors`,
        { accessToken },
      );
      setCourseInstructors(rows);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, mode, selectedCourseId]);

  React.useEffect(() => {
    if (mode !== "full") return;
    loadBase();
  }, [loadBase, mode]);

  React.useEffect(() => {
    if (mode !== "full") return;
    loadCourseInstructors();
  }, [loadCourseInstructors, mode]);

  React.useEffect(() => {
    if (!selectedUser) {
      setRoleDraft("");
      setRankIdDraft("");
      setCourseToToggleId("");
      setMissionAttendanceDraft("0");
      setTrainingAttendanceDraft("0");
      return;
    }
    setRoleDraft(selectedUser.role ?? "user");
    setRankIdDraft(
      typeof selectedUser.rankId === "number" ? selectedUser.rankId : null,
    );
    setCourseToToggleId("");
    setMissionAttendanceDraft(String(selectedUser.missionAttendanceCount ?? 0));
    setTrainingAttendanceDraft(String(selectedUser.trainingAttendanceCount ?? 0));
  }, [selectedUser]);

  React.useEffect(() => {
    if (!selectedCourse) {
      setCourseEdit({ code: "", name: "", description: "" });
      setCourseInstructors([]);
      setCourseInstructorUserId("");
      return;
    }
    setCourseEdit({
      code: selectedCourse.code ?? "",
      name: selectedCourse.name ?? "",
      description: selectedCourse.description ?? "",
    });
  }, [selectedCourse]);

  const onAddCourseInstructor = async () => {
    if (!accessToken || mode !== "full" || !selectedCourseId) return;
    const userId = Number(courseInstructorUserId);
    if (!Number.isFinite(userId) || userId <= 0) return;

    setError(null);
    setBusy(true);
    try {
      await apiFetch(`${backendBaseUrl}/courses/${selectedCourseId}/instructors`, {
        accessToken,
        method: "POST",
        body: { userId },
      });
      setCourseInstructorUserId("");
      await loadCourseInstructors();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onRemoveCourseInstructor = async (userId: number) => {
    if (!accessToken || mode !== "full" || !selectedCourseId) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(
        `${backendBaseUrl}/courses/${selectedCourseId}/instructors/${userId}`,
        { accessToken, method: "DELETE" },
      );
      await loadCourseInstructors();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  React.useEffect(() => {
    if (!selectedRank) {
      setRankEdit({ name: "", sortOrder: "0" });
      setRankUnlocks([]);
      setRankUnlockCourseId("");
      return;
    }
    setRankEdit({
      name: selectedRank.name ?? "",
      sortOrder: String(selectedRank.sortOrder ?? 0),
    });
    setRankUnlockCourseId("");
  }, [selectedRank]);

  const loadRankUnlocks = React.useCallback(async () => {
    if (!accessToken || !selectedRankId) {
      setRankUnlocks([]);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const rows = await apiFetch<RankUnlockRow[]>(
        `${backendBaseUrl}/ranks/${selectedRankId}/unlocks`,
        { accessToken },
      );
      setRankUnlocks(rows);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, selectedRankId]);

  React.useEffect(() => {
    loadRankUnlocks();
  }, [loadRankUnlocks]);

  const loadAttendanceSessions = React.useCallback(async () => {
    if (!accessToken) {
      setAttendanceSessions([]);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const rows = await apiFetch<AttendanceSessionSummary[]>(
        `${backendBaseUrl}/attendance/sessions`,
        { accessToken },
      );
      setAttendanceSessions(rows);

      const uniqueDatesDesc = Array.from(new Set(rows.map((r) => r.date)));
      if (!uniqueDatesDesc.length) {
        setAttendanceSelectedDate("");
        return;
      }

      const todayStr = toDateStringLocal(new Date());
      const sortedAsc = uniqueDatesDesc.slice().sort((a, b) => a.localeCompare(b));
      const inCurrentRange = sortedAsc.filter(
        (d) => d >= rangeBounds.start && d <= rangeBounds.end,
      );

      const pick = (() => {
        const list = inCurrentRange.length ? inCurrentRange : sortedAsc;
        const nextOrToday = list.find((d) => d >= todayStr);
        if (nextOrToday) return nextOrToday;
        return list.filter((d) => d <= todayStr).slice(-1)[0] ?? list[0];
      })();

      setAttendanceSelectedDate((prev) => {
        if (prev && uniqueDatesDesc.includes(prev)) return prev;
        return pick;
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, rangeBounds.end, rangeBounds.start, toDateStringLocal]);

  const loadAttendanceUsers = React.useCallback(async () => {
    if (!accessToken || !attendanceSelectedSessionId) {
      setAttendanceSessionUsers(null);
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const data = await apiFetch<AttendanceSessionUsers>(
        `${backendBaseUrl}/attendance/sessions/${attendanceSelectedSessionId}/users?includeDeleted=${attendanceIncludeInactive ? "true" : "false"}`,
        { accessToken },
      );
      setAttendanceSessionUsers(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [accessToken, backendBaseUrl, attendanceIncludeInactive, attendanceSelectedSessionId]);

  React.useEffect(() => {
    loadAttendanceSessions();
  }, [loadAttendanceSessions]);

  React.useEffect(() => {
    loadAttendanceUsers();
  }, [loadAttendanceUsers]);

  const filteredAttendanceUsers = React.useMemo(() => {
    if (!attendanceSessionUsers) return [];
    const q = attendanceUserSearch.trim().toLowerCase();
    if (!q) return attendanceSessionUsers.users;
    return attendanceSessionUsers.users.filter((u) => {
      return (
        String(u.name ?? "").toLowerCase().includes(q) ||
        String(u.email ?? "").toLowerCase().includes(q) ||
        String(u.id).includes(q)
      );
    });
  }, [attendanceSessionUsers, attendanceUserSearch]);

  const chartSessions = React.useMemo(() => {
    const byDate = new Map<string, { date: string; mission: number; training: number }>();
    for (const s of attendanceSessions) {
      if (s.date < rangeBounds.start || s.date > rangeBounds.end) continue;
      const row = byDate.get(s.date) ?? { date: s.date, mission: 0, training: 0 };
      if (s.type === "mission") row.mission = s.presentCount;
      else row.training = s.presentCount;
      byDate.set(s.date, row);
    }

    const datesAsc = Array.from(byDate.keys()).sort((a, b) => a.localeCompare(b));
    return datesAsc.map((d) => byDate.get(d)!).filter(Boolean);
  }, [attendanceSessions, rangeBounds.end, rangeBounds.start]);

  React.useEffect(() => {
    loadApproved();
  }, [loadApproved]);

  const divisionOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const u of users) {
      const v = String(u.division ?? "").trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [users]);

  const filteredUsers = React.useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users
      .slice()
      .filter((u) => {
        if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
        if (userStatusFilter === "active" && u.deletedAt) return false;
        if (userStatusFilter === "inactive" && !u.deletedAt) return false;

        const div = String(u.division ?? "");
        if (userDivisionFilter !== "all" && div !== userDivisionFilter) return false;

        if (!q) return true;
        return (
          String(u.name ?? "").toLowerCase().includes(q) ||
          String(u.email ?? "").toLowerCase().includes(q) ||
          String(u.id).includes(q)
        );
      })
      .sort((a, b) => a.id - b.id);
  }, [users, userDivisionFilter, userRoleFilter, userSearch, userStatusFilter]);

  React.useEffect(() => {
    setUserPage(1);
  }, [userSearch, userRoleFilter, userStatusFilter, userDivisionFilter]);

  const userPageCount = React.useMemo(
    () => Math.max(1, Math.ceil(filteredUsers.length / USERS_PAGE_SIZE)),
    [filteredUsers.length],
  );

  React.useEffect(() => {
    setUserPage((p) => Math.min(Math.max(1, p), userPageCount));
  }, [userPageCount]);

  const pagedUsers = React.useMemo(() => {
    const start = (userPage - 1) * USERS_PAGE_SIZE;
    return filteredUsers.slice(start, start + USERS_PAGE_SIZE);
  }, [filteredUsers, userPage]);

  const stats = React.useMemo(() => {
    const divisions = new Set<string>();
    for (const u of users) {
      const v = String(u.division ?? "").trim();
      if (v) divisions.add(v);
    }
    return {
      users: users.length,
      courses: courses.length,
      divisions: divisions.size,
      ranks: ranks.length,
    };
  }, [courses.length, ranks.length, users]);

  const divisionSummary = React.useMemo(() => {
    const byDivision = new Map<string, { division: string; total: number; active: number; inactive: number }>();
    for (const u of users) {
      const division = String(u.division ?? "").trim() || "(Sin división)";
      const row = byDivision.get(division) ?? { division, total: 0, active: 0, inactive: 0 };
      row.total += 1;
      if (u.deletedAt) row.inactive += 1;
      else row.active += 1;
      byDivision.set(division, row);
    }
    return Array.from(byDivision.values()).sort((a, b) => a.division.localeCompare(b.division));
  }, [users]);

  const logAudit = React.useCallback((action: string, detail?: string) => {
    setAuditEvents((prev) => {
      const next: AuditEvent = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        at: new Date().toISOString(),
        action,
        detail,
      };
      return [next, ...prev].slice(0, 100);
    });
  }, []);

  if (!accessToken) {
    return (
      <div className="rounded-2xl border border-foreground/10 bg-background p-6">
        <p className="text-sm text-foreground/70">Sesión inválida o sin token.</p>
      </div>
    );
  }

  const onDeactivate = async (userId?: number) => {
    const id = userId ?? selectedUserId;
    if (!id) return;
    if (!confirm("¿Dar de baja este usuario?") ) return;

    setError(null);
    setBusy(true);
    try {
      await apiFetch<{ ok: true }>(`${backendBaseUrl}/users/${id}`, {
        accessToken,
        method: "DELETE",
      });
      await loadBase();
      logAudit("Dar de baja", `Usuario ID ${id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async (userId?: number) => {
    const id = userId ?? selectedUserId;
    if (!id) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch<User>(`${backendBaseUrl}/users/${id}/restore`, {
        accessToken,
        method: "POST",
      });
      await loadBase();
      logAudit("Dar de alta", `Usuario ID ${id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onSetRole = async (userId: number, nextRole: UserRole) => {
    setError(null);
    setBusy(true);
    try {
      const updated = await apiFetch<User>(`${backendBaseUrl}/users/${userId}`, {
        accessToken,
        method: "PATCH",
        body: { role: nextRole },
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      logAudit("Cambiar rol", `Usuario ID ${userId} → ${nextRole}`);
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
      const updated = await apiFetch<User>(`${backendBaseUrl}/users/${selectedUserId}`, {
        accessToken,
        method: "PATCH",
        body: { role: roleDraft },
      });

      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      logAudit("Cambiar rol", `Usuario ID ${selectedUserId} → ${roleDraft}`);
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
      const updated = await apiFetch<User>(`${backendBaseUrl}/users/${selectedUserId}`, {
        accessToken,
        method: "PATCH",
        body: { rankId: next },
      });

      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      logAudit("Cambiar rango", `Usuario ID ${selectedUserId} → ${next ?? "(sin rango)"}`);
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
      logAudit(
        "Cambiar curso aprobado",
        `Usuario ID ${selectedUserId} — Curso ID ${courseId} → ${isApproved ? "NO aprobado" : "APROBADO"}`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onSaveAttendance = async () => {
    if (!selectedUserId || !selectedUser) return;

    const mission = Math.max(0, Number(missionAttendanceDraft || 0));
    const training = Math.max(0, Number(trainingAttendanceDraft || 0));

    if (!Number.isFinite(mission) || !Number.isFinite(training)) return;

    const currentMission = Number(selectedUser.missionAttendanceCount ?? 0);
    const currentTraining = Number(selectedUser.trainingAttendanceCount ?? 0);
    if (mission === currentMission && training === currentTraining) return;

    setError(null);
    setBusy(true);
    try {
      const updated = await apiFetch<User>(`${backendBaseUrl}/users/${selectedUserId}`, {
        accessToken,
        method: "PATCH",
        body: {
          missionAttendanceCount: mission,
          trainingAttendanceCount: training,
        },
      });

      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      logAudit("Actualizar asistencias", `Usuario ID ${selectedUserId} → misión ${mission}, entreno ${training}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onAddRankUnlock = async () => {
    if (!selectedRankId) return;
    if (rankUnlockCourseId === "") return;

    setError(null);
    setBusy(true);
    try {
      await apiFetch<RankUnlockRow>(`${backendBaseUrl}/ranks/${selectedRankId}/unlocks`, {
        accessToken: accessToken!,
        method: "POST",
        body: { courseId: Number(rankUnlockCourseId) },
      });
      await loadRankUnlocks();
      setRankUnlockCourseId("");
      logAudit("Agregar desbloqueo", `Rango ID ${selectedRankId} — Curso ID ${String(rankUnlockCourseId)}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onRemoveRankUnlock = async (courseId: number) => {
    if (!selectedRankId) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch<{ ok: true }>(`${backendBaseUrl}/ranks/${selectedRankId}/unlocks/${courseId}`, {
        accessToken: accessToken!,
        method: "DELETE",
      });
      await loadRankUnlocks();
      logAudit("Quitar desbloqueo", `Rango ID ${selectedRankId} — Curso ID ${courseId}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onToggleAttendance = async (userId: number, present: boolean) => {
    if (!attendanceSelectedSessionId) return;
    setError(null);
    setBusy(true);
    try {
      if (present) {
        await apiFetch<{ ok: true }>(
          `${backendBaseUrl}/attendance/sessions/${attendanceSelectedSessionId}/confirm/${userId}`,
          { accessToken: accessToken!, method: "DELETE" },
        );
      } else {
        await apiFetch<{ id: number }>(
          `${backendBaseUrl}/attendance/sessions/${attendanceSelectedSessionId}/confirm`,
          { accessToken: accessToken!, method: "POST", body: { userId } },
        );
      }

      await loadAttendanceUsers();
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
      logAudit("Crear curso", `${created.code} — ${created.name}`);
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
      logAudit("Actualizar curso", `Curso ID ${selectedCourseId}`);
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
      logAudit("Crear rango", `${created.name} — Nivel ${created.sortOrder}`);
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
      logAudit("Actualizar rango", `Rango ID ${selectedRankId}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const topTab = (id: AdminSection, label: string) => {
    const active = activeSection === id;
    return (
      <button
        type="button"
        onClick={() => setActiveSection(id)}
        className={cn(
          "px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "text-foreground border-b-2 border-foreground"
            : "text-foreground/70 hover:text-foreground border-b-2 border-transparent",
        )}
      >
        {label}
      </button>
    );
  };

  const sideItem = (id: AdminSection, label: string) => {
    const active = activeSection === id;
    return (
      <button
        type="button"
        onClick={() => setActiveSection(id)}
        className={cn(
          "w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors",
          active
            ? "border-foreground/20 bg-foreground/10 text-foreground"
            : "border-transparent bg-transparent text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Image
          src={`/img/${adminBackground}`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-background/70 to-background" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="rounded-2xl border border-foreground/10 bg-background/30 backdrop-blur p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-foreground/60 uppercase">
                  {mode === "attendanceOnly" ? "Infraestructura" : "Administrador"}
                </p>
                <p className="mt-1 text-base font-semibold text-foreground">Panel</p>
              </div>
              <div className="hidden w-28 sm:block" aria-hidden="true">
                <Progress value={busy ? 70 : 0} variant="slim" className={busy ? "opacity-100" : "opacity-0"} />
              </div>
            </div>

            <div className="mt-4 grid gap-1">
              {mode === "attendanceOnly" ? (
                <>{sideItem("attendance", "Asistencias")}</>
              ) : (
                <>
                  {sideItem("users", "Usuarios")}
                  {sideItem("courses", "Cursos")}
                  {sideItem("divisions", "Divisiones")}
                  {sideItem("ranks", "Rangos")}
                  {sideItem("attendance", "Asistencias")}
                  {sideItem("audit", "Auditoría")}
                  {sideItem("settings", "Ajustes")}
                </>
              )}
            </div>

            <div className="mt-4">
              {mode === "attendanceOnly" ? (
                <Button type="button" onClick={loadAttendanceSessions} disabled={busy} className="w-full">
                  Recargar
                </Button>
              ) : (
                <Button type="button" onClick={loadBase} disabled={busy} className="w-full">
                  Recargar
                </Button>
              )}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-9">
          <Reveal>
            <div className="rounded-2xl border border-foreground/10 bg-background/30 backdrop-blur p-5 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
                      {mode === "attendanceOnly" ? "ASISTENCIAS" : "ADMINISTRADOR"}
                    </h1>
                    <p className="mt-1 text-sm leading-6 text-foreground/70">
                      {mode === "attendanceOnly" ? "Carga de asistencias por fecha." : "Gestión de usuarios y recursos."}
                    </p>
                  </div>

                  {mode === "full" ? (
                    <div className="flex flex-wrap items-center gap-1">
                      {topTab("users", "Usuarios")}
                      {topTab("courses", "Cursos")}
                      {topTab("divisions", "Divisiones")}
                      {topTab("ranks", "Rangos")}
                      {topTab("attendance", "Asistencias")}
                    </div>
                  ) : null}
                </div>

                {mode === "full" ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard label="Usuarios" value={stats.users} />
                    <StatCard label="Cursos" value={stats.courses} />
                    <StatCard label="Divisiones" value={stats.divisions} />
                    <StatCard label="Rangos" value={stats.ranks} />
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-xl border border-foreground/10 bg-background/30 p-4">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Error:</span> {error}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </Reveal>

          {activeSection === "users" ? (
            <div className="mt-6 grid grid-cols-1 gap-6">
              <Card delay={0.08}>
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">Gestión de Usuarios</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                    <div className="lg:col-span-3">
                      <Select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value as UserRole | "all")} disabled={busy}>
                        <option value="all">Todos los roles</option>
                        <option value="user">user</option>
                        <option value="moderator">moderator</option>
                        <option value="infraestructura">infraestructura</option>
                        <option value="formacion">formacion</option>
                        <option value="super_admin">super_admin</option>
                      </Select>
                    </div>
                    <div className="lg:col-span-3">
                      <Select value={userDivisionFilter} onChange={(e) => setUserDivisionFilter(e.target.value)} disabled={busy}>
                        <option value="all">Todas las divisiones</option>
                        {divisionOptions.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="lg:col-span-3">
                      <Select value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value as "all" | "active" | "inactive")} disabled={busy}>
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                      </Select>
                    </div>
                    <div className="lg:col-span-3">
                      <Input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Buscar" disabled={busy} />
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-foreground/10">
                    <div className="bg-background">
                      <div className="grid grid-cols-1 divide-y divide-foreground/10">
                        {pagedUsers.length ? (
                          pagedUsers.map((u, idx) => {
                            const selected = u.id === selectedUserId;
                            const division = String(u.division ?? "");
                            const rankName = u.rank?.name ?? "";
                            const avatarSrc = rankName ? resolveRankImage(rankName, division) : "";
                            const isActive = !u.deletedAt;
                            const canToggleRole = u.role === "user" || u.role === "moderator";

                            return (
                              <div
                                key={u.id}
                                className={cn(
                                  "px-4 py-3 transition-colors",
                                  selected ? "bg-emerald-500/10" : "bg-background hover:bg-foreground/5",
                                )}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex min-w-0 items-start gap-3">
                                    <p className={cn("pt-1 text-xs font-semibold", selected ? "text-emerald-200" : "text-foreground/60")}>
                                      #{(userPage - 1) * USERS_PAGE_SIZE + idx + 1}
                                    </p>

                                    <button
                                      type="button"
                                      onClick={() => setSelectedUserId(u.id)}
                                      className="flex min-w-0 items-center gap-3 text-left"
                                      disabled={busy}
                                    >
                                      <div
                                        className={cn(
                                          "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border",
                                          selected ? "border-emerald-400/40 bg-emerald-500/10" : "border-foreground/10 bg-foreground/5",
                                        )}
                                        aria-hidden="true"
                                      >
                                        {avatarSrc ? (
                                          <Image src={avatarSrc} alt="" fill sizes="48px" className="object-contain" />
                                        ) : (
                                          <span className="text-xs font-semibold text-foreground/80">{initials(u.name)}</span>
                                        )}
                                      </div>

                                      <div className="min-w-0">
                                        <p title={u.name} className="truncate text-sm font-semibold text-foreground">
                                          {u.name}
                                        </p>
                                        <p title={`ID ${u.id} — ${u.email}`} className="truncate text-xs text-foreground/60">
                                          ID {u.id} — {u.email}
                                        </p>
                                      </div>
                                    </button>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-2">
                                    <IconButton
                                      type="button"
                                      onClick={() => setSelectedUserId(u.id)}
                                      disabled={busy}
                                      title="Editar"
                                      className={selected ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100" : undefined}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </IconButton>

                                    <IconButton
                                      type="button"
                                      onClick={() => {
                                        if (!canToggleRole) return;
                                        const nextRole = u.role === "moderator" ? "user" : "moderator";
                                        onSetRole(u.id, nextRole);
                                      }}
                                      disabled={busy || !canToggleRole}
                                      title={canToggleRole ? "Alternar rol user/moderator" : "Alternar solo aplica a user/moderator"}
                                    >
                                      <Shield className="h-4 w-4" />
                                    </IconButton>

                                    {u.deletedAt ? (
                                      <IconButton
                                        type="button"
                                        onClick={() => onRestore(u.id)}
                                        disabled={busy}
                                        title="Dar de alta"
                                        className="border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                                      >
                                        <RotateCcw className="h-4 w-4" />
                                      </IconButton>
                                    ) : (
                                      <IconButton
                                        type="button"
                                        onClick={() => onDeactivate(u.id)}
                                        disabled={busy}
                                        title="Dar de baja"
                                        className="border-reserve/30 bg-reserve/10 text-reserve"
                                      >
                                        <Ban className="h-4 w-4" />
                                      </IconButton>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <Pill>{u.rank?.name ?? "(sin rango)"}</Pill>
                                  <Pill className="text-foreground/80">{division || "—"}</Pill>
                                  <RoleBadge role={u.role} />
                                  <StatusBadge active={isActive} />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 py-8 text-center text-sm text-foreground/70">No hay usuarios para mostrar.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-foreground/60">
                      {filteredUsers.length ? (
                        <>
                          Mostrando {(userPage - 1) * USERS_PAGE_SIZE + 1}–{Math.min(userPage * USERS_PAGE_SIZE, filteredUsers.length)} de {filteredUsers.length}
                        </>
                      ) : (
                        <>Mostrando 0 de 0</>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="subtle"
                        onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                        disabled={userPage <= 1}
                      >
                        Anterior
                      </Button>
                      <p className="text-xs text-foreground/60">
                        Página {userPage} de {userPageCount}
                      </p>
                      <Button
                        type="button"
                        variant="subtle"
                        onClick={() => setUserPage((p) => Math.min(userPageCount, p + 1))}
                        disabled={userPage >= userPageCount}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

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
                        <p className="mt-1 text-xs text-foreground/70">Asignar permisos al usuario.</p>
                        <div className="mt-3 flex gap-3">
                          <Select value={roleDraft} onChange={(e) => setRoleDraft(e.target.value as UserRole)} disabled={busy}>
                            <option value="user">user</option>
                            <option value="moderator">moderator</option>
                            <option value="infraestructura">infraestructura</option>
                            <option value="formacion">formacion</option>
                          </Select>
                          <Button type="button" onClick={onSaveRole} disabled={busy || !roleDraft || roleDraft === selectedUser.role}>
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
                          onChange={(e) => setCourseToToggleId(e.target.value === "" ? "" : Number(e.target.value))}
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

                    <ControlBase className="p-4">
                      <p className="text-sm font-medium text-foreground">Asistencias</p>
                      <p className="mt-1 text-xs text-foreground/70">Sumar asistencias en misión y entrenamientos.</p>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-2">
                          <FieldLabel>Misión</FieldLabel>
                          <Input
                            type="number"
                            min={0}
                            value={missionAttendanceDraft}
                            onChange={(e) => setMissionAttendanceDraft(e.target.value)}
                            disabled={busy}
                          />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel>Entrenamiento</FieldLabel>
                          <Input
                            type="number"
                            min={0}
                            value={trainingAttendanceDraft}
                            onChange={(e) => setTrainingAttendanceDraft(e.target.value)}
                            disabled={busy}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button type="button" onClick={onSaveAttendance} disabled={busy} className="w-full">
                            Guardar
                          </Button>
                        </div>
                      </div>
                    </ControlBase>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-foreground/70">Seleccioná un usuario para habilitar edición.</p>
                )}
              </Card>
            </div>
          ) : null}

          {activeSection === "attendance" ? (
            <div className="mt-6">
              <Card delay={0.08}>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Asistencias</h2>
                  <p className="mt-1 text-sm text-foreground/70">Sesiones por fecha (misión o entrenamiento) y confirmación por miembro.</p>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4">
                  <ControlBase className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Semana</p>
                        <p className="mt-1 text-xs text-foreground/70">Miércoles y viernes se generan automáticamente. Elegí el día y cargá asistencias.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="subtle"
                          onClick={() => setAttendanceSelectedDate(getWeekDate(3))}
                          disabled={busy}
                          className="px-3 py-2 text-xs"
                        >
                          Miércoles
                        </Button>
                        <Button
                          type="button"
                          variant="subtle"
                          onClick={() => setAttendanceSelectedDate(getWeekDate(5))}
                          disabled={busy}
                          className="px-3 py-2 text-xs"
                        >
                          Viernes
                        </Button>
                        <Button type="button" variant="subtle" onClick={loadAttendanceSessions} disabled={busy} className="px-3 py-2 text-xs">
                          Recargar
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <FieldLabel>Fecha</FieldLabel>
                        <Select
                          value={attendanceSelectedDate}
                          onChange={(e) => setAttendanceSelectedDate(e.target.value)}
                          disabled={busy || !attendanceSessions.length}
                        >
                          <option value="" disabled>
                            Seleccionar…
                          </option>
                          {attendanceDatesInRange.map((d) => (
                            <option key={d} value={d}>
                              {formatDateLabel(d)} ({d})
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <FieldLabel>Tipo</FieldLabel>
                        <Select
                          value={attendanceSelectedType}
                          onChange={(e) => setAttendanceSelectedType(e.target.value as AttendanceType)}
                          disabled={busy || !attendanceSelectedDate}
                        >
                          <option value="mission">Misión</option>
                          <option value="training">Entrenamiento</option>
                        </Select>
                      </div>
                    </div>
                  </ControlBase>

                  <ControlBase className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Gráfico</p>
                        <p className="mt-1 text-xs text-foreground/70">Semana/Mes/Año (hasta hoy). Dos barras por día: Misión y Entrenamiento.</p>
                      </div>
                      <div className="w-full sm:w-56">
                        <Select value={attendanceChartRange} onChange={(e) => setAttendanceChartRange(e.target.value as "week" | "month" | "year")} disabled={busy}>
                          <option value="week">Semana</option>
                          <option value="month">Mes</option>
                          <option value="year">Año</option>
                        </Select>
                      </div>
                    </div>

                    {chartSessions.length ? (
                      <div className="mt-4">
                        <div className="rounded-2xl border border-foreground/10 bg-background/20 p-3">
                          {(() => {
                            const max = Math.max(
                              1,
                              ...chartSessions.flatMap((d) => [d.mission, d.training]),
                            );

                            return (
                              <div className="flex items-end gap-2 overflow-x-auto">
                                {chartSessions.map((d) => {
                                  const isActiveDate = d.date === attendanceSelectedDate;
                                  const hm = Math.round((d.mission / max) * 72);
                                  const ht = Math.round((d.training / max) * 72);

                                  return (
                                    <div
                                      key={d.date}
                                      className={cn(
                                        "flex flex-col items-center gap-1 rounded-xl px-2 py-2",
                                        isActiveDate ? "bg-foreground/5" : "",
                                      )}
                                    >
                                      <div className="flex items-end gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setAttendanceSelectedDate(d.date);
                                            setAttendanceSelectedType("mission");
                                          }}
                                          className={cn(
                                            "w-4 rounded-md border border-foreground/10",
                                            attendanceSelectedDate === d.date && attendanceSelectedType === "mission"
                                              ? "bg-foreground/60"
                                              : "bg-foreground/30 hover:bg-foreground/40",
                                          )}
                                          style={{ height: Math.max(2, hm) }}
                                          title={`${formatDateLabel(d.date)} — Misión: ${d.mission}`}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setAttendanceSelectedDate(d.date);
                                            setAttendanceSelectedType("training");
                                          }}
                                          className={cn(
                                            "w-4 rounded-md border border-foreground/10",
                                            attendanceSelectedDate === d.date && attendanceSelectedType === "training"
                                              ? "bg-foreground/60"
                                              : "bg-foreground/30 hover:bg-foreground/40",
                                          )}
                                          style={{ height: Math.max(2, ht) }}
                                          title={`${formatDateLabel(d.date)} — Entrenamiento: ${d.training}`}
                                        />
                                      </div>
                                      <span className="text-[10px] font-medium text-foreground/70">{formatDateLabel(d.date)}</span>
                                      <span className="text-[10px] text-foreground/60">M {d.mission} / E {d.training}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-foreground/70">No hay sesiones todavía.</p>
                    )}
                  </ControlBase>

                  <ControlBase className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Cargar asistencia</p>
                        <p className="mt-1 text-xs text-foreground/70">Seleccioná fecha y tipo arriba, y marcá quién asistió.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs text-foreground/70">
                          <input
                            type="checkbox"
                            checked={attendanceIncludeInactive}
                            onChange={(e) => setAttendanceIncludeInactive(e.target.checked)}
                            disabled={busy}
                          />
                          Incluir inactivos
                        </label>
                        <Button type="button" variant="subtle" onClick={loadAttendanceSessions} disabled={busy}>
                          Recargar
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <FieldLabel>Resumen</FieldLabel>
                      <div className="mt-2 rounded-xl border border-foreground/10 bg-background/20 px-3 py-2 text-sm text-foreground/80">
                        {attendanceSessionUsers ? (
                          <>
                            {formatDateLabel(attendanceSessionUsers.session.date)} — {attendanceSessionUsers.session.type === "mission" ? "Misión" : "Entrenamiento"} · Asistieron{" "}
                            <span className="font-semibold">{attendanceSessionUsers.presentCount}</span> de {attendanceSessionUsers.users.length}
                          </>
                        ) : attendanceSelectedDate ? (
                          <>Cargando sesión seleccionada…</>
                        ) : (
                          <>Seleccioná una fecha</>
                        )}
                      </div>
                    </div>

                    <div className="mt-5">
                      {attendanceSessionUsers ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <FieldLabel>Buscar miembro</FieldLabel>
                              <Input
                                placeholder="Nombre, email o ID…"
                                value={attendanceUserSearch}
                                onChange={(e) => setAttendanceUserSearch(e.target.value)}
                                disabled={busy}
                              />
                            </div>
                            <div className="space-y-2">
                              <FieldLabel>Lista</FieldLabel>
                              <div className="rounded-xl border border-foreground/10 bg-background/20 px-3 py-2 text-sm text-foreground/80">
                                {filteredAttendanceUsers.length} resultado(s)
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 divide-y divide-foreground/10 overflow-hidden rounded-2xl border border-foreground/10">
                          {filteredAttendanceUsers.map((u) => (
                            <div key={u.id} className="bg-background px-4 py-3">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-foreground">
                                    {u.name}{u.deletedAt ? " (inactivo)" : ""}
                                  </p>
                                  <p className="text-xs text-foreground/60">
                                    ID {u.id} — {u.email}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <label className="flex items-center gap-2 text-xs text-foreground/70">
                                    <input
                                      type="checkbox"
                                      checked={u.present}
                                      onChange={() => onToggleAttendance(u.id, u.present)}
                                      disabled={busy}
                                    />
                                    Asistió
                                  </label>
                                  {u.present ? (
                                    <Pill className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">Confirmado</Pill>
                                  ) : (
                                    <Pill className="border-foreground/10 bg-background/30 text-foreground/70">Sin confirmar</Pill>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground/70">No hay sesión seleccionada.</p>
                      )}
                    </div>
                  </ControlBase>
                </div>
              </Card>
            </div>
          ) : null}

          {activeSection === "courses" ? (
            <div className="mt-6">
              <Card delay={0.08}>
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
                        <Select value={selectedCourseId ?? ""} onChange={(e) => setSelectedCourseId(Number(e.target.value))} disabled={busy}>
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
                          <Input value={courseEdit.code} onChange={(e) => setCourseEdit((s) => ({ ...s, code: e.target.value }))} disabled={busy || !selectedCourse} />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel>Nombre</FieldLabel>
                          <Input value={courseEdit.name} onChange={(e) => setCourseEdit((s) => ({ ...s, name: e.target.value }))} disabled={busy || !selectedCourse} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <FieldLabel>Descripción (opcional)</FieldLabel>
                        <Textarea className="min-h-[90px]" value={courseEdit.description} onChange={(e) => setCourseEdit((s) => ({ ...s, description: e.target.value }))} disabled={busy || !selectedCourse} />
                      </div>

                      <Button type="button" onClick={onUpdateCourse} disabled={busy || !selectedCourseId} className="w-full">
                        Guardar cambios
                      </Button>
                    </div>
                  </ControlBase>

                  <ControlBase className="p-4">
                    <p className="text-sm font-medium text-foreground">Instructores del curso</p>
                    <p className="mt-1 text-xs text-foreground/70">Asignar usuarios con rol <span className="font-medium">formacion</span> para que puedan aprobar este curso.</p>

                    {selectedCourseId ? (
                      <>
                        <div className="mt-4 space-y-2">
                          {courseInstructors.length ? (
                            <ul className="space-y-2">
                              {courseInstructors.map((row) => (
                                <li key={row.id} className="flex items-center justify-between gap-3 rounded-xl border border-foreground/10 bg-background/20 px-3 py-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">
                                      {row.user?.name ?? "(sin usuario)"}
                                    </p>
                                    <p className="truncate text-xs text-foreground/60">
                                      {row.user ? `ID ${row.user.id} — ${row.user.email}` : ""}
                                    </p>
                                  </div>
                                  {row.user ? (
                                    <Button
                                      type="button"
                                      variant="subtle"
                                      onClick={() => onRemoveCourseInstructor(row.user!.id)}
                                      disabled={busy}
                                      className="px-3 py-2 text-xs"
                                    >
                                      Quitar
                                    </Button>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-foreground/70">Sin instructores asignados.</p>
                          )}
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <div className="flex-1">
                            <Select
                              value={courseInstructorUserId}
                              onChange={(e) => setCourseInstructorUserId(Number(e.target.value))}
                              disabled={busy}
                            >
                              <option value="">Seleccionar instructor…</option>
                              {users
                                .filter((u) => u.role === "formacion")
                                .slice()
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name} (ID {u.id})
                                  </option>
                                ))}
                            </Select>
                          </div>
                          <Button
                            type="button"
                            onClick={onAddCourseInstructor}
                            disabled={busy || !courseInstructorUserId}
                            className="sm:w-40"
                          >
                            Asignar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="mt-3 text-sm text-foreground/70">Seleccioná un curso.</p>
                    )}
                  </ControlBase>

                  <ControlBase className="p-4">
                    <p className="text-sm font-medium text-foreground">Crear curso</p>
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <FieldLabel>Código</FieldLabel>
                          <Input value={courseNew.code} onChange={(e) => setCourseNew((s) => ({ ...s, code: e.target.value }))} disabled={busy} />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel>Nombre</FieldLabel>
                          <Input value={courseNew.name} onChange={(e) => setCourseNew((s) => ({ ...s, name: e.target.value }))} disabled={busy} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <FieldLabel>Descripción (opcional)</FieldLabel>
                        <Textarea className="min-h-[90px]" value={courseNew.description} onChange={(e) => setCourseNew((s) => ({ ...s, description: e.target.value }))} disabled={busy} />
                      </div>

                      <Button type="button" onClick={onCreateCourse} disabled={busy || !courseNew.code.trim() || !courseNew.name.trim()} className="w-full">
                        Crear
                      </Button>
                    </div>
                  </ControlBase>
                </div>
              </Card>
            </div>
          ) : null}

          {activeSection === "ranks" ? (
            <div className="mt-6">
              <Card delay={0.08}>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Rangos</h2>
                  <p className="mt-1 text-sm text-foreground/70">Crear y modificar rangos.</p>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4">
                  <ControlBase className="overflow-x-auto overflow-y-hidden">
                    <div className="bg-foreground/5 px-5 py-4">
                      <p className="text-base font-semibold text-foreground">Rangos — Vista</p>
                      <p className="mt-2 text-sm leading-6 text-foreground/60">
                        Vista de jerarquía usando <span className="font-medium">Nivel</span> (antes “sort order”).
                      </p>
                    </div>

                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead className="bg-background">
                        <tr className="text-foreground/70">
                          <th className="px-4 py-3 text-xs font-semibold">Insignia</th>
                          <th className="px-4 py-3 text-xs font-semibold">Categoría</th>
                          <th className="px-4 py-3 text-xs font-semibold">Rango</th>
                          <th className="px-4 py-3 text-xs font-semibold">Nivel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-foreground/10">
                        {ranks
                          .slice()
                          .sort((a, b) => (b.sortOrder - a.sortOrder) || (a.id - b.id))
                          .map((r) => (
                            <tr key={r.id} className="bg-background transition-colors hover:bg-foreground/5">
                              <td className="px-4 py-3">
                                <RankInsigniaCell rankName={r.name} />
                              </td>
                              <td className="px-4 py-3 text-foreground/70">{guessRankCategory(r.name) || "—"}</td>
                              <td className="px-4 py-3 font-semibold text-foreground">{r.name}</td>
                              <td className="px-4 py-3 text-foreground/70">Nivel {r.sortOrder}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </ControlBase>

                  <ControlBase className="p-4">
                    <p className="text-sm font-medium text-foreground">Editar rango</p>
                    <div className="mt-4 space-y-3">
                      <div className="space-y-2">
                        <FieldLabel>Rango</FieldLabel>
                        <Select value={selectedRankId ?? ""} onChange={(e) => setSelectedRankId(Number(e.target.value))} disabled={busy}>
                          <option value="" disabled>
                            Seleccionar…
                          </option>
                          {ranks
                            .slice()
                            .sort((a, b) => (b.sortOrder - a.sortOrder) || (a.id - b.id))
                            .map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} — Nivel {r.sortOrder}
                              </option>
                            ))}
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <FieldLabel>Nombre</FieldLabel>
                          <Input value={rankEdit.name} onChange={(e) => setRankEdit((s) => ({ ...s, name: e.target.value }))} disabled={busy || !selectedRank} />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel>Nivel</FieldLabel>
                          <Input type="number" min={0} value={rankEdit.sortOrder} onChange={(e) => setRankEdit((s) => ({ ...s, sortOrder: e.target.value }))} disabled={busy || !selectedRank} />
                        </div>
                      </div>

                      <Button type="button" onClick={onUpdateRank} disabled={busy || !selectedRankId || !rankEdit.name.trim()} className="w-full">
                        Guardar cambios
                      </Button>
                    </div>
                  </ControlBase>

                  <ControlBase className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Cursos desbloqueados por rango</p>
                        <p className="mt-1 text-xs text-foreground/70">Cursos disponibles al alcanzar este rango.</p>
                      </div>
                      <Button type="button" variant="subtle" onClick={loadRankUnlocks} disabled={busy || !selectedRankId}>
                        Recargar
                      </Button>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Select
                        value={rankUnlockCourseId}
                        onChange={(e) => setRankUnlockCourseId(e.target.value === "" ? "" : Number(e.target.value))}
                        disabled={busy || !selectedRankId}
                      >
                        <option value="">Seleccionar curso…</option>
                        {courses
                          .slice()
                          .sort((a, b) => (a.code ?? "").localeCompare(b.code ?? ""))
                          .map((c) => {
                            const isUnlocked = rankUnlocks.some((u) => u.course?.id === c.id);
                            const tag = isUnlocked ? "(desbloqueado)" : "";
                            return (
                              <option key={c.id} value={c.id} disabled={isUnlocked}>
                                {c.code} — {c.name} {tag}
                              </option>
                            );
                          })}
                      </Select>
                      <Button type="button" onClick={onAddRankUnlock} disabled={busy || !selectedRankId || rankUnlockCourseId === ""}>
                        Agregar
                      </Button>
                    </div>

                    <div className="mt-5">
                      {rankUnlocks.length ? (
                        <ul className="space-y-2">
                          {rankUnlocks
                            .slice()
                            .sort((a, b) => (a.course?.code ?? "").localeCompare(b.course?.code ?? ""))
                            .map((row) => (
                              <li
                                key={row.id}
                                className="flex flex-col justify-between gap-2 rounded-xl border border-foreground/10 bg-background/20 px-3 py-2 sm:flex-row sm:items-center"
                              >
                                <span className="text-sm text-foreground">
                                  {row.course.code} — {row.course.name}
                                </span>
                                <Button
                                  type="button"
                                  variant="subtle"
                                  onClick={() => onRemoveRankUnlock(row.course.id)}
                                  disabled={busy}
                                  className="px-3 py-2 text-xs"
                                >
                                  Quitar
                                </Button>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-foreground/70">
                          {selectedRankId ? "No hay cursos desbloqueados para este rango." : "Seleccioná un rango para editar desbloqueos."}
                        </p>
                      )}
                    </div>
                  </ControlBase>

                  <ControlBase className="p-4">
                    <p className="text-sm font-medium text-foreground">Crear rango</p>
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <FieldLabel>Nombre</FieldLabel>
                          <Input value={rankNew.name} onChange={(e) => setRankNew((s) => ({ ...s, name: e.target.value }))} disabled={busy} />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel>Nivel</FieldLabel>
                          <Input type="number" min={0} value={rankNew.sortOrder} onChange={(e) => setRankNew((s) => ({ ...s, sortOrder: e.target.value }))} disabled={busy} />
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
          ) : null}

          {activeSection === "divisions" || activeSection === "audit" || activeSection === "settings" ? (
            <div className="mt-6">
              <Card delay={0.08}>
                {activeSection === "divisions" ? (
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">Divisiones</h2>
                    <p className="mt-2 text-sm leading-7 text-foreground/70">Resumen por división basado en los usuarios cargados.</p>

                    <div className="mt-5 overflow-hidden rounded-2xl border border-foreground/10">
                      <div className="overflow-auto bg-background">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-background">
                            <tr className="text-foreground/70">
                              <th className="px-4 py-3 text-xs font-semibold">División</th>
                              <th className="px-4 py-3 text-xs font-semibold">Usuarios</th>
                              <th className="px-4 py-3 text-xs font-semibold">Activos</th>
                              <th className="px-4 py-3 text-xs font-semibold">Inactivos</th>
                              <th className="px-4 py-3 text-xs font-semibold">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-foreground/10">
                            {divisionSummary.map((d) => (
                              <tr key={d.division} className="bg-background transition-colors hover:bg-foreground/5">
                                <td className="px-4 py-3 font-semibold text-foreground">{d.division}</td>
                                <td className="px-4 py-3 text-foreground/70">{d.total}</td>
                                <td className="px-4 py-3">
                                  <Pill className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">{d.active}</Pill>
                                </td>
                                <td className="px-4 py-3">
                                  <Pill className="border-reserve/30 bg-reserve/10 text-reserve">{d.inactive}</Pill>
                                </td>
                                <td className="px-4 py-3">
                                  <Button
                                    type="button"
                                    variant="subtle"
                                    onClick={() => {
                                      setUserDivisionFilter(d.division === "(Sin división)" ? "all" : d.division);
                                      setActiveSection("users");
                                    }}
                                  >
                                    Ver usuarios
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeSection === "audit" ? (
                  <div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold tracking-tight text-foreground">Auditoría</h2>
                        <p className="mt-2 text-sm leading-7 text-foreground/70">Registro local de acciones realizadas en este panel.</p>
                      </div>
                      <Button type="button" variant="subtle" onClick={() => setAuditEvents([])} disabled={!auditEvents.length}>
                        Limpiar
                      </Button>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-2xl border border-foreground/10">
                      <div className="max-h-[520px] overflow-auto bg-background">
                        {auditEvents.length ? (
                          <ul className="divide-y divide-foreground/10">
                            {auditEvents.map((ev) => (
                              <li key={ev.id} className="px-4 py-3">
                                <p className="text-sm font-semibold text-foreground">{ev.action}</p>
                                {ev.detail ? <p className="mt-1 text-xs text-foreground/70">{ev.detail}</p> : null}
                                <p className="mt-1 text-[11px] text-foreground/50">{new Date(ev.at).toLocaleString()}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="px-4 py-6">
                            <p className="text-sm text-foreground/70">Todavía no hay acciones registradas.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeSection === "settings" ? (
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">Ajustes</h2>
                    <p className="mt-2 text-sm leading-7 text-foreground/70">Preferencias visuales del panel (locales).</p>

                    <div className="mt-5 grid grid-cols-1 gap-4">
                      <ControlBase className="p-4">
                        <p className="text-sm font-medium text-foreground">Fondo</p>
                        <p className="mt-1 text-xs text-foreground/70">Elegí un fondo para el panel.</p>
                        <div className="mt-3">
                          <Select value={adminBackground} onChange={(e) => setAdminBackground(e.target.value)} disabled={busy}>
                            {adminBackgroundOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </ControlBase>

                      <ControlBase className="p-4">
                        <p className="text-sm font-medium text-foreground">Auditoría</p>
                        <p className="mt-1 text-xs text-foreground/70">Limpiar el registro local de acciones.</p>
                        <div className="mt-3">
                          <Button type="button" onClick={() => setAuditEvents([])} disabled={!auditEvents.length}>
                            Limpiar auditoría
                          </Button>
                        </div>
                      </ControlBase>
                    </div>
                  </div>
                ) : null}
              </Card>
            </div>
          ) : null}
        </main>
      </div>
    </div>
    </div>
  );
}

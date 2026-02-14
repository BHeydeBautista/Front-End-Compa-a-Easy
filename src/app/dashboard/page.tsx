import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { MemberDashboard } from "@/components/members/MemberDashboard";
import { redirect } from "next/navigation";

type BackendCourse = {
  id: number;
  code: string;
  name: string;
};

type BackendApprovedCourse = {
  id: number;
  approvedAt: string;
  course: BackendCourse;
};

type BackendDashboardResponse = {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    rankId: number | null;
    rank: { id: number; name: string } | null;
    category: string | null;
    division: string | null;
    steamName: string | null;
    whatsappName: string | null;
    phoneNumber: string | null;
    discord: string | null;
    missionAttendanceCount: number;
    trainingAttendanceCount: number;
  };
  courses: {
    approved: BackendApprovedCourse[];
    available: BackendCourse[];
    counts: { approved: number; available: number };
  };
};

function getBackendBaseUrl() {
  return (
    process.env.AUTH_BACKEND_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : undefined)
  );
}

function divisionLabel(value: string | null | undefined) {
  if (!value) return undefined;
  if (value.toLowerCase().includes("peg")) return "División Pegasus";
  return "División Fenix";
}

function rankImage(rankName: string) {
  const map: Record<string, string> = {
    Coronel: "/img/Rangos/Coronel.png",
    "Teniente Coronel": "/img/Rangos/teniente-coronel.png",
    Mayor: "/img/Rangos/Mayor.png",
    "Capitán": "/img/Rangos/Capitan.png",
    "Comandante del Aire": "/img/Rangos/Pegasus/comandante-del-aire.png",

    "Teniente Primero": "/img/Rangos/teniente-primero.png",
    "Teniente Segundo": "/img/Rangos/teniente-segundo.png",
    "Sargento Mayor": "/img/Rangos/sargento-mayor.png",
    "Sargento Maestro": "/img/Rangos/sargento-maestro.png",
    "Sargento Primero": "/img/Rangos/sargento-primero.png",
    Sargento: "/img/Rangos/Sargento.png",
    "Cabo Primero": "/img/Rangos/cabo-1.png",
    Cabo: "/img/Rangos/Cabo.png",
    "Soldado de Primera": "/img/Rangos/soldado-1.png",
    "Soldado de Primero": "/img/Rangos/soldado-1.png",
    Soldado: "/img/Rangos/Soldado.png",
    Aspirante: "/img/Rangos/Aspirante.png",

    "Primer Teniente": "/img/Rangos/Pegasus/primer-teniente.png",
    "Teniente Piloto": "/img/Rangos/Pegasus/teniente-piloto.png",
    "Sargento Técnico": "/img/Rangos/Pegasus/sargento-tecnico.png",
    "Sargento de Personal": "/img/Rangos/Pegasus/sargento-de-personal.png",
    "Piloto Primero": "/img/Rangos/Pegasus/piloto-1.png",
    Piloto: "/img/Rangos/Pegasus/piloto.png",
    "Cadete de Primera": "/img/Rangos/Pegasus/cadete-1.png",
    Cadete: "/img/Rangos/Pegasus/cadete.png",
    "Cadete de Primero": "/img/Rangos/Pegasus/cadete-1.png",
    Recluta: "/img/Rangos/Recluta.png",
  };

  return map[rankName] ?? "/img/Rangos/Recluta.png";
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = String((session as any)?.user?.role ?? "").toLowerCase();
  if (role === "super_admin") {
    redirect("/dashboard/admin");
  }

  const accessToken = (session as any)?.accessToken as string | undefined;
  const avatarUrl = (session as any)?.user?.image as string | undefined;
  const userId = Number((session as any)?.user?.id);

  const backendBaseUrl = getBackendBaseUrl();

  let payload: BackendDashboardResponse | null = null;
  if (backendBaseUrl && accessToken && Number.isFinite(userId)) {
    try {
      const res = await fetch(`${backendBaseUrl}/users/${userId}/courses/dashboard`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });
      if (res.ok) {
        payload = (await res.json()) as BackendDashboardResponse;
      }
    } catch {
      payload = null;
    }
  }

  const memberName = payload?.user?.name ?? session?.user?.name ?? session?.user?.email ?? "Miembro";
  const rankName = payload?.user?.rank?.name ?? "Recluta";
  const division = divisionLabel(payload?.user?.division);

  const approvedCodes =
    payload?.courses?.approved
      ?.map((a) => a.course?.code)
      .filter((c): c is string => typeof c === "string" && c.length > 0) ?? [];

  const allCourses: BackendCourse[] = [
    ...(payload?.courses?.approved?.map((a) => a.course).filter(Boolean) ?? []),
    ...(payload?.courses?.available ?? []),
  ];

  const courseCatalog: Record<string, string> = {};
  const courseLogos: Record<string, string> = {};
  const normalizeKey = (value: string) => value.replace(/[^a-z0-9]/gi, "").toUpperCase();

  for (const course of allCourses) {
    if (!course?.code) continue;
    courseCatalog[course.code] = course.name ?? course.code;
    courseLogos[normalizeKey(course.code)] = `/img/Cursos/${course.code}.png`;
  }

  const member = {
    nombre: memberName,
    rango: rankName,
    rangoImg: rankImage(rankName),
    division,
    cursosAprobados: approvedCodes,
    asistencias: {
      misiones: payload?.user?.missionAttendanceCount ?? 0,
      entrenamientos: payload?.user?.trainingAttendanceCount ?? 0,
    },
    // La tarjeta grande es el avatar/escudo del miembro, no el logo de división.
    escudoImg: avatarUrl || "/brand/logo2.png",
  };

  return (
    <MemberDashboard
      bgSrc="/img/20260212004024_1.jpg"
      member={member}
      courseCatalog={courseCatalog}
      courseLogos={courseLogos}
    />
  );
}

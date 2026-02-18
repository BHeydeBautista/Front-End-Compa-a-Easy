/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import {
  MemberDashboard,
  type MemberDashboardCourseCatalog,
} from "@/components/members/MemberDashboard";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import { resolveRankImage } from "@/lib/rank-images";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type BackendDashboardCourse = {
  id: number;
  code: string;
  name: string;
};

type BackendDashboardApproved = {
  id: number;
  approvedAt: string;
  course: BackendDashboardCourse;
};

type BackendDashboardResponse = {
  user: {
    id: number;
    name: string;
    publicName: string | null;
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
    avatarPublicId: string | null;
    backgroundPublicId: string | null;
    missionAttendanceCount: number;
    trainingAttendanceCount: number;
  };
  courses: {
    approved: BackendDashboardApproved[];
    available: BackendDashboardCourse[];
    counts: {
      approved: number;
      available: number;
    };
  };
};

const normalizeKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();

function buildPublicImageIndex(rootRelativeToPublic: string) {
  const publicDir = path.join(process.cwd(), "public");
  const absoluteRoot = path.join(publicDir, ...rootRelativeToPublic.split("/"));
  const entries: Array<{ key: string; src: string }> = [];

  const walk = (absDir: string, relDir: string) => {
    let dirents: fs.Dirent[] = [];
    try {
      dirents = fs.readdirSync(absDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const d of dirents) {
      if (d.isDirectory()) {
        walk(path.join(absDir, d.name), path.posix.join(relDir, d.name));
        continue;
      }

      if (!d.isFile()) continue;
      if (!d.name.toLowerCase().endsWith(".png")) continue;

      const fileBase = d.name.slice(0, -4); // without .png
      const normalized = normalizeKey(fileBase.replace(/\.1$/, ""));
      const src = path.posix
        .join("/", rootRelativeToPublic, relDir, d.name)
        .replace(/\\/g, "/");

      entries.push({ key: normalized, src });
    }
  };

  walk(absoluteRoot, "");

  const map: Record<string, string> = {};
  for (const entry of entries) {
    // Prefer the non-.1 variant if both exist.
    if (!(entry.key in map) || !map[entry.key]?.includes(".png")) {
      map[entry.key] = entry.src;
    }
    // If current path is a .png already and existing is a .1.png, override.
    if (entry.src.endsWith(".png") && map[entry.key]?.includes(".1.png")) {
      map[entry.key] = entry.src;
    }
  }

  return map;
}

const courseLogoByKey = buildPublicImageIndex("img/Cursos");

function prettyDivision(value: string | null | undefined) {
  const v = String(value ?? "").toLowerCase();
  if (v === "fenix") return "Fenix";
  if (v === "pegasus") return "Pegasus";
  return value ?? "";
}

function prettyCategory(value: string | null | undefined) {
  const v = String(value ?? "").toLowerCase();
  if (v === "oficial") return "Oficial";
  if (v === "suboficial") return "SubOficial";
  if (v === "enlistado") return "Enlistado";
  return "";
}

function resolveCourseLogo(courseCode: string) {
  const key = normalizeKey(courseCode);
  return courseLogoByKey[key] ?? null;
}

export default async function AjustesPerfilPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }
  if (!session) redirect("/api/auth/logout");

  const backendBaseUrl = (
    process.env.AUTH_BACKEND_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : "")
  ).replace(/\/+$/, "");

  const accessToken = (session as any).accessToken as string | undefined;
  const userIdRaw = (session as any).user?.id;
  const userId = Number(userIdRaw);

  if (!backendBaseUrl || !accessToken || !Number.isFinite(userId) || userId <= 0) {
    redirect("/api/auth/logout");
  }

  const response = await fetch(
    `${backendBaseUrl}/users/${userId}/courses/dashboard`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (response.status === 401 || response.status === 403) {
    redirect("/api/auth/logout");
  }

  if (!response.ok) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Perfil</h1>
        <p className="mt-3 text-sm text-foreground/70">No se pudo cargar tu información.</p>
      </div>
    );
  }

  const data = (await response.json()) as BackendDashboardResponse;

  const approvedCourses = (data.courses?.approved ?? [])
    .map((a) => a.course)
    .filter((c): c is BackendDashboardCourse => Boolean(c));
  const availableCourses = (data.courses?.available ?? []).filter((c) => Boolean(c));

  const courseCatalog: MemberDashboardCourseCatalog = {};
  for (const c of [...approvedCourses, ...availableCourses]) {
    if (c?.code) {
      courseCatalog[c.code] = c.name ?? c.code;
    }
  }

  const courseLogos: Record<string, string> = {};
  for (const code of Object.keys(courseCatalog)) {
    const src = resolveCourseLogo(code);
    if (src) {
      courseLogos[normalizeKey(code)] = src;
    }
  }

  const rankName = data.user?.rank?.name ?? "";
  const backgroundSrc = cloudinaryImageUrl(data.user?.backgroundPublicId, {
    w: 1920,
    h: 1080,
    crop: "fill",
  });
  const publicName = (data.user?.publicName ?? "").trim();
  const displayName = publicName || data.user?.name || session.user?.name || session.user?.email || "Usuario";
  const role = String((data.user?.role ?? (session as any).user?.role ?? "")).toLowerCase();
  const divisionRaw = data.user?.division ?? null;

  return (
    <MemberDashboard
      bgSrc={backgroundSrc ?? "/img/20260123233002_1.jpg"}
      member={{
        nombre:
          displayName,
        rango: rankName || "Sin rango",
        rangoImg: resolveRankImage(rankName, divisionRaw),
        division: prettyDivision(data.user?.division),
        categoria: prettyCategory(data.user?.category),
        cursosAprobados: approvedCourses.map((c) => c.code).filter(Boolean),
        asistencias: {
          misiones: Number(data.user?.missionAttendanceCount ?? 0),
          entrenamientos: Number(data.user?.trainingAttendanceCount ?? 0),
        },
        escudoImg: "/brand/logo2.png",
      }}
      profile={{
        name: data.user?.name ?? session.user?.name ?? "",
        publicName: data.user?.publicName ?? null,
        role,
        steamName: data.user?.steamName ?? null,
        whatsappName: data.user?.whatsappName ?? null,
        phoneNumber: data.user?.phoneNumber ?? null,
        discord: data.user?.discord ?? null,
        avatarPublicId: data.user?.avatarPublicId ?? null,
        backgroundPublicId: data.user?.backgroundPublicId ?? null,
      }}
      api={{
        backendBaseUrl,
        accessToken,
      }}
      canEditGallery={role === "editor" || role === "moderator" || role === "super_admin"}
      courseCatalog={courseCatalog}
      courseLogos={courseLogos}
    />
  );
}

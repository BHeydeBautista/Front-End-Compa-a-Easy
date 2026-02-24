/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { MemberDashboard, type MemberDashboardCourseCatalog } from "@/components/members/MemberDashboard";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import { resolveRankImage } from "@/lib/rank-images";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      const src = path.posix.join("/", rootRelativeToPublic, relDir, d.name).replace(/\\/g, "/");

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

function resolveCourseLogo(courseCode: string) {
  const key = normalizeKey(courseCode);
  return courseLogoByKey[key] ?? null;
}

type PublicProfileResponse = {
  id: number;
  name: string;
  category: string | null;
  division: string | null;
  rank: { id: number; name: string } | null;
  avatarPublicId?: string | null;
  backgroundPublicId?: string | null;
  courses: {
    approved: Array<{ code: string; name: string }>;
  };
};

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

export default async function UsuarioPerfilPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isFinite(userId) || userId <= 0) {
    redirect("/dashboard");
  }

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
  if (!backendBaseUrl || !accessToken) {
    redirect("/api/auth/logout");
  }

  const response = await fetch(`${backendBaseUrl}/profiles/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    redirect("/api/auth/logout");
  }

  if (!response.ok) {
    redirect("/dashboard");
  }

  const data = (await response.json()) as PublicProfileResponse;

  const approved = data.courses?.approved ?? [];
  const courseCatalog: MemberDashboardCourseCatalog = {};
  for (const c of approved) {
    if (c?.code) courseCatalog[c.code] = c.name ?? c.code;
  }

  const courseLogos: Record<string, string> = {};
  for (const code of Object.keys(courseCatalog)) {
    const src = resolveCourseLogo(code);
    if (src) {
      courseLogos[normalizeKey(code)] = src;
    }
  }

  const rankName = data.rank?.name ?? "";
  const divisionRaw = data.division ?? null;
  const backgroundSrc = cloudinaryImageUrl(data.backgroundPublicId, {
    w: 1920,
    h: 1080,
    crop: "fill",
  });

  return (
    <MemberDashboard
      bgSrc={backgroundSrc ?? "/img/20260123233002_1.jpg"}
      member={{
        nombre: data.name ?? "Usuario",
        rango: rankName || "Sin rango",
        rangoImg: resolveRankImage(rankName, divisionRaw),
        division: prettyDivision(data.division),
        categoria: prettyCategory(data.category),
        cursosAprobados: approved.map((c) => c.code).filter(Boolean),
        asistencias: {
          misiones: 0,
          entrenamientos: 0,
        },
        escudoImg: "/brand/logo2.png",
      }}
      profile={{
        name: data.name ?? "",
        publicName: null,
        role: null,
        steamName: null,
        whatsappName: null,
        phoneNumber: null,
        discord: null,
        avatarPublicId: data.avatarPublicId ?? null,
        backgroundPublicId: data.backgroundPublicId ?? null,
      }}
      api={{
        backendBaseUrl,
        accessToken,
      }}
      courseCatalog={courseCatalog}
      courseLogos={courseLogos}
      readOnly
      showPrivateDetails={false}
    />
  );
}

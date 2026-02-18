/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { rankInsignia } from "@/components/members/company-members-hierarchy/data";
import { MemberDashboard, type MemberDashboardCourseCatalog } from "@/components/members/MemberDashboard";
import { cloudinaryImageUrl } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

function resolveRankImage(rankName: string | null | undefined) {
  const rawName = String(rankName ?? "").trim();
  if (!rawName) {
    return "/img/Rangos/Recluta.png";
  }

  const direct = (rankInsignia as unknown as Record<string, string>)[rawName];
  if (direct) return direct;

  return "/img/Rangos/Recluta.png";
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

  const rankName = data.rank?.name ?? "";
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
        rangoImg: resolveRankImage(rankName),
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
      courseLogos={{}}
      readOnly
      showPrivateDetails={false}
    />
  );
}

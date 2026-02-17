/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Link from "next/link";
import { toAvatar } from "@/components/members/company-members-hierarchy/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PublicProfileResponse = {
  id: number;
  name: string;
  division: string | null;
  rank: { id: number; name: string } | null;
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
  const avatarUrl = toAvatar(data.name ?? "Usuario");
  const division = prettyDivision(data.division);
  const approved = data.courses?.approved ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Perfil</h1>
          <p className="mt-1 text-sm text-foreground/70">Información pública del miembro.</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-foreground/70 hover:text-foreground"
        >
          Volver
        </Link>
      </div>

      <section className="mt-6 rounded-2xl border border-foreground/10 bg-background/30 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/20">
        <div className="flex items-start gap-5">
          <div className="relative h-20 w-20 shrink-0">
            <img
              src={avatarUrl}
              alt={`Avatar de ${data.name}`}
              className="h-20 w-20 rounded-full object-cover border border-foreground/10 bg-foreground/5"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = toAvatar(data.name ?? "Usuario");
              }}
            />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-foreground">{data.name}</h2>
            <p className="mt-1 text-sm font-semibold text-foreground/70">{data.rank?.name ?? "Sin rango"}</p>
            {division ? <p className="mt-1 text-sm text-foreground/70">{division}</p> : null}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-foreground/10 bg-background/30 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/20">
        <h3 className="text-sm font-semibold text-foreground">Cursos aprobados</h3>
        {approved.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/70">Sin cursos aprobados.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {approved.map((c) => (
              <li key={c.code} className="rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{c.code}</p>
                <p className="mt-0.5 text-xs text-foreground/70">{c.name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

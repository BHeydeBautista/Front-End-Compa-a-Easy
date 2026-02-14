import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { Section } from "@/components/ui/Section";
import { AdminPanel } from "@/components/admin";

function getBackendBaseUrl() {
  return (
    process.env.AUTH_BACKEND_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : undefined)
  );
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const role = String(
    (
      session as unknown as {
        user?: {
          role?: string | null;
        };
      }
    )?.user?.role ?? "",
  ).toLowerCase();
  const backendBaseUrl = getBackendBaseUrl();

  if (role !== "super_admin") {
    return (
      <Section title="Panel Super Admin" subtitle="Acceso restringido.">
        <div className="rounded-2xl border border-foreground/10 bg-background p-6">
          <p className="text-sm text-foreground/70">
            Necesitás el rol <span className="font-semibold">super_admin</span> para ver este panel.
          </p>
        </div>
      </Section>
    );
  }

  if (!backendBaseUrl) {
    return (
      <Section title="Panel Super Admin" subtitle="No se encontró configuración de backend.">
        <div className="rounded-2xl border border-foreground/10 bg-background p-6">
          <p className="text-sm text-foreground/70">
            Configurá <span className="font-semibold">AUTH_BACKEND_URL</span> en el frontend.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section
      title="Panel Super Admin"
      subtitle="Usuarios, cursos, rangos, unlocks y aprobaciones."
    >
      <AdminPanel backendBaseUrl={backendBaseUrl} />
    </Section>
  );
}

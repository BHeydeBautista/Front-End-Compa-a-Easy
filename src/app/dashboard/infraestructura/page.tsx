import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AdminPanel } from "@/components/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InfraestructuraDashboardPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }
  if (!session) redirect("/api/auth/logout?next=/unete");

  const sessionLike = session as unknown as {
    user?: { role?: unknown };
    accessToken?: unknown;
  };

  const role = String(sessionLike.user?.role ?? "").toLowerCase();
  if (role !== "infraestructura" && role !== "super_admin") {
    redirect("/dashboard");
  }

  const backendBaseUrl = (
    process.env.AUTH_BACKEND_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : "")
  ).replace(/\/+$/, "");

  const accessToken =
    typeof sessionLike.accessToken === "string" ? sessionLike.accessToken : undefined;

  if (!backendBaseUrl || !accessToken) {
    redirect("/api/auth/logout?next=/unete");
  }

  return (
    <AdminPanel
      backendBaseUrl={backendBaseUrl}
      accessToken={accessToken}
      mode="attendanceOnly"
    />
  );
}

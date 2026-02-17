import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AdminPanel } from "@/components/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }
  if (!session) redirect("/api/auth/logout");

  const role = String((session as any).user?.role ?? "").toLowerCase();
  if (role !== "super_admin") {
    redirect("/dashboard");
  }

  const backendBaseUrl = (
    process.env.AUTH_BACKEND_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : "")
  ).replace(/\/+$/, "");

  const accessToken = (session as any).accessToken as string | undefined;

  if (!backendBaseUrl || !accessToken) {
    redirect("/api/auth/logout");
  }

  return (
    <AdminPanel backendBaseUrl={backendBaseUrl} accessToken={accessToken} />
  );
}

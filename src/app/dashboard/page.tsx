import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/unete");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
      <p className="mt-3 text-sm text-foreground/70">
        Sesión activa para {(session.user?.name ?? session.user?.email) || "usuario"}.
      </p>
    </div>
  );
}

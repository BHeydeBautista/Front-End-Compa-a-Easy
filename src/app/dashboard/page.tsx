import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { Section } from "@/components/ui/Section";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <Section title="Dashboard" subtitle="Sesión iniciada correctamente.">
      <div className="rounded-2xl border border-foreground/10 bg-background p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-foreground/70">Usuario</p>
            <p className="font-semibold">
              {session?.user?.name ?? session?.user?.email ?? "(sin nombre)"}
            </p>
            {session?.user?.email ? (
              <p className="text-sm text-foreground/70">{session.user.email}</p>
            ) : null}
          </div>
          <LogoutButton />
        </div>
      </div>
    </Section>
  );
}

import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage(props: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchParams = props.searchParams ?? {};
  const tokenRaw = searchParams.token;
  const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw;

  const backendBaseUrl = (
    process.env.AUTH_BACKEND_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : "")
  ).replace(/\/+$/, "");

  let status: "success" | "error" | "missing" = "success";
  let message = "";

  if (!token) {
    status = "missing";
    message = "Falta el token de verificación.";
  } else if (!backendBaseUrl) {
    status = "error";
    message = "Backend no configurado.";
  } else {
    try {
      const res = await fetch(`${backendBaseUrl}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: "no-store",
      });

      if (!res.ok) {
        const raw = await res.text();
        status = "error";
        try {
          const parsed: unknown = raw ? JSON.parse(raw) : null;
          if (parsed && typeof parsed === "object") {
            const record = parsed as Record<string, unknown>;
            message = String(
              record.message ?? record.error ?? "No se pudo verificar el correo.",
            );
          } else {
            message = "No se pudo verificar el correo.";
          }
        } catch {
          message = raw || "No se pudo verificar el correo.";
        }
      }
    } catch {
      status = "error";
      message = "No se pudo conectar con el servidor.";
    }
  }

  return (
    <div className="px-6 py-24">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-foreground/10 bg-background p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Verificación de correo</h1>

        {status === "success" ? (
          <div className="mt-4 text-sm text-foreground">
            <p>Listo. Tu correo quedó verificado.</p>
            <p className="mt-2">
              <Link href="/unete" className="font-semibold text-foreground hover:underline">
                Ir a iniciar sesión
              </Link>
            </p>
          </div>
        ) : null}

        {status === "error" || status === "missing" ? (
          <div className="mt-4 text-sm text-foreground">
            <p>{message}</p>
            <p className="mt-2">
              <Link href="/unete" className="font-semibold text-foreground hover:underline">
                Volver
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

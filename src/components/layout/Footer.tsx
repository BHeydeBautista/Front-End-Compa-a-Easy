import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/10">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">Comunidad Arma 3</p>
            <p className="mt-1 text-sm text-foreground/70">
              Cursos, manuales y gestión interna de miembros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <Link
              href="/#galeria"
              className="text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              Galería
            </Link>
            <Link
              href="/sobre"
              className="text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              Sobre nosotros
            </Link>
            <Link
              href="/manuales"
              className="text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              Manuales
            </Link>
            <Link
              href="/miembros"
              className="text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              Miembros
            </Link>
            <Link
              href="/asistencias"
              className="text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              Asistencias
            </Link>
            <Link
              href="/unete"
              className="text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              Únete
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-foreground/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-foreground/60">
            © {year} Comunidad Arma 3. Todos los derechos reservados.
          </p>
          <p className="text-xs text-foreground/60">
            Hecho con Next.js.
          </p>
        </div>
      </div>
    </footer>
  );
}

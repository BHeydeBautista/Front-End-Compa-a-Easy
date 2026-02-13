import NavbarFlow from "@/components/ui/navbar-flow";
import Image from "next/image";

export function Navbar() {
  const links = [
    { text: "Inicio", url: "#inicio" },
    { text: "Galería", url: "#galeria" },
    { text: "Sobre nosotros", url: "#sobre" },
    { text: "Miembros", url: "#miembros" },
  ];

  return (
    <NavbarFlow
      emblem={
        <span className="flex items-center gap-3">
          <span className="relative h-10 w-10 overflow-hidden rounded-full border border-foreground/10 bg-foreground/5">
            <Image
              src="/brand/logo.png"
              alt="Compañía Easy"
              fill
              sizes="40px"
              className="object-cover"
              priority
            />
          </span>
          <span className="hidden sm:inline leading-none">Compañía Easy</span>
        </span>
      }
      links={links}
      rightComponent={
        <a
          href="#unete"
          className='inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20'
        >
          Únete
        </a>
      }
    />
  );
}

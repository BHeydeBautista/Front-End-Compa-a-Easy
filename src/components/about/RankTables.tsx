"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mediaQuery.matches);
    onChange();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    }

    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, []);

  return reduced;
}

type RankRow = {
  cat: string;
  r: string;
  n: number;
  imgSrc?: string;
};

function RankInsignia({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div
        className="h-12 w-12 rounded-xl border border-foreground/10 bg-foreground/5"
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="relative h-12 w-12">
      <Image src={src} alt={alt} fill sizes="48px" className="object-contain" />
    </div>
  );
}

function RankCard({
  title,
  subtitle,
  rows,
  reducedMotion,
  className,
}: {
  title: string;
  subtitle?: string;
  rows: RankRow[];
  reducedMotion: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={cn("overflow-hidden rounded-2xl border border-foreground/10", className)}
      initial={reducedMotion ? false : { opacity: 0, y: 12, filter: "blur(10px)" }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={reducedMotion ? undefined : { duration: 0.6, ease: "easeOut" }}
    >
      <div className="bg-foreground/5 px-5 py-4">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {subtitle ? <p className="mt-2 text-sm leading-6 text-foreground/60">{subtitle}</p> : null}
      </div>

      {rows.length === 0 ? (
        <div className="bg-background px-4 py-6">
          <p className="text-sm text-foreground/70">
            No hay rangos cargados para esta categoría en esta división.
          </p>
        </div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="bg-background">
            <tr className="text-foreground/70">
              <th className="px-4 py-3 text-xs font-semibold">Insignia</th>
              <th className="px-4 py-3 text-xs font-semibold">Categoría</th>
              <th className="px-4 py-3 text-xs font-semibold">Rango</th>
              <th className="px-4 py-3 text-xs font-semibold">Nivel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/10">
            {rows.map((row) => (
              <tr
                key={`${row.cat}-${row.r}`}
                className={cn(
                  "bg-background",
                  reducedMotion ? "" : "transition-colors hover:bg-foreground/5"
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <RankInsignia src={row.imgSrc} alt={`Insignia ${row.r}`} />
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground/70">{row.cat}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{row.r}</td>
                <td className="px-4 py-3 text-foreground/70">Nivel {row.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  );
}

export function RankTables() {
  const reducedMotion = useReducedMotion();

  const officersDesc =
    "Enfocados en planificación, conducción y toma de decisiones. Mantienen visión táctica/estratégica y aseguran coherencia en operaciones y entrenamiento.";
  const ncoDesc =
    "Nexo entre mando y tropa. Ejecutan estándares, forman a los miembros y sostienen la disciplina y la calidad operativa dentro de cada división.";
  const enlistedDesc =
    "Base operativa: aprenden procedimientos, cumplen roles y progresan por asistencia, desempeño y dominio del contenido. Son el núcleo de la ejecución en misión.";

  const altoMandoRows: RankRow[] = [
    { cat: "Alto Mando", r: "Coronel", n: 15, imgSrc: "/img/Rangos/Coronel.png" },
    { cat: "Alto Mando", r: "Teniente Coronel", n: 14, imgSrc: "/img/Rangos/teniente-coronel.png" },
    { cat: "Alto Mando", r: "Mayor", n: 13, imgSrc: "/img/Rangos/Mayor.png" },
    { cat: "Alto Mando", r: "Capitán", n: 12, imgSrc: "/img/Rangos/Capitan.png" },
    {
      cat: "Alto Mando",
      r: "Comandante del Aire",
      n: 12,
      imgSrc: "/img/Rangos/Pegasus/comandante-del-aire.png",
    },
  ];

  const fenixRows: RankRow[] = [
    { cat: "Oficiales", r: "Teniente Primero", n: 11, imgSrc: "/img/Rangos/teniente-primero.png" },
    { cat: "Oficiales", r: "Teniente Segundo", n: 10, imgSrc: "/img/Rangos/teniente-segundo.png" },
    { cat: "Suboficiales", r: "Sargento Mayor", n: 9, imgSrc: "/img/Rangos/sargento-mayor.png" },
    { cat: "Suboficiales", r: "Sargento Maestro", n: 8, imgSrc: "/img/Rangos/sargento-maestro.png" },
    { cat: "Suboficiales", r: "Sargento Primero", n: 7, imgSrc: "/img/Rangos/sargento-primero.png" },
    { cat: "Suboficiales", r: "Sargento", n: 6, imgSrc: "/img/Rangos/Sargento.png" },
    { cat: "Suboficiales", r: "Cabo Primero", n: 5, imgSrc: "/img/Rangos/cabo-1.png" },
    { cat: "Suboficiales", r: "Cabo", n: 4, imgSrc: "/img/Rangos/Cabo.png" },
    { cat: "Enlistados", r: "Soldado de Primera", n: 3, imgSrc: "/img/Rangos/soldado-1.png" },
    { cat: "Enlistados", r: "Soldado", n: 2, imgSrc: "/img/Rangos/Soldado.png" },
    { cat: "Enlistados", r: "Recluta", n: 1, imgSrc: "/img/Rangos/Recluta.png" },
    { cat: "Enlistados", r: "Aspirante", n: 0, imgSrc: "/img/Rangos/Aspirante.png" },
  ];

  const pegasusRows: RankRow[] = [
    { cat: "Oficiales", r: "Primer Teniente", n: 11, imgSrc: "/img/Rangos/Pegasus/primer-teniente.png" },
    { cat: "Oficiales", r: "Teniente Piloto", n: 10, imgSrc: "/img/Rangos/Pegasus/teniente-piloto.png" },

    { cat: "Suboficiales", r: "Sargento Mayor", n: 9, imgSrc: "/img/Rangos/Pegasus/sargento-mayor.png" },
    { cat: "Suboficiales", r: "Sargento Maestro", n: 8, imgSrc: "/img/Rangos/Pegasus/sargento-maestro.png" },
    { cat: "Suboficiales", r: "Sargento Técnico", n: 7, imgSrc: "/img/Rangos/Pegasus/sargento-tecnico.png" },
    {
      cat: "Suboficiales",
      r: "Sargento de Personal",
      n: 6,
      imgSrc: "/img/Rangos/Pegasus/sargento-de-personal.png",
    },

    { cat: "Suboficiales", r: "Piloto Primero", n: 5, imgSrc: "/img/Rangos/Pegasus/piloto-1.png" },
    { cat: "Suboficiales", r: "Piloto", n: 4, imgSrc: "/img/Rangos/Pegasus/piloto.png" },
    { cat: "Enlistados", r: "Cadete de Primera", n: 3, imgSrc: "/img/Rangos/Pegasus/cadete-1.png" },
    { cat: "Enlistados", r: "Cadete", n: 2, imgSrc: "/img/Rangos/Pegasus/cadete.png" },
  ];

  return (
    <div className="space-y-6">
      <RankCard
        title="Alto Mando — Rangos"
        subtitle="Responsables de dirección, orden interno y decisiones estratégicas de la Compañía."
        rows={altoMandoRows}
        reducedMotion={reducedMotion}
      />

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Oficiales</p>
          <p className="mt-2 text-sm leading-7 text-foreground/70">
            {officersDesc} En Pegasus, la equivalencia se adapta a roles de vuelo.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RankCard
            title="Oficiales — División Fénix"
            rows={fenixRows.filter((r) => r.cat === "Oficiales").sort((a, b) => b.n - a.n)}
            reducedMotion={reducedMotion}
          />
          <RankCard
            title="Oficiales — División Pegasus"
            rows={pegasusRows.filter((r) => r.cat === "Oficiales").sort((a, b) => b.n - a.n)}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Suboficiales</p>
          <p className="mt-2 text-sm leading-7 text-foreground/70">
            {ncoDesc} En Pegasus se prioriza coordinación aire-tierra, procedimientos y roles de vuelo.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RankCard
            title="Suboficiales — División Fénix"
            rows={fenixRows.filter((r) => r.cat === "Suboficiales")}
            reducedMotion={reducedMotion}
          />
          <RankCard
            title="Suboficiales — División Pegasus"
            rows={pegasusRows.filter((r) => r.cat === "Suboficiales")}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Enlistados</p>
          <p className="mt-2 text-sm leading-7 text-foreground/70">{enlistedDesc}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RankCard
            title="Enlistados — División Fénix"
            rows={fenixRows.filter((r) => r.cat === "Enlistados")}
            reducedMotion={reducedMotion}
          />
          <RankCard
            title="Enlistados — División Pegasus"
            rows={pegasusRows.filter((r) => r.cat === "Enlistados")}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </div>
  );
}

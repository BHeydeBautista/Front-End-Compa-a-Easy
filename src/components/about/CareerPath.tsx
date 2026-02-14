"use client";

import * as React from "react";
import { motion } from "motion/react";

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

type Step = {
  title: string;
  desc: string;
};

const steps: Step[] = [
  {
    title: "Ingreso",
    desc: "Inducción y reglas básicas. Se valida compromiso y disciplina.",
  },
  {
    title: "Cursos y práctica",
    desc: "Formación por niveles y especializaciones (comunicaciones, formaciones, procedimientos, roles).",
  },
  {
    title: "Desempeño sostenido",
    desc: "Evaluación en operaciones: criterio, comunicación, orden y aporte al equipo.",
  },
  {
    title: "Responsabilidad",
    desc: "A mayor rango: mayor autonomía, estándares y obligación de formar a otros.",
  },
];

const criteria = [
  "Asistencia",
  "Disciplina",
  "Dominio del contenido",
  "Desempeño en actividad real",
  "Trabajo en equipo",
  "Capacidad de liderar",
];

export function CareerPath() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="rounded-2xl border border-foreground/10 bg-background p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Cómo se hace carrera</p>
          <p className="mt-2 text-sm leading-7 text-foreground/70">
            Formación, práctica y evidencia de desempeño sostenido.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <motion.li
                key={step.title}
                initial={
                  reducedMotion ? false : { opacity: 0, y: 12, filter: "blur(10px)" }
                }
                whileInView={
                  reducedMotion
                    ? undefined
                    : { opacity: 1, y: 0, filter: "blur(0px)" }
                }
                viewport={{ once: true, amount: 0.35 }}
                transition={
                  reducedMotion
                    ? undefined
                    : { duration: 0.55, ease: "easeOut", delay: index * 0.06 }
                }
                className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5 p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-background text-sm font-semibold text-foreground">
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                    <p className="mt-1 text-sm leading-7 text-foreground/70">{step.desc}</p>
                  </div>
                </div>

                {reducedMotion ? null : (
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-foreground/5" />
                  </div>
                )}
              </motion.li>
            ))}
          </ol>
        </div>

        <motion.div
          className="lg:col-span-5"
          initial={
            reducedMotion ? false : { opacity: 0, y: 12, filter: "blur(10px)" }
          }
          whileInView={
            reducedMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }
          }
          viewport={{ once: true, amount: 0.35 }}
          transition={
            reducedMotion ? undefined : { duration: 0.6, ease: "easeOut", delay: 0.1 }
          }
        >
          <div className="rounded-2xl border border-foreground/10 bg-background p-5">
            <p className="text-sm font-semibold text-foreground">Criterios típicos de ascenso</p>
            <p className="mt-2 text-sm leading-7 text-foreground/70">
              Se basan en evidencia y consistencia a lo largo del tiempo.
            </p>

            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {criteria.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm text-foreground/80"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { Section } from "@/components/ui/Section";

export default function ManualesPage() {
  return (
    <div>
      <Section
        title="Manuales (PDF)"
        subtitle="Base documental de cursos para que instructores y alumnos encuentren rápido el material oficial."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Subida y organización",
              desc: "Biblioteca por curso / temática, con una presentación clara.",
            },
            {
              title: "Acceso rápido",
              desc: "Estructura pensada para encontrar manuales en segundos.",
            },
            {
              title: "Escalable",
              desc: "Listo para crecer con más cursos y versiones.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6"
            >
              <p className="text-sm font-semibold text-foreground">{card.title}</p>
              <p className="mt-2 text-sm leading-6 text-foreground/70">{card.desc}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

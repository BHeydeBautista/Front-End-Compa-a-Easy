import { Section } from "@/components/ui/Section";

export default function SobrePage() {
  return (
    <div>
      <Section
        title="Sobre nosotros"
        subtitle="Disciplina, aprendizaje y compañerismo. Un entorno serio para progresar en equipo."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Entrenamiento",
              desc: "Cursos con objetivos claros y material oficial por nivel.",
            },
            {
              title: "Organización",
              desc: "Estructura por rangos y roles para operar ordenados.",
            },
            {
              title: "Comunidad",
              desc: "Un espacio para formar gente y sostener estándares.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-foreground/10 bg-background p-6"
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

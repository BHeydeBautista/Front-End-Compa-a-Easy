import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { Section } from "@/components/ui/Section";

export default function Home() {
  return (
    <div>
      <HeroCarousel />

      <Section
        id="galeria"
        title="Galería"
        subtitle="Momentos destacados, entrenamientos y operaciones."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-video rounded-2xl border border-foreground/10 bg-foreground/5"
            />
          ))}
        </div>
      </Section>

      <Section
        id="sobre"
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

      <Section
        id="manuales"
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
              <p className="text-sm font-semibold text-foreground">
                {card.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="miembros"
        title="Miembros"
        subtitle="Dashboard individual por miembro: rango, cursos aprobados y, a futuro, asistencias sincronizadas desde Excel/OneDrive."
      >
        <div className="rounded-2xl border border-foreground/10 bg-background p-6">
          <p className="text-sm text-foreground/70">
            Próximo paso: definir roles (admin/instructor/miembro) y el modelo de datos.
          </p>
        </div>
      </Section>

      <Section
        id="asistencias"
        title="Asistencias"
        subtitle="Dashboard para cargar asistencias de forma simple y consistente."
      >
        <div className="rounded-2xl border border-foreground/10 bg-background p-6">
          <p className="text-sm text-foreground/70">
            Próximo paso: elegir si se carga por evento (fecha/curso) o por lista (miembros + presente/ausente).
          </p>
        </div>
      </Section>

      <Section
        id="unete"
        title="Únete"
        subtitle="Accedé o registrate para ver tu panel, cursos y progreso."
      >
        <div className="rounded-2xl border border-foreground/10 bg-background p-6">
          <p className="text-sm text-foreground/70">
            Próximo paso: implementar login/registro (roles: admin, instructor, miembro).
          </p>
        </div>
      </Section>
    </div>
  );
}

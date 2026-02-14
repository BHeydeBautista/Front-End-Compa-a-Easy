import { Section } from "@/components/ui/Section";
import { HorizontalTimeline } from "@/components/about/HorizontalTimeline";
import { DivisionPanel } from "@/components/about/DivisionPanel";
import { RankTables } from "@/components/about/RankTables";
import { CareerPath } from "@/components/about/CareerPath";

export default function SobrePage() {
  return (
    <div>
      <Section
        id="historia"
        title="Historia y trayectoria"
        subtitle="La Compañía Easy nace como heredera directa de Cerberus y mantiene un estándar serio de simulación táctica y comunidad."
      >
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="space-y-5 text-sm leading-7 text-foreground/70">
              <p>
                La Compañía Easy nació en 2023 tras el cierre de la Compañía Privada Cerberus. Surgió como su
                heredera directa, manteniendo su estructura, valores y filosofía operativa. En aquel entonces,
                el mando pasó del Capitán Faceman al Sargento Mayor Winters, quien actualmente se desempeña como
                Capitán de la Compañía.
              </p>
              <p>
                Desde sus inicios, Easy continuó con la misma línea de enseñanza, entrenamiento y ejecución
                operativa que caracterizaba a Cerberus, reconocida como uno de los clanes más destacados tanto en
                el ámbito de la simulación como en la construcción de comunidad. Su prestigio se apoyaba en años
                de experiencia, profesionalismo y una sólida base de veteranos.
              </p>
              <p>
                Hoy, la Compañía Easy sigue operando con la misma determinación de siempre: formar, fortalecer y
                mantener una comunidad comprometida, donde no solo se viene a disfrutar, sino también a vivir la
                experiencia de la simulación táctica dentro del universo de la saga Arma desarrollada por Bohemia
                Interactive.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
              <p className="text-sm font-semibold text-foreground">Datos clave</p>
              <dl className="mt-4 divide-y divide-foreground/10">
                {[
                  { k: "Fundación", v: "2023" },
                  { k: "Legado", v: "Cerberus" },
                  { k: "Mando", v: "Cap. Winters" },
                  { k: "Enfoque", v: "Simulación táctica" },
                ].map((row) => (
                  <div key={row.k} className="flex items-center justify-between gap-6 py-3">
                    <dt className="text-xs font-semibold text-foreground/70">{row.k}</dt>
                    <dd className="text-sm font-semibold text-foreground">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <HorizontalTimeline
            autoplay
            intervalMs={14000}
            items={[
              {
                year: "2023",
                title: "Fundación y legado",
                points: [
                  "Tras el cierre de Cerberus, nace oficialmente Compañía Easy como heredera directa.",
                  "Inicio con 25 miembros activos.",
                  "Traspaso de mando del Capitán Faceman al entonces Sargento Mayor Winters (actual Capitán).",
                  "Se adopta doctrina operativa, estructura y estándares de entrenamiento heredados.",
                  "Primer ciclo formal de instrucción interna bajo el nuevo estandarte.",
                ],
              },
              {
                year: "2024",
                title: "Consolidación y profesionalización",
                points: [
                  "La compañía se consolida como estructura propia.",
                  "Estandarización de conocimientos: comunicaciones, formaciones, procedimientos y roles especializados.",
                  "Creación de guías internas y manuales operativos.",
                  "Primeras operaciones complejas con planificación avanzada y cadena de mando funcional.",
                ],
              },
              {
                year: "2025",
                title: "Migración y exploración en Arma Reforger",
                points: [
                  "Decisión estratégica: migración para explorar el nuevo entorno.",
                  "Transición de la plantilla activa a la nueva plataforma.",
                  "Etapa de experimentación y adaptación a nuevas mecánicas/limitaciones técnicas.",
                  "Desarrollo de protocolos adaptados a la nueva estructura del motor.",
                ],
              },
              {
                year: "2026",
                title: "Regreso estratégico y reafirmación",
                points: [
                  "Regreso a Arma 3 para sostener profundidad táctica y estructuras complejas.",
                  "Incorporación de experiencia acumulada en ambos entornos.",
                  "Reorganización interna con estándares más exigentes.",
                  "Nueva etapa de operaciones: calidad sobre cantidad.",
                ],
              },
            ]}
          />
        </div>
      </Section>

      <Section
        id="composicion"
        title="Composición de la compañía"
        subtitle="Dos divisiones operativas con identidad propia, funciones definidas y cadena de mando clara."
      >
        <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-background">
          <div className="grid lg:grid-cols-2">
            <DivisionPanel
              name="División Fénix"
              previousName="Quimera"
              crestSrc="/img/divisiones/fenix.png"
              previousLogoSrc="/img/divisiones/quimera.png"
              description="Fénix constituye la columna vertebral de la Compañía. Es la división de infantería encargada de ejecutar la mayoría de las operaciones terrestres, misiones tácticas y despliegues estratégicos."
              functions={[
                "Operaciones de asalto y control territorial",
                "Patrullaje y reconocimiento",
                "Defensa estratégica",
                "Operaciones combinadas con apoyo aéreo",
                "Especializaciones tácticas (AT, médico, comunicaciones, tirador, etc.)",
              ]}
            />

            <DivisionPanel
              name="División Pegasus"
              previousName="Valkyria"
              crestSrc="/img/divisiones/pegasus.png"
              previousLogoSrc="/img/divisiones/valkyria.png"
              description="Pegasus es la división aérea de la Compañía, responsable del dominio del espacio aéreo y del apoyo táctico a fuerzas terrestres."
              functions={[
                "Transporte táctico de tropas",
                "Inserciones y extracciones",
                "Apoyo aéreo cercano (CAS)",
                "Reconocimiento aéreo",
                "Coordinación aire-tierra",
              ]}
              accent="soft"
              className="border-t border-foreground/10 lg:border-l lg:border-t-0"
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
          <p className="text-sm font-semibold text-foreground">Estructura de rangos y profesionalización</p>
          <p className="mt-2 text-sm leading-7 text-foreground/70">
            La Compañía mantiene una jerarquía organizada en Oficiales, Suboficiales y Enlistados.
            Cada división cuenta con cursos internos obligatorios y avanzados que garantizan la profesionalización.
          </p>
        </div>
      </Section>

      <Section
        id="rangos"
        title="Sistema de rangos y divisiones"
        subtitle="Un sistema claro para crecer con el tiempo: formación, evidencia de desempeño y responsabilidad progresiva."
      >
        <div className="space-y-6">
          <CareerPath />

          <div className="rounded-2xl border border-foreground/10 bg-background p-6">
            <p className="text-sm font-semibold text-foreground">Jerarquía y equivalencias</p>
            <p className="mt-2 text-sm leading-7 text-foreground/70">
              La jerarquía se divide en Oficiales, Suboficiales y Enlistados. Fénix y Pegasus mantienen equivalencia
              jerárquica, adaptada a su especialización.
            </p>

            <div className="mt-6">
              <RankTables />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

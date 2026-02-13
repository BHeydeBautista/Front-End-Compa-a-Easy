import { Section } from "@/components/ui/Section";

export default function AsistenciasPage() {
  return (
    <div>
      <Section
        title="Asistencias"
        subtitle="Dashboard para cargar asistencias de forma simple y consistente."
      >
        <div className="rounded-2xl border border-foreground/10 bg-background p-6">
          <p className="text-sm text-foreground/70">
            Próximo paso: elegir si se carga por evento (fecha/curso) o por lista (miembros + presente/ausente).
          </p>
        </div>
      </Section>
    </div>
  );
}

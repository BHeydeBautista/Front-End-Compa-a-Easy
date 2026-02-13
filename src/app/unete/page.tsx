import { Section } from "@/components/ui/Section";

export default function UnetePage() {
  return (
    <div>
      <Section
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

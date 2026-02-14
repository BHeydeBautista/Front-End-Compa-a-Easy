import Link from "next/link";
import { Section } from "@/components/ui/Section";

export default function ReglasPage() {
  const docs = [
    {
      key: "reglas-generales",
      title: "Reglas Generales del Clan",
      pdfHref: "/docs/reglas-generales-del-clan.pdf",
    },
    {
      key: "codigo-conducta-telegram",
      title: "Código de conducta en Telegram",
      pdfHref: "/docs/codigo-de-conducta-telegram.pdf",
    },
  ] as const;

  return (
    <div>
      <Section
        title="Reglas generales"
        subtitle="Reglamento oficial del clan en PDF."
      >
        <div className="space-y-6">
          {docs.map((doc) => (
            <div
              key={doc.key}
              className="rounded-2xl border border-foreground/10 bg-background p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{doc.title} (PDF)</p>
                  <p className="mt-1 text-sm leading-6 text-foreground/70">
                    Si no se visualiza en tu navegador, podés descargarlo y abrirlo localmente.
                  </p>
                </div>

                <Link
                  href={doc.pdfHref}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/10"
                  target="_blank"
                  rel="noreferrer"
                >
                  Descargar PDF
                </Link>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-foreground/10 bg-background">
                <object
                  data={doc.pdfHref}
                  type="application/pdf"
                  className="h-[70vh] w-full"
                  aria-label={`${doc.title} (PDF)`}
                >
                  <div className="p-6">
                    <p className="text-sm text-foreground/70">
                      Tu navegador no pudo mostrar el PDF embebido.
                    </p>
                    <p className="mt-2">
                      <Link
                        href={doc.pdfHref}
                        className="text-sm font-semibold text-foreground underline underline-offset-4"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir/Descargar PDF
                      </Link>
                    </p>
                  </div>
                </object>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

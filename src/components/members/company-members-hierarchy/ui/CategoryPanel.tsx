import type React from "react";

export default function CategoryPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        "w-full overflow-hidden rounded-2xl border border-foreground/12 " +
        "bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/20"
      }
    >
      <div className="flex items-center justify-center gap-3 border-b border-foreground/10 bg-foreground/5 px-5 py-4 text-center">
        <span className="text-xs font-semibold tracking-[0.30em] text-foreground/60 uppercase">Sección</span>
        <div className="h-4 w-px bg-foreground/15" aria-hidden="true" />
        <h2 className="text-sm font-semibold tracking-[0.30em] text-foreground uppercase">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

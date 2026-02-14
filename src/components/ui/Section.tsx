import type { ReactNode } from "react";

export function Section({
  id,
  title,
  subtitle,
  align = "left",
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  const isCentered = align === "center";

  return (
    <section id={id} className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className={isCentered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
          <h2
            className={
              "text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl" +
              (isCentered ? " mx-auto" : "")
            }
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              className={
                "mt-3 text-pretty text-base leading-7 text-foreground/70" +
                (isCentered ? " mx-auto" : "")
              }
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

"use client";

import { Section } from "@/components/ui/Section";
import { fadeStyles } from "./company-members-hierarchy/styles";
import { buildCategoryGroups } from "./company-members-hierarchy/utils";
import CategoryPanel from "./company-members-hierarchy/ui/CategoryPanel";
import DivisionColumn from "./company-members-hierarchy/ui/DivisionColumn";
import EnlistadosLayout from "./company-members-hierarchy/ui/EnlistadosLayout";
import { RankBlock } from "./company-members-hierarchy/ui/RankBlocks";

export default function CompanyMembersHierarchy() {
  const categoryGroups = buildCategoryGroups();

  return (
    <main className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <style jsx global>
        {fadeStyles}
      </style>

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:22px_22px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/60"
        aria-hidden="true"
      />

      <Section
        id="miembros"
        align="center"
        title="Personal Activo"
        subtitle="Estructura táctica por categoría, división y rango."
      >
        <div className="grid gap-10">
          {categoryGroups.map((category) => (
            <CategoryPanel key={category.title} title={category.title}>
              {category.layout === "single" ? (
                <div className="grid gap-10">
                  {category.ranks.map((group) => (
                    <RankBlock key={`${category.title}-${group.rank}`} group={group} />
                  ))}
                </div>
              ) : (
                (() => {
                  const fenixHas = category.divisions.Fenix.length > 0;
                  const pegasusHas = category.divisions.Pegasus.length > 0;

                  if (fenixHas && !pegasusHas) {
                    return <DivisionColumn division="Fenix" ranks={category.divisions.Fenix} />;
                  }

                  if (!fenixHas && pegasusHas) {
                    return <DivisionColumn division="Pegasus" ranks={category.divisions.Pegasus} />;
                  }

                  if (category.title === "Enlistados") {
                    return (
                      <EnlistadosLayout
                        fenixRanks={category.divisions.Fenix}
                        pegasusRanks={category.divisions.Pegasus}
                      />
                    );
                  }

                  return (
                    <div className="relative grid gap-10 md:grid-cols-2 md:gap-6">
                      <div
                        className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-foreground/10 md:block"
                        aria-hidden="true"
                      />
                      <DivisionColumn division="Fenix" ranks={category.divisions.Fenix} />
                      <DivisionColumn division="Pegasus" ranks={category.divisions.Pegasus} />
                    </div>
                  );
                })()
              )}
            </CategoryPanel>
          ))}
        </div>
      </Section>
    </main>
  );
}

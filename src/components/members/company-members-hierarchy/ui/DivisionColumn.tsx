import Image from "next/image";
import { divisionLogo } from "../data";
import type { DivisionKey, RankGroup } from "../types";
import { RankBlock } from "./RankBlocks";

export default function DivisionColumn({
  division,
  ranks,
}: {
  division: DivisionKey;
  ranks: RankGroup[];
}) {
  const label = division === "Fenix" ? "Fénix" : "Pegasus";

  return (
    <section className="rounded-2xl border border-foreground/10 bg-background/30 p-4">
      <div className="grid content-start gap-8">
        <div className="flex items-center justify-center gap-3 text-center">
          <div className="relative h-10 w-10">
            <Image
              src={divisionLogo[division]}
              alt={`División ${division}`}
              fill
              sizes="40px"
              className="object-contain"
              priority={false}
            />
          </div>
          <h3 className="text-sm font-semibold tracking-[0.30em] text-foreground/70 uppercase">{label}</h3>
        </div>

        <div className="grid gap-10">
          {ranks.map((group) => (
            <div key={`${division}-${group.rank}`}>
              <RankBlock group={group} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { divisionLogo, rankInsignia } from "../data";
import type { RankGroup } from "../types";
import { buildRankGroups } from "../utils";
import { RankBlock, RankBlockCustom } from "./RankBlocks";

const flatten = (ranks: RankGroup[]) => ranks.flatMap((g) => g.members);

export default function EnlistadosLayout({
  fenixRanks,
  pegasusRanks,
}: {
  fenixRanks: RankGroup[];
  pegasusRanks: RankGroup[];
}) {
  const fenixMembers = flatten(fenixRanks);
  const pegasusMembers = flatten(pegasusRanks);

  const fenixSoldadoPrimero = fenixMembers.filter((m) => m.rank === "Soldado de Primero");
  const fenixSoldado = fenixMembers.filter((m) => m.rank === "Soldado");
  const pegasusCadetePrimero = pegasusMembers.filter((m) => m.rank === "Cadete de Primero");
  const pegasusCadete = pegasusMembers.filter((m) => m.rank === "Cadete");

  const fenixRest = fenixMembers.filter((m) => !(m.rank === "Soldado" || m.rank === "Soldado de Primero"));
  const pegasusRest = pegasusMembers.filter((m) => !(m.rank === "Cadete" || m.rank === "Cadete de Primero"));

  const fenixRestRanks = buildRankGroups(fenixRest);
  const pegasusRestRanks = buildRankGroups(pegasusRest);

  return (
    <div className="relative grid gap-10 md:grid-cols-2 md:gap-6">
      <div
        className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-foreground/10 md:block"
        aria-hidden="true"
      />

      <section className="rounded-2xl border border-foreground/10 bg-background/30 p-4">
        <div className="grid content-start gap-8">
          <div className="flex items-center justify-center gap-3 text-center">
            <div className="relative h-10 w-10">
              <Image
                src={divisionLogo.Fenix}
                alt="División Fenix"
                fill
                sizes="40px"
                className="object-contain"
                priority={false}
              />
            </div>
            <h3 className="text-sm font-semibold tracking-[0.30em] text-foreground/70 uppercase">Fénix</h3>
          </div>

          <div className="grid gap-10">
            {fenixSoldadoPrimero.length ? (
              <RankBlockCustom
                title="Soldado de Primero"
                img={rankInsignia["Soldado de Primero"]}
                members={fenixSoldadoPrimero}
              />
            ) : null}

            {fenixSoldado.length ? (
              <RankBlockCustom title="Soldado" img={rankInsignia["Soldado"]} members={fenixSoldado} />
            ) : null}

            {fenixRestRanks.map((group) => (
              <RankBlock key={`fenix-${group.rank}`} group={group} />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-foreground/10 bg-background/30 p-4">
        <div className="grid content-start gap-8">
          <div className="flex items-center justify-center gap-3 text-center">
            <div className="relative h-10 w-10">
              <Image
                src={divisionLogo.Pegasus}
                alt="División Pegasus"
                fill
                sizes="40px"
                className="object-contain"
                priority={false}
              />
            </div>
            <h3 className="text-sm font-semibold tracking-[0.30em] text-foreground/70 uppercase">Pegasus</h3>
          </div>

          <div className="grid gap-10">
            {pegasusCadetePrimero.length ? (
              <RankBlockCustom
                title="Cadete de Primero"
                img={rankInsignia["Cadete de Primero"]}
                members={pegasusCadetePrimero}
              />
            ) : null}

            {pegasusCadete.length ? (
              <RankBlockCustom title="Cadete" img={rankInsignia["Cadete"]} members={pegasusCadete} />
            ) : null}

            {pegasusRestRanks.map((group) => (
              <RankBlock key={`pegasus-${group.rank}`} group={group} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

import Image from "next/image";
import type { CompanyMember, RankGroup } from "../types";
import MemberCard from "./MemberCard";

export function RankBlock({ group }: { group: RankGroup }) {
  const isSparse = group.members.length <= 1;

  return (
    <section className="grid gap-5">
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <div className="relative h-12 w-12">
          <Image
            src={group.rankImg}
            alt={`Insignia de ${group.rank}`}
            fill
            sizes="48px"
            className="object-contain"
            priority={false}
          />
        </div>
        <h3 className="text-lg font-semibold tracking-[0.28em] text-foreground/80 uppercase">
          {group.rank}
        </h3>
        <div className="h-px w-36 bg-foreground/10" />
      </div>

      {isSparse ? (
        <div className="flex justify-center">
          {group.members.map((member, index) => (
            <div
              key={`${group.rank}-${member.id ?? member.name}`}
              className="animate-fade-in-up flex w-full justify-center"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <MemberCard member={member} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {group.members.map((member, index) => (
            <div
              key={`${group.rank}-${member.id ?? member.name}`}
              className="animate-fade-in-up flex w-full justify-center"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <MemberCard member={member} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function RankBlockCustom({
  title,
  img,
  members,
}: {
  title: string;
  img: string;
  members: CompanyMember[];
}) {
  const isSparse = members.length <= 1;

  return (
    <section className="grid gap-5">
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <div className="relative h-12 w-12">
          <Image
            src={img}
            alt={`Insignia de ${title}`}
            fill
            sizes="48px"
            className="object-contain"
            priority={false}
          />
        </div>
        <h3 className="text-lg font-semibold tracking-[0.28em] text-foreground/80 uppercase">
          {title}
        </h3>
        <div className="h-px w-36 bg-foreground/10" />
      </div>

      {isSparse ? (
        <div className="flex justify-center">
          {members.map((member, index) => (
            <div
              key={`${title}-${member.id ?? member.name}`}
              className="animate-fade-in-up flex w-full justify-center"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <MemberCard member={member} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => (
            <div
              key={`${title}-${member.id ?? member.name}`}
              className="animate-fade-in-up flex w-full justify-center"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <MemberCard member={member} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

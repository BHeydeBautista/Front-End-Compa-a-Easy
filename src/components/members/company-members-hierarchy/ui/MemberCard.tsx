import ThreeDCard from "@/components/ui/three-d-card";
import type { CompanyMember } from "../types";
import ReserveBadge from "./ReserveBadge";

export default function MemberCard({ member }: { member: CompanyMember }) {
  const isLeader = member.name.trim().toLowerCase() === "winters";

  const card = (
    <div
      className={
        "group relative flex w-full max-w-sm flex-col items-center text-center " +
        "max-w-xs rounded-2xl border border-foreground/15 " +
        "bg-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/30 " +
        "p-5 " +
        "shadow-sm transition-all duration-300 " +
        "hover:-translate-y-1 hover:border-foreground/25 " +
        (isLeader ? " border-leader/55 ring-2 ring-leader/25" : "")
      }
      style={
        isLeader
          ? {
              boxShadow: "0 0 40px rgb(var(--leader-rgb) / 0.18)",
            }
          : undefined
      }
    >
      {isLeader ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 30% 15%, rgb(var(--leader-rgb) / 0.22), transparent 55%)",
          }}
        />
      ) : null}

      {isLeader ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="rounded-full border border-leader/35 bg-background/85 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-leader uppercase backdrop-blur supports-[backdrop-filter]:bg-background/60">
            Líder
          </div>
        </div>
      ) : null}

      <div className="relative mb-5 h-32 w-32 md:h-36 md:w-36">
        <div className="absolute inset-0 rounded-full bg-foreground/5 blur-xl" aria-hidden="true" />

        <img
          className={
            "relative h-full w-full rounded-full object-cover " +
            "border border-foreground/10 bg-foreground/5 " +
            "ring-4 ring-background/70 group-hover:ring-background transition-all duration-300 " +
            "shadow-sm"
          }
          src={member.avatarUrl}
          alt={`Avatar de ${member.name}`}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            const initials = member.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((n) => n[0]?.toUpperCase())
              .join("");
            target.src = `https://placehold.co/220x220/E2E8F0/111827?text=${initials}`;
          }}
        />
      </div>

      <p className="text-xs font-semibold tracking-[0.26em] text-foreground/70 uppercase">
        {member.rank.toUpperCase()}
      </p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{member.name}</h3>

      {member.reserve ? (
        <div className="mt-3">
          <ReserveBadge />
        </div>
      ) : null}
    </div>
  );

  if (!isLeader) return card;

  return (
    <ThreeDCard
      variant="bare"
      className="w-full flex justify-center"
      maxRotation={14}
      parallaxOffset={18}
      transitionDuration="0.35s"
      enableGlow={false}
      enableParallax={true}
      enableTilt={true}
    >
      {card}
    </ThreeDCard>
  );
}

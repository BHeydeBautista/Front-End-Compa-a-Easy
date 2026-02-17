import { activeMembers, categories, rankInsignia, rankOrder } from "./data";
import type { CategoryGroup, CompanyMember, DivisionKey, Rank, RankGroup } from "./types";

export const toAvatar = (name: string) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
  return `https://placehold.co/220x220/E2E8F0/111827?text=${initials || "A"}`;
};

export const normalizeDivision = (value: string): DivisionKey => {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  if (normalized.includes("peg")) return "Pegasus";
  if (normalized.includes("fen")) return "Fenix";
  return "Fenix";
};

export const buildRankGroups = (members: CompanyMember[]): RankGroup[] => {
  const grouped = new Map<Rank, CompanyMember[]>();
  for (const member of members) {
    const list = grouped.get(member.rank) ?? [];
    list.push(member);
    grouped.set(member.rank, list);
  }

  return rankOrder
    .map((rank) => ({ rank, rankImg: rankInsignia[rank], members: grouped.get(rank) ?? [] }))
    .filter((g) => g.members.length > 0);
};

export const buildCategoryGroups = (inputs = activeMembers): CategoryGroup[] => {
  const memberList: CompanyMember[] = inputs.map((m) => ({
    name: m.name.trim(),
    rank: m.rank,
    type: m.type,
    division: normalizeDivision(m.division),
    avatarUrl: toAvatar(m.name),
    reserve: m.reserve,
  }));

  const byName = (a: CompanyMember, b: CompanyMember) => a.name.localeCompare(b.name);

  return categories
    .map((category) => {
      const members = memberList
        .filter((m) => category.types.includes(m.type))
        .slice()
        .sort(byName);

      if (category.layout === "single") {
        return {
          title: category.title,
          layout: "single",
          ranks: buildRankGroups(members),
        } satisfies CategoryGroup;
      }

      const fenix = members.filter((m) => m.division === "Fenix");
      const pegasus = members.filter((m) => m.division === "Pegasus");

      return {
        title: category.title,
        layout: "divisions",
        divisions: {
          Fenix: buildRankGroups(fenix),
          Pegasus: buildRankGroups(pegasus),
        },
      } satisfies CategoryGroup;
    })
    .filter((g) =>
      g.layout === "single"
        ? g.ranks.length > 0
        : g.divisions.Fenix.length + g.divisions.Pegasus.length > 0
    );
};

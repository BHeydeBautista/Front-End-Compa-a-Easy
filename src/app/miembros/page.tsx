/* eslint-disable @typescript-eslint/no-explicit-any */
import CompanyMembersHierarchy from "@/components/members/CompanyMembersHierarchy";
import type { ActiveMemberInput, MemberType, Rank } from "@/components/members/company-members-hierarchy/types";
import { rankOrder } from "@/components/members/company-members-hierarchy/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PublicMemberResponse = {
  id: number;
  name: string;
  category: string | null;
  division: string | null;
  rank: { id: number; name: string } | null;
};

const normalizeKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();

const rankByKey = new Map<string, Rank>(rankOrder.map((r) => [normalizeKey(r), r]));

function coerceRank(name: string | null | undefined): Rank {
  const raw = String(name ?? "").trim();
  if (!raw) return "Recluta";
  return rankByKey.get(normalizeKey(raw)) ?? "Recluta";
}

function mapCategory(category: string | null | undefined): MemberType | null {
  const c = String(category ?? "").toLowerCase();
  if (c === "oficial") return "Oficial";
  if (c === "suboficial") return "SubOficial";
  if (c === "enlistado") return "Enlistado";
  return null;
}

export default async function MiembrosPage() {
  const backendBaseUrl = (
    process.env.AUTH_BACKEND_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : "")
  ).replace(/\/+$/, "");

  if (!backendBaseUrl) {
    return <CompanyMembersHierarchy members={[]} />;
  }

  let members: ActiveMemberInput[] = [];
  try {
    const response = await fetch(`${backendBaseUrl}/public/members`, {
      method: "GET",
      cache: "no-store",
    });

    if (response.ok) {
      const data = (await response.json()) as PublicMemberResponse[];
      members = (data ?? [])
        .map((u) => {
          const type = mapCategory(u.category);
          if (!type) return null;
          const division = u.division ?? "";
          const rank = coerceRank(u.rank?.name);
          return {
            name: u.name,
            type,
            division,
            rank,
          } satisfies ActiveMemberInput;
        })
        .filter((x): x is ActiveMemberInput => Boolean(x));
    }
  } catch {
    members = [];
  }

  return <CompanyMembersHierarchy members={members} />;
}

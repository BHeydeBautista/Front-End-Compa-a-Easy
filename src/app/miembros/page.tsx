import CompanyMembersHierarchy from "@/components/members/CompanyMembersHierarchy";
import type { ActiveMemberInput, MemberType, Rank } from "@/components/members/company-members-hierarchy/types";
import { rankOrder } from "@/components/members/company-members-hierarchy/data";

const MEMBERS_REVALIDATE_SECONDS = 60;
const FETCH_TIMEOUT_MS = 8000;

export const revalidate = 60;

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

function inferTypeFromRank(rank: Rank): MemberType {
  switch (rank) {
    case "Capitán":
      return "Oficial";
    case "Sargento Primero":
    case "Sargento":
    case "Cabo Primero":
      return "SubOficial";
    default:
      return "Enlistado";
  }
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
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(`${backendBaseUrl}/public/members`, {
      method: "GET",
      signal: controller.signal,
      next: { revalidate: MEMBERS_REVALIDATE_SECONDS },
    });

    if (response.ok) {
      const data = (await response.json()) as PublicMemberResponse[];
      members = (data ?? []).flatMap((u) => {
        const division = u.division ?? "";
        const rank = coerceRank(u.rank?.name);

        const declaredType = mapCategory(u.category);
        const inferredType = inferTypeFromRank(rank);
        const type = declaredType && declaredType === inferredType ? declaredType : inferredType;

        return [
          {
            id: u.id,
            name: u.name,
            type,
            division,
            rank,
          } satisfies ActiveMemberInput,
        ];
      });
    }
  } catch {
    members = [];
  } finally {
    if (timeout) clearTimeout(timeout);
  }

  return <CompanyMembersHierarchy members={members} />;
}

const FALLBACK_RANK_IMAGE = "/img/Rangos/Recluta.png";

export function normalizeRankKey(value: string): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();
}

function isPegasusHint(value: string | null | undefined): boolean {
  const v = normalizeRankKey(String(value ?? ""));
  return v.includes("PEGASUS") || v.includes("AIRE");
}

function normalizeDivisionKey(value: string | null | undefined): "PEGASUS" | "FENIX" | null {
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return null;
  if (v === "pegasus") return "PEGASUS";
  if (v === "fenix" || v === "fénix") return "FENIX";
  if (v === "f" || v === "fex" || v === "fen") return "FENIX";
  if (v === "peg" || v === "pgs") return "PEGASUS";
  if (v.includes("pegasus")) return "PEGASUS";
  if (v.includes("fenix") || v.includes("fénix")) return "FENIX";
  return null;
}

type RankImageVariants = {
  default: string;
  PEGASUS?: string;
};

// Canonical mapping aligned with `components/about/RankTables.tsx`.
const RANK_IMAGES: Record<string, RankImageVariants> = {
  // Alto mando
  CORONEL: { default: "/img/Rangos/Coronel.png" },
  TENIENTECORONEL: { default: "/img/Rangos/teniente-coronel.png" },
  MAYOR: { default: "/img/Rangos/Mayor.png" },
  CAPITAN: { default: "/img/Rangos/Capitan.png" },
  COMANDANTEDELAIRE: { default: "/img/Rangos/Pegasus/comandante-del-aire.png" },

  // Oficiales
  TENIENTEPRIMERO: { default: "/img/Rangos/teniente-primero.png" },
  TENIENTESEGUNDO: { default: "/img/Rangos/teniente-segundo.png" },
  PRIMERTENIENTE: { default: "/img/Rangos/Pegasus/primer-teniente.png" },
  TENIENTEPILOTO: { default: "/img/Rangos/Pegasus/teniente-piloto.png" },

  // Suboficiales
  SARGENTOMAYOR: {
    default: "/img/Rangos/sargento-mayor.png",
    PEGASUS: "/img/Rangos/Pegasus/sargento-mayor.png",
  },
  SARGENTOMAESTRO: {
    default: "/img/Rangos/sargento-maestro.png",
    PEGASUS: "/img/Rangos/Pegasus/sargento-maestro.png",
  },
  SARGENTOPRIMERO: { default: "/img/Rangos/sargento-primero.png" },
  SARGENTOTECNICO: { default: "/img/Rangos/Pegasus/sargento-tecnico.png" },
  SARGENTODEPERSONAL: { default: "/img/Rangos/Pegasus/sargento-de-personal.png" },
  SARGENTO: { default: "/img/Rangos/Sargento.png" },
  CABOPRIMERO: { default: "/img/Rangos/cabo-1.png" },
  CABO: { default: "/img/Rangos/Cabo.png" },
  PILOTOPRIMERO: { default: "/img/Rangos/Pegasus/piloto-1.png" },
  PILOTO: { default: "/img/Rangos/Pegasus/piloto.png" },

  // Enlistados
  SOLDADODEPRIMERA: { default: "/img/Rangos/soldado-1.png" },
  SOLDADO: { default: "/img/Rangos/Soldado.png" },
  RECLUTA: { default: "/img/Rangos/Recluta.png" },
  ASPIRANTE: { default: "/img/Rangos/Aspirante.png" },
  CADETEDEPRIMERA: { default: "/img/Rangos/Pegasus/cadete-1.png" },
  CADETE: { default: "/img/Rangos/Pegasus/cadete.png" },
};

const KEY_ALIASES: Record<string, string> = {
  // Common naming variants in the codebase/admin inputs
  SOLDADODEPRIMERO: "SOLDADODEPRIMERA",
  CADETEDEPRIMERO: "CADETEDEPRIMERA",
  SARGENTOMAESTRE: "SARGENTOMAESTRO",
};

function lookupRankVariants(rawKey: string): RankImageVariants | null {
  if (!rawKey) return null;

  if (rawKey in RANK_IMAGES) return RANK_IMAGES[rawKey] ?? null;
  const alias = KEY_ALIASES[rawKey];
  if (alias && alias in RANK_IMAGES) return RANK_IMAGES[alias] ?? null;

  // Try stripping common suffixes like "de Fenix", "Pegasus", "de Aire".
  const suffixes = ["DEFENIX", "FENIX", "DEPEGASUS", "PEGASUS", "DEAIRE"];
  for (const suffix of suffixes) {
    if (!rawKey.endsWith(suffix)) continue;
    const trimmed = rawKey.slice(0, -suffix.length);
    if (trimmed in RANK_IMAGES) return RANK_IMAGES[trimmed] ?? null;
    const trimmedAlias = KEY_ALIASES[trimmed];
    if (trimmedAlias && trimmedAlias in RANK_IMAGES) return RANK_IMAGES[trimmedAlias] ?? null;
  }

  return null;
}

export function resolveRankImage(rankName: string | null | undefined, division?: string | null): string {
  const raw = String(rankName ?? "").trim();
  if (!raw) return FALLBACK_RANK_IMAGE;

  const divisionKey = normalizeDivisionKey(division);
  const pegasus = divisionKey === "PEGASUS" || isPegasusHint(raw);

  const key = normalizeRankKey(raw);
  const variants = lookupRankVariants(key);
  if (!variants) return FALLBACK_RANK_IMAGE;

  if (pegasus && variants.PEGASUS) return variants.PEGASUS;
  return variants.default;
}

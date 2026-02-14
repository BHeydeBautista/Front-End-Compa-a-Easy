import type { ActiveMemberInput, CategoryDefinition, DivisionKey, Rank } from "./types";

export const rankOrder: Rank[] = [
  "Capitán",
  "Sargento Primero",
  "Sargento",
  "Cabo Primero",
  "Soldado de Primero",
  "Soldado",
  "Cadete de Primero",
  "Cadete",
  "Recluta",
  "Aspirante",
];

export const divisionLogo: Record<DivisionKey, string> = {
  Fenix: "/img/divisiones/fenix.png",
  Pegasus: "/img/divisiones/pegasus.png",
};

export const rankInsignia: Record<Rank, string> = {
  "Capitán": "/img/Rangos/Capitan.png",
  "Sargento Primero": "/img/Rangos/sargento-primero.png",
  "Sargento": "/img/Rangos/Sargento.png",
  "Cabo Primero": "/img/Rangos/cabo-1.png",
  "Soldado de Primero": "/img/Rangos/soldado-1.png",
  "Soldado": "/img/Rangos/Soldado.png",
  "Cadete de Primero": "/img/Rangos/Pegasus/cadete-1.png",
  "Cadete": "/img/Rangos/Pegasus/cadete.png",
  "Recluta": "/img/Rangos/Recluta.png",
  "Aspirante": "/img/Rangos/Aspirante.png",
};

export const categories: CategoryDefinition[] = [
  { title: "Altos Mandos", layout: "single", types: ["Oficial"] },
  { title: "Suboficiales", layout: "divisions", types: ["SubOficial"] },
  { title: "Enlistados", layout: "divisions", types: ["Enlistado"] },
];

export const activeMembers: ActiveMemberInput[] = [
  { name: "Winters", rank: "Capitán", type: "Oficial", division: "FENIX" },
  { name: "Caride", rank: "Sargento Primero", type: "SubOficial", division: "FENIX", reserve: true },
  { name: "Kampa", rank: "Sargento Primero", type: "SubOficial", division: "FENIX" },
  { name: "Miny", rank: "Sargento", type: "SubOficial", division: "FENIX", reserve: true },
  { name: "Crixo", rank: "Sargento", type: "SubOficial", division: "FENIX" },
  { name: "Delpino", rank: "Cabo Primero", type: "SubOficial", division: "FENIX" },
  { name: "Zureth", rank: "Cabo Primero", type: "SubOficial", division: "FENIX" },
  { name: "Ronald", rank: "Soldado de Primero", type: "Enlistado", division: "Fenix" },
  { name: "Stain", rank: "Soldado de Primero", type: "Enlistado", division: "FENIX" },
  { name: "Ricaño", rank: "Soldado de Primero", type: "Enlistado", division: "FENIX" },
  { name: "Azevirt", rank: "Cadete de Primero", type: "Enlistado", division: "Pegasus" },
  { name: "Gabo", rank: "Soldado", type: "Enlistado", division: "FENIX" },
  { name: "Martillo", rank: "Soldado de Primero", type: "Enlistado", division: "FENIX" },
  { name: "Rincon", rank: "Soldado", type: "Enlistado", division: "Fenix" },
  { name: "Nascimento", rank: "Cadete", type: "Enlistado", division: "Pegasus" },
  { name: "Kenway", rank: "Recluta", type: "Enlistado", division: "FENIX" },
  { name: "Laurie", rank: "Aspirante", type: "Enlistado", division: "Fenix" },
];

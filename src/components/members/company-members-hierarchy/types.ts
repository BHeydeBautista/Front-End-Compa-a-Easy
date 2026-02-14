export type DivisionKey = "Fenix" | "Pegasus";

export type MemberType = "Oficial" | "SubOficial" | "Enlistado";

export type Rank =
  | "Capitán"
  | "Sargento Primero"
  | "Sargento"
  | "Cabo Primero"
  | "Soldado de Primero"
  | "Soldado"
  | "Cadete de Primero"
  | "Cadete"
  | "Recluta"
  | "Aspirante";

export type CompanyMember = {
  name: string;
  rank: Rank;
  type: MemberType;
  division: DivisionKey;
  avatarUrl: string;
  reserve?: boolean;
};

export type RankGroup = {
  rank: Rank;
  rankImg: string;
  members: CompanyMember[];
};

export type CategoryDefinition = {
  title: string;
  layout: "single" | "divisions";
  types: MemberType[];
};

export type CategoryGroup =
  | {
      title: string;
      layout: "single";
      ranks: RankGroup[];
    }
  | {
      title: string;
      layout: "divisions";
      divisions: Record<DivisionKey, RankGroup[]>;
    };

export type ActiveMemberInput = {
  name: string;
  rank: Rank;
  type: MemberType;
  division: string;
  reserve?: boolean;
};

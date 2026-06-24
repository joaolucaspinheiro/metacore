export interface WeightedEntry {
  name: string;
  percent: number;
}

export interface PokemonMetaEntry {
  name: string;
  usagePercent: number;
  rawCount: number;
  teammates: WeightedEntry[];
  topItems: WeightedEntry[];
  topMoves: WeightedEntry[];
  topAbilities: WeightedEntry[];
  topTeraTypes: WeightedEntry[];
}

export interface MetaSnapshot {
  generatedAt: string;
  sourceMonth: string;
  format: string;
  ratingCutoff: number;
  totalBattles: number;
  pokemon: Record<string, PokemonMetaEntry>;
}

import type { MetaSnapshot } from "./types";

export interface Suggestion {
  name: string;
  score: number;
  usagePercent: number;
  matchedWith: { name: string; percent: number }[];
}

export function suggestTeammates(
  ownedSpecies: string[],
  snapshot: MetaSnapshot,
  limit = 12
): Suggestion[] {
  const ownedSet = new Set(ownedSpecies);
  const candidates = new Map<
    string,
    { sum: number; count: number; matches: { name: string; percent: number }[] }
  >();

  for (const owned of ownedSpecies) {
    const entry = snapshot.pokemon[owned];
    if (!entry) continue;

    for (const teammate of entry.teammates) {
      if (ownedSet.has(teammate.name)) continue;

      const acc = candidates.get(teammate.name) ?? { sum: 0, count: 0, matches: [] };
      acc.sum += teammate.percent;
      acc.count += 1;
      acc.matches.push({ name: owned, percent: teammate.percent });
      candidates.set(teammate.name, acc);
    }
  }

  return Array.from(candidates.entries())
    .map(([name, acc]) => ({
      name,
      score: Math.round((acc.sum / acc.count) * 100) / 100,
      usagePercent: snapshot.pokemon[name]?.usagePercent ?? 0,
      matchedWith: acc.matches.sort((a, b) => b.percent - a.percent),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

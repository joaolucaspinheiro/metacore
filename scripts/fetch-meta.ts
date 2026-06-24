import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { Dex } from "@pkmn/dex";
import type { MetaSnapshot, PokemonMetaEntry, WeightedEntry } from "../src/lib/meta/types";

const gen9 = Dex.forGen(9);

const MONTH = process.env.META_MONTH ?? "2026-05";
const FORMAT = process.env.META_FORMAT ?? "gen9championsvgc2026regma";
const CUTOFF = Number(process.env.META_CUTOFF ?? 1760);
const TOP_TEAMMATES = 15;
const TOP_ITEMS = 8;
const TOP_MOVES = 8;
const TOP_ABILITIES = 5;
const TOP_TERA = 5;

const URL = `https://www.smogon.com/stats/${MONTH}/chaos/${FORMAT}-${CUTOFF}.json`;

interface RawEntry {
  usage: number;
  "Raw count": number;
  Abilities: Record<string, number>;
  Items: Record<string, number>;
  Moves: Record<string, number>;
  "Tera Types": Record<string, number>;
  Teammates: Record<string, number>;
}

interface RawDump {
  info: { metagame: string; cutoff: number; "number of battles": number };
  data: Record<string, RawEntry>;
}

function topN(
  weights: Record<string, number>,
  n: number,
  exclude?: string[],
  prettify?: (id: string) => string
): WeightedEntry[] {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  if (!sum) return [];
  return Object.entries(weights)
    .filter(([name]) => name !== "" && !exclude?.includes(name))
    .map(([name, weight]) => ({
      name: prettify ? prettify(name) : name,
      percent: Math.round((weight / sum) * 10000) / 100,
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, n);
}

const prettyMove = (id: string) => gen9.moves.get(id)?.name ?? id;
const prettyItem = (id: string) => gen9.items.get(id)?.name ?? id;
const prettyAbility = (id: string) => gen9.abilities.get(id)?.name ?? id;

async function main() {
  console.log(`Baixando ${URL} ...`);
  const res = await fetch(URL);
  if (!res.ok) {
    throw new Error(`Falha ao baixar dump do Smogon: ${res.status} ${res.statusText}`);
  }
  const raw = (await res.json()) as RawDump;

  const pokemon: Record<string, PokemonMetaEntry> = {};
  let skipped = 0;

  for (const [name, entry] of Object.entries(raw.data)) {
    const hasData = Object.values(entry.Abilities).reduce((a, b) => a + b, 0) > 0;
    if (!hasData) {
      skipped++;
      continue;
    }

    pokemon[name] = {
      name,
      usagePercent: Math.round(entry.usage * 10000) / 100,
      rawCount: entry["Raw count"],
      teammates: topN(entry.Teammates, TOP_TEAMMATES, [name]),
      topItems: topN(entry.Items, TOP_ITEMS, undefined, prettyItem),
      topMoves: topN(entry.Moves, TOP_MOVES, undefined, prettyMove),
      topAbilities: topN(entry.Abilities, TOP_ABILITIES, undefined, prettyAbility),
      topTeraTypes: topN(entry["Tera Types"], TOP_TERA, ["nothing"]),
    };
  }

  const snapshot: MetaSnapshot = {
    generatedAt: new Date().toISOString(),
    sourceMonth: MONTH,
    format: FORMAT,
    ratingCutoff: CUTOFF,
    totalBattles: raw.info["number of battles"],
    pokemon,
  };

  const outPath = resolve(__dirname, "../data/meta/latest.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(snapshot));

  console.log(`OK: ${Object.keys(pokemon).length} pokemon processados (${skipped} ignorados sem dados).`);
  console.log(`Salvo em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

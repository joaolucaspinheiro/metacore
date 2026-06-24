import metaSnapshot from "../../../data/meta/latest.json";
import allSpecies from "../../../data/meta/species.json";
import type { MetaSnapshot } from "./types";

export function getMetaSnapshot(): MetaSnapshot {
  return metaSnapshot as MetaSnapshot;
}

export function listSpeciesNames(): string[] {
  return allSpecies as string[];
}

import metaSnapshot from "../../../data/meta/latest.json";
import type { MetaSnapshot } from "./types";

export function getMetaSnapshot(): MetaSnapshot {
  return metaSnapshot as MetaSnapshot;
}

export function listSpeciesNames(): string[] {
  return Object.keys(getMetaSnapshot().pokemon).sort();
}

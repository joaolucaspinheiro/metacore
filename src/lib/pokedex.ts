import { Dex } from "@pkmn/dex";

const gen9 = Dex.forGen(9);

function toID(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Nomes descritivos (ex: vindos da Limitless) que o @pkmn/dex não reconhece diretamente —
// convertidos pro formato canônico "Species-Forme" antes da resolução.
const RENAME_OVERRIDES: Record<string, string> = {
  "Heat Rotom": "Rotom-Heat",
  "Wash Rotom": "Rotom-Wash",
  "Mow Rotom": "Rotom-Mow",
  "Frost Rotom": "Rotom-Frost",
  "Fan Rotom": "Rotom-Fan",
  "Eternal Flower Floette": "Floette-Eternal",
  "Paldean Tauros Aqua Breed": "Tauros-Paldea-Aqua",
  "Paldean Tauros Blaze Breed": "Tauros-Paldea-Blaze",
  "Paldean Tauros Combat Breed": "Tauros-Paldea-Combat",
  "Paldean Tauros": "Tauros-Paldea-Combat",
  "Origin Giratina": "Giratina-Origin",
  "Origin Dialga": "Dialga-Origin",
  "Origin Palkia": "Palkia-Origin",
  "Crowned Sword Zacian": "Zacian-Crowned",
  "Crowned Shield Zamazenta": "Zamazenta-Crowned",
  "Therian Tornadus": "Tornadus-Therian",
  "Therian Thundurus": "Thundurus-Therian",
  "Therian Landorus": "Landorus-Therian",
  "Incarnate Tornadus": "Tornadus",
  "Incarnate Thundurus": "Thundurus",
  "Incarnate Landorus": "Landorus",
  "Sunny Castform": "Castform-Sunny",
  "Rainy Castform": "Castform-Rainy",
  "Snowy Castform": "Castform-Snowy",
  "Battle Bond Greninja": "Greninja-Bond",
  "School Wishiwashi": "Wishiwashi-School",
  "Dada Zarude": "Zarude-Dada",
  "Single Strike Urshifu": "Urshifu",
  "Rapid Strike Urshifu": "Urshifu-Rapid-Strike",
  "Hangry Morpeko": "Morpeko-Hangry",
  "Noice Face Eiscue": "Eiscue-Noice",
  "Shadow Rider Calyrex": "Calyrex-Shadow",
  "Ice Rider Calyrex": "Calyrex-Ice",
  "Cornerstone Mask Ogerpon": "Ogerpon-Cornerstone",
  "Hearthflame Mask Ogerpon": "Ogerpon-Hearthflame",
  "Wellspring Mask Ogerpon": "Ogerpon-Wellspring",
  "Bloodmoon Ursaluna": "Ursaluna-Bloodmoon",
  "White Kyurem": "Kyurem-White",
  "Black Kyurem": "Kyurem-Black",
  "Tatsugiri Droopy Form": "Tatsugiri-Droopy",
  "Origin Forme Dialga": "Dialga-Origin",
  "Origin Forme Palkia": "Palkia-Origin",
  "Aegislash Blade Forme": "Aegislash-Blade",
};

export function toSpriteId(name: string): string {
  const trimmed = name.trim();

  const genderMatch = trimmed.match(/^(.*?)\s*[♀♂]\s*$/);
  let base = genderMatch ? genderMatch[1] : trimmed;
  const genderSuffix = trimmed.includes("♀") ? "-F" : trimmed.includes("♂") ? "-M" : "";

  // "Mega X" / "Mega X Y" (prefixo, comum em dumps de torneio) -> "X-Mega" / "X-Mega-Y" (convenção do Showdown)
  const megaPrefixMatch = base.match(/^Mega (\S+)(?:\s+(.+))?$/);
  if (megaPrefixMatch) {
    const [, head, rest] = megaPrefixMatch;
    base = rest ? `${head}-Mega-${rest}` : `${head}-Mega`;
  }

  const renamed = RENAME_OVERRIDES[base] ?? base;

  try {
    const species = gen9.species.get(renamed + genderSuffix);
    if (species?.exists) {
      return species.forme ? `${toID(species.baseSpecies)}-${toID(species.forme)}` : species.id;
    }
  } catch {
    // segue pro fallback abaixo
  }

  const parts = renamed
    .toLowerCase()
    .replace(/[.':]/g, "")
    .split(/[\s-]+/)
    .filter(Boolean);
  const id = parts.length <= 1 ? (parts[0] ?? "") : `${parts[0]}-${parts.slice(1).join("")}`;
  return id + genderSuffix.toLowerCase();
}

export function spriteUrl(name: string): string {
  return `https://play.pokemonshowdown.com/sprites/gen5/${toSpriteId(name)}.png`;
}

export function getTypes(name: string): string[] {
  try {
    return gen9.species.get(name).types ?? [];
  } catch {
    return [];
  }
}

export type Tier = "S" | "A" | "B";

export function getTier(usagePercent: number): Tier {
  if (usagePercent >= 25) return "S";
  if (usagePercent >= 12) return "A";
  return "B";
}

const STAT_LABELS_PT: Record<string, string> = {
  hp: "HP",
  atk: "Ataque",
  def: "Defesa",
  spa: "Atq. Esp.",
  spd: "Def. Esp.",
  spe: "Velocidade",
};

export function getNatureEffect(name: string): string {
  try {
    const n = gen9.natures.get(name);
    if (!n || !n.exists) return "";
    if (!n.plus || !n.minus) return "Natureza neutra — não altera nenhum status.";
    return `+10% ${STAT_LABELS_PT[n.plus] ?? n.plus} / −10% ${STAT_LABELS_PT[n.minus] ?? n.minus}`;
  } catch {
    return "";
  }
}

export function getAbilityDesc(name: string): string {
  try {
    const a = gen9.abilities.get(name);
    if (!a || !a.exists) return "";
    return a.shortDesc || a.desc || "";
  } catch {
    return "";
  }
}

export function getMoveDesc(name: string): string {
  try {
    const m = gen9.moves.get(name);
    if (!m || !m.exists) return "";
    const power = m.basePower ? `${m.basePower} BP` : "—";
    return `${m.type} · ${m.category} · ${power} — ${m.shortDesc || m.desc || ""}`;
  } catch {
    return "";
  }
}

export function listItemNames(): string[] {
  return gen9.items.all().map((i) => i.name).sort();
}

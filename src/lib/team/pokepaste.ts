import type { TeamContent } from "./schema";

const STAT_ORDER: { key: keyof TeamContent[number]["statPoints"]; label: string }[] = [
  { key: "hp", label: "HP" },
  { key: "atk", label: "Atk" },
  { key: "def", label: "Def" },
  { key: "spa", label: "SpA" },
  { key: "spd", label: "SpD" },
  { key: "spe", label: "Spe" },
];

// Pokémon Champions usa Stat Points (0-32 por stat); convertido pra EVs (1 SP = 8 EVs) pra compatibilidade com Pokepaste/Showdown.
function statPointsToEvLine(statPoints: TeamContent[number]["statPoints"]): string {
  const parts = STAT_ORDER.map(({ key, label }) => {
    const ev = Math.min(252, statPoints[key] * 8);
    return ev > 0 ? `${ev} ${label}` : null;
  }).filter(Boolean);
  return parts.join(" / ");
}

export function teamToPokepaste(content: TeamContent, level = 50): string {
  return content
    .filter((slot) => slot.species)
    .map((slot) => {
      const lines: string[] = [];
      lines.push(slot.item ? `${slot.species} @ ${slot.item}` : `${slot.species}`);
      if (slot.ability) lines.push(`Ability: ${slot.ability}`);
      lines.push(`Level: ${level}`);
      if (slot.tera) lines.push(`Tera Type: ${slot.tera}`);
      const evLine = statPointsToEvLine(slot.statPoints);
      if (evLine) lines.push(`EVs: ${evLine}`);
      lines.push(`${slot.nature} Nature`);
      for (const move of slot.moves) {
        if (move) lines.push(`- ${move}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

"use client";

import { useState } from "react";
import { spriteUrl, type Tier } from "@/lib/pokedex";

const TYPE_BG: Record<string, string> = {
  Normal: "bg-zinc-500",
  Fire: "bg-orange-500",
  Water: "bg-blue-500",
  Electric: "bg-yellow-400",
  Grass: "bg-emerald-500",
  Ice: "bg-cyan-300",
  Fighting: "bg-amber-700",
  Poison: "bg-purple-500",
  Ground: "bg-amber-600",
  Flying: "bg-sky-400",
  Psychic: "bg-pink-500",
  Bug: "bg-lime-500",
  Rock: "bg-stone-600",
  Ghost: "bg-violet-700",
  Dragon: "bg-indigo-600",
  Dark: "bg-zinc-700",
  Steel: "bg-slate-400",
  Fairy: "bg-pink-400",
};

const TYPE_TEXT: Record<string, string> = {
  Normal: "text-white",
  Fire: "text-white",
  Water: "text-white",
  Electric: "text-zinc-900",
  Grass: "text-white",
  Ice: "text-zinc-900",
  Fighting: "text-white",
  Poison: "text-white",
  Ground: "text-white",
  Flying: "text-zinc-900",
  Psychic: "text-white",
  Bug: "text-zinc-900",
  Rock: "text-white",
  Ghost: "text-white",
  Dragon: "text-white",
  Dark: "text-zinc-100",
  Steel: "text-zinc-900",
  Fairy: "text-white",
};

export const TIER_CLS: Record<Tier, string> = {
  S: "text-red-400 border-red-500/40 bg-red-500/10",
  A: "text-orange-400 border-orange-500/40 bg-orange-500/10",
  B: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
};

export function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase leading-none ${TYPE_BG[type] ?? "bg-zinc-600"} ${TYPE_TEXT[type] ?? "text-white"}`}
    >
      {type}
    </span>
  );
}

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border font-mono leading-none ${TIER_CLS[tier]}`}>
      {tier}
    </span>
  );
}

export function SpriteImg({ name, size = 72 }: { name: string; size?: number }) {
  const [err, setErr] = useState(false);
  return err ? (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center text-zinc-600 text-2xl select-none"
    >
      ?
    </div>
  ) : (
    <img
      src={spriteUrl(name)}
      alt={name}
      width={size}
      height={size}
      className="object-contain drop-shadow-md"
      style={{ imageRendering: "pixelated" }}
      onError={() => setErr(true)}
    />
  );
}

export function PlacingBadge({ placing }: { placing: number | null }) {
  if (!placing) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-bold border font-mono leading-none text-zinc-500 bg-zinc-500/10 border-zinc-600/40">
        —
      </span>
    );
  }
  const label = placing === 1 ? "1º lugar" : placing <= 4 ? `Top 4` : placing <= 8 ? `Top 8` : `${placing}º`;
  const cls =
    placing === 1
      ? "text-yellow-300 bg-yellow-400/15 border-yellow-400/40"
      : placing <= 4
        ? "text-orange-300 bg-orange-400/15 border-orange-400/40"
        : placing <= 8
          ? "text-emerald-300 bg-emerald-400/15 border-emerald-400/40"
          : "text-zinc-400 bg-zinc-500/10 border-zinc-600/40";
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold border font-mono leading-none ${cls}`}>{label}</span>;
}

export function CompatBadge({ pct }: { pct: number }) {
  const cls =
    pct >= 70
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-500/40"
      : pct >= 50
        ? "text-yellow-400 bg-yellow-400/10 border-yellow-500/40"
        : "text-zinc-400 bg-zinc-400/10 border-zinc-600/40";
  return (
    <span className={`px-2.5 py-1 rounded-full text-sm font-bold border font-mono leading-none ${cls}`}>
      {pct}%
    </span>
  );
}

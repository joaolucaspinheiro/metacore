"use client";

import { useMemo, useRef, useState } from "react";
import { listSpeciesNames } from "@/lib/meta/loader";
import { getTypes } from "@/lib/pokedex";
import { SpriteImg, TypeBadge } from "@/components/pokemon/atoms";
import { useT } from "@/lib/i18n/context";

export function SlotSpeciesPicker({
  excluded,
  onSelect,
}: {
  excluded: string[];
  onSelect: (name: string) => void;
}) {
  const t = useT("slotSpeciesPicker");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allSpecies = useMemo(() => listSpeciesNames(), []);
  const filtered = query
    ? allSpecies.filter((n) => n.toLowerCase().includes(query.toLowerCase()) && !excluded.includes(n)).slice(0, 8)
    : [];

  function pick(name: string) {
    onSelect(name);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const name = filtered[highlighted];
      if (name) pick(name);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlighted(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={t("placeholder")}
        className="w-full bg-transparent text-zinc-200 placeholder-zinc-600 outline-none text-sm"
      />
      {open && query && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/50 max-h-72 overflow-y-auto">
          {filtered.map((name, i) => (
            <button
              key={name}
              onMouseDown={() => pick(name)}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                i === highlighted ? "bg-zinc-800" : "hover:bg-zinc-800/60"
              }`}
            >
              <SpriteImg name={name} size={32} />
              <div>
                <div className="text-white text-sm font-medium">{name}</div>
                <div className="flex gap-1 mt-0.5">
                  {getTypes(name).map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

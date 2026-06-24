"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { getMovepool } from "@/lib/pokedex";

export function SlotMovePicker({
  species,
  value,
  excluded,
  onSelect,
}: {
  species: string;
  value: string;
  excluded: string[];
  onSelect: (name: string) => void;
}) {
  const [pool, setPool] = useState<string[] | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPool(null);
    getMovepool(species).then(setPool);
  }, [species]);

  const loading = pool === null;
  const filtered =
    pool && open
      ? pool.filter((m) => m.toLowerCase().includes(query.toLowerCase()) && !excluded.includes(m)).slice(0, 8)
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
      <div className="relative">
        <input
          ref={inputRef}
          value={open ? query : value}
          disabled={loading}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          placeholder={loading ? "Carregando golpes..." : "Escolher golpe..."}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60 transition-colors placeholder-zinc-600 disabled:opacity-60"
        />
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden z-50 max-h-56 overflow-y-auto shadow-2xl shadow-black/50">
          {filtered.map((name, i) => (
            <button
              key={name}
              onMouseDown={() => pick(name)}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full px-3 py-1.5 text-left text-sm transition-colors ${
                i === highlighted ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800/60"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      {open && pool && pool.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-500 text-xs z-50">
          Não encontramos o movepool dessa espécie.
        </div>
      )}
    </div>
  );
}

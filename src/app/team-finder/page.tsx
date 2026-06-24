"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Eye, Loader2, Pencil, Search, X } from "lucide-react";
import { listSpeciesNames } from "@/lib/meta/loader";
import { getAbilityDesc, getMoveDesc, getNatureEffect, getTypes } from "@/lib/pokedex";
import { PlacingBadge, SpriteImg, TypeBadge } from "@/components/pokemon/atoms";
import { InfoTooltip } from "@/components/builder/InfoTooltip";
import { PokepasteButton } from "@/components/team/PokepasteButton";
import { createTeam } from "@/server/actions/team-actions";
import type { TeamContent } from "@/lib/team/schema";

function rosterToPokepasteContent(roster: RosterEntry[]): TeamContent {
  return Array.from({ length: 6 }, (_, i) => {
    const p = roster[i];
    if (!p) {
      return {
        species: null,
        ability: "",
        item: "",
        tera: "Normal",
        moves: ["", "", "", ""],
        nature: "Serious",
        statPoints: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      };
    }
    return {
      species: p.name,
      ability: p.ability ?? "",
      item: p.item ?? "",
      tera: p.tera ?? "Normal",
      moves: [p.attacks[0] ?? "", p.attacks[1] ?? "", p.attacks[2] ?? "", p.attacks[3] ?? ""],
      nature: p.nature ?? "Serious",
      statPoints: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    };
  });
}

interface RosterEntry {
  id: string;
  name: string;
  item: string | null;
  ability: string | null;
  attacks: string[];
  nature: string | null;
  tera: string | null;
}

interface SearchResult {
  id: string;
  source: "tournament" | "community";
  title: string;
  subtitle: string;
  date: string;
  placing: number | null;
  slug: string | null;
  roster: RosterEntry[];
}

const MAX_SPECIES = 6;

export default function TeamFinderPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [isDefault, setIsDefault] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [sort, setSort] = useState<"best" | "recent">("best");
  const [source, setSource] = useState<"tournament" | "community">("tournament");
  const inputRef = useRef<HTMLInputElement>(null);
  const { status: sessionStatus } = useSession();
  const router = useRouter();

  async function importTeam(team: SearchResult) {
    if (sessionStatus !== "authenticated") {
      signIn("google");
      return;
    }
    setImportingId(team.id);
    setImportError(null);
    try {
      const content = rosterToPokepasteContent(team.roster);
      const result = await createTeam(`${team.subtitle} — ${team.title}`, content, false);
      router.push(`/builder?teamId=${result.id}`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Erro ao importar o time.");
      setImportingId(null);
    }
  }

  const atLimit = selected.length >= MAX_SPECIES;

  const allSpecies = useMemo(() => listSpeciesNames(), []);
  const filtered =
    query && !atLimit
      ? allSpecies.filter((n) => n.toLowerCase().includes(query.toLowerCase()) && !selected.includes(n)).slice(0, 8)
      : [];

  function add(name: string) {
    if (atLimit) return;
    setSelected((prev) => [...prev, name]);
    setQuery("");
    setHighlighted(0);
    inputRef.current?.focus();
  }

  function remove(name: string) {
    setSelected((prev) => prev.filter((s) => s !== name));
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
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
      if (name) add(name);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function buildQs(skip: number) {
    const p = new URLSearchParams();
    if (selected.length > 0) p.set("species", selected.join(","));
    p.set("sort", sort);
    p.set("source", source);
    if (skip > 0) p.set("skip", String(skip));
    return p.toString();
  }

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch(`/api/teams/search?${buildQs(0)}`);
        const data = await res.json();
        if (!active) return;
        setResults(data.teams);
        setIsDefault(data.isDefault);
        setHasMore(data.hasMore);
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, sort, source]);

  async function loadMore() {
    if (!results) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/teams/search?${buildQs(results.length)}`);
      const data = await res.json();
      setResults((prev) => [...(prev ?? []), ...data.teams]);
      setHasMore(data.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, loading, results]);

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="font-rajdhani text-5xl font-bold text-white mb-2 leading-tight">Team Finder</h2>
          <p className="text-zinc-500">
            Busque times reais de torneios de Pokémon Champions, ou times públicos da comunidade MetaCore.
          </p>
        </div>

        <div className="relative mb-4">
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 focus-within:border-emerald-500/50 rounded-xl px-4 py-3.5 transition-colors">
            <Search className="w-5 h-5 text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              disabled={atLimit}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlighted(0);
                setOpen(true);
              }}
              onKeyDown={onInputKeyDown}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder={atLimit ? "Máximo de 6 Pokémon — remova um pra adicionar outro" : "Buscar Pokémon... ex: Garchomp, Whimsicott"}
              className="flex-1 bg-transparent text-white placeholder-zinc-600 outline-none text-sm disabled:cursor-not-allowed"
            />
            {query && (
              <button onMouseDown={() => setQuery("")}>
                <X className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
              </button>
            )}
          </div>

          {open && query && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-40 shadow-2xl shadow-black/50">
              {filtered.map((name, i) => (
                <button
                  key={name}
                  onMouseDown={() => add(name)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                    i === highlighted ? "bg-zinc-800" : "hover:bg-zinc-800/60"
                  }`}
                >
                  <SpriteImg name={name} size={36} />
                  <div className="flex-1">
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

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
            <span className="text-zinc-500 text-xs font-mono mr-1">Procurando times com:</span>
            {selected.map((name) => (
              <div
                key={name}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 bg-zinc-800 border border-zinc-700 rounded-lg"
              >
                <SpriteImg name={name} size={28} />
                <span className="text-zinc-200 text-sm font-medium">{name}</span>
                <button onClick={() => remove(name)} className="text-zinc-600 hover:text-red-400 transition-colors ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setSelected([])}
              className="ml-auto flex items-center gap-2 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-medium rounded-xl text-sm transition-all"
            >
              Limpar time
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setSource("tournament")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                source === "tournament" ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Campeonatos
            </button>
            <button
              onClick={() => setSource("community")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                source === "community" ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Comunidade
            </button>
          </div>
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setSort("best")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                sort === "best" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Melhor colocação
            </button>
            <button
              onClick={() => setSort("recent")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                sort === "recent" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Mais recentes
            </button>
          </div>
        </div>

        {results !== null && (
          <div className={loading ? "opacity-50 transition-opacity" : "transition-opacity"}>
            <div className="mb-5">
              <h3 className="font-rajdhani text-3xl font-bold text-white leading-tight">
                {isDefault
                  ? source === "community"
                    ? "Times da comunidade"
                    : "Times mais usados"
                  : `${results.length}+ ${results.length === 1 ? "time encontrado" : "times encontrados"}`}
              </h3>
              <p className="text-zinc-500 text-sm mt-1">
                {source === "community"
                  ? "Times públicos salvos por outros jogadores do MetaCore."
                  : isDefault
                    ? "Comece por aqui: os times reais mais bem colocados no meta atual — bom ponto de partida pra saber em quais Pokémon focar."
                    : "Times reais de torneios."}
              </p>
            </div>

            {importError && <p className="text-red-400 text-sm mb-4">{importError}</p>}

            {results.length === 0 && (
              <div className="text-center py-16 text-zinc-500 text-sm">
                {source === "community"
                  ? "Nenhum time público da comunidade encontrado ainda."
                  : isDefault
                    ? "Ainda não temos times importados. Tente de novo em alguns minutos."
                    : "Nenhum time real encontrado com essa combinação ainda. Tente menos Pokémon ou outra combinação."}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {results.map((team) => (
                <div key={team.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {team.source === "tournament" ? (
                          <PlacingBadge placing={team.placing} />
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold border font-mono leading-none text-sky-300 bg-sky-400/10 border-sky-400/30">
                            Comunidade
                          </span>
                        )}
                        <span className="text-white font-semibold text-sm truncate">{team.title}</span>
                      </div>
                      <div className="text-zinc-500 text-xs mt-1">
                        {team.subtitle} · {new Date(team.date).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {team.source === "community" && team.slug ? (
                        <Link
                          href={`/teams/${team.slug}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver time
                        </Link>
                      ) : (
                        <button
                          onClick={() => importTeam(team)}
                          disabled={importingId === team.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-all disabled:opacity-70"
                        >
                          {importingId === team.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Pencil className="w-3.5 h-3.5" />
                          )}
                          {importingId === team.id ? "Abrindo..." : "Abrir no Builder"}
                        </button>
                      )}
                      <button
                        onClick={() => setExpanded(expanded === team.id ? null : team.id)}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all"
                      >
                        {expanded === team.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {team.roster.map((p) => (
                      <div key={p.id} className="w-14 h-14 bg-zinc-800/60 rounded-lg flex items-center justify-center shrink-0">
                        <SpriteImg name={p.name} size={48} />
                      </div>
                    ))}
                  </div>

                  {expanded === team.id && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-zinc-800">
                      {team.roster.map((p) => (
                        <div key={p.id} className="bg-zinc-800/40 rounded-xl p-2.5 flex flex-col items-center text-center">
                          <div className="w-14 h-14 mb-1 flex items-center justify-center">
                            <SpriteImg name={p.name} size={56} />
                          </div>
                          <div className="text-white font-semibold text-xs mb-1">{p.name}</div>
                          <div className="text-zinc-500 text-[10px] mb-0.5 truncate w-full">{p.item ?? "—"}</div>
                          <div className="text-zinc-300 text-[10px] font-medium mb-1.5 inline-flex items-center justify-center">
                            <span className="inline-flex items-center">
                              {p.nature ?? "—"}
                              {p.nature && <InfoTooltip text={getNatureEffect(p.nature)} />}
                            </span>
                            <span className="mx-1">·</span>
                            <span className="inline-flex items-center">
                              {p.ability ?? "—"}
                              {p.ability && <InfoTooltip text={getAbilityDesc(p.ability)} />}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5 w-full">
                            {p.attacks.map((m) => (
                              <div key={m} className="text-zinc-300 text-[10px] bg-zinc-900/60 rounded px-1 py-0.5 inline-flex items-center justify-center w-full">
                                {m}
                                <InfoTooltip text={getMoveDesc(m)} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {expanded === team.id && (
                    <div className="flex justify-end mt-3">
                      <PokepasteButton content={rosterToPokepasteContent(team.roster)} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center mt-6 h-10">
                {loadingMore && (
                  <span className="flex items-center gap-2 text-zinc-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Carregando mais...
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

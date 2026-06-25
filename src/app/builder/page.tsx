"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Check, ChevronDown, ChevronUp, Loader2, Plus, Star } from "lucide-react";
import { getMetaSnapshot } from "@/lib/meta/loader";
import { suggestTeammates } from "@/lib/meta/suggest";
import { getAbilityDesc, getMoveDesc, getNatureEffect, getTier, getTypes, listItemNames } from "@/lib/pokedex";
import { CompatBadge, SpriteImg, TierBadge, TypeBadge } from "@/components/pokemon/atoms";
import { SlotSpeciesPicker } from "@/components/builder/SlotSpeciesPicker";
import { SlotMovePicker } from "@/components/builder/SlotMovePicker";
import { InfoTooltip } from "@/components/builder/InfoTooltip";
import { SaveTeamModal } from "@/components/team/SaveTeamModal";
import { CopyLinkButton } from "@/components/team/CopyLinkButton";
import { PokepasteButton } from "@/components/team/PokepasteButton";
import { createTeam, getTeamForEdit, updateTeam } from "@/server/actions/team-actions";
import { useT } from "@/lib/i18n/context";

const NATURES = [
  "Lonely", "Brave", "Adamant", "Naughty", "Bold", "Relaxed", "Impish",
  "Lax", "Timid", "Hasty", "Serious", "Jolly", "Naive", "Modest", "Mild", "Quiet",
  "Rash", "Calm", "Gentle", "Sassy", "Careful",
];

const TERA_TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground",
  "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy", "Stellar",
];

const STAT_LABELS: Record<keyof StatPoints, string> = {
  hp: "HP",
  atk: "Atk",
  def: "Def",
  spa: "SpA",
  spd: "SpD",
  spe: "Spe",
};

const STAT_POINT_CAP_PER_STAT = 32;
const STAT_POINT_TOTAL = 66;

interface StatPoints {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

function emptyStatPoints(): StatPoints {
  return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
}

interface Slot {
  species: string | null;
  ability: string;
  item: string;
  tera: string;
  moves: [string, string, string, string];
  nature: string;
  statPoints: StatPoints;
  open: boolean;
}

function emptySlot(): Slot {
  return {
    species: null,
    ability: "",
    item: "",
    tera: "Normal",
    moves: ["", "", "", ""],
    nature: "Timid",
    statPoints: emptyStatPoints(),
    open: false,
  };
}

function slotFromSpecies(name: string): Slot {
  const entry = getMetaSnapshot().pokemon[name];
  return {
    species: name,
    ability: entry?.topAbilities[0]?.name ?? "",
    item: entry?.topItems[0]?.name ?? "",
    tera: entry?.topTeraTypes[0]?.name ?? "Normal",
    moves: [
      entry?.topMoves[0]?.name ?? "",
      entry?.topMoves[1]?.name ?? "",
      entry?.topMoves[2]?.name ?? "",
      entry?.topMoves[3]?.name ?? "",
    ],
    nature: "Timid",
    statPoints: emptyStatPoints(),
    open: false,
  };
}

function StatPointsEditor({ value, onChange }: { value: StatPoints; onChange: (v: StatPoints) => void }) {
  const t = useT("builder");
  const total = Object.values(value).reduce((a, b) => a + b, 0);
  const over = total > STAT_POINT_TOTAL;

  function setStat(key: keyof StatPoints, raw: number) {
    const clamped = Math.max(0, Math.min(STAT_POINT_CAP_PER_STAT, raw || 0));
    onChange({ ...value, [key]: clamped });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">{t("statPoints")}</span>
        <span className={`text-xs font-mono ${over ? "text-red-400" : "text-zinc-500"}`}>
          {total}/{STAT_POINT_TOTAL}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(value) as (keyof StatPoints)[]).map((key) => (
          <label key={key} className="block">
            <span className="text-zinc-500 text-[10px] font-mono block mb-1">{STAT_LABELS[key]}</span>
            <input
              type="number"
              min={0}
              max={STAT_POINT_CAP_PER_STAT}
              value={value[key]}
              onChange={(e) => setStat(key, Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm outline-none focus:border-emerald-500/60 transition-colors font-mono"
            />
          </label>
        ))}
      </div>
      {over && <p className="text-red-400 text-[11px] mt-1.5">{t("overLimit", { n: STAT_POINT_TOTAL })}</p>}
    </div>
  );
}

function BuilderContent() {
  const t = useT("builder");
  const searchParams = useSearchParams();
  const initialSpecies = (searchParams.get("species") ?? "").split(",").filter(Boolean);
  const teamIdParam = searchParams.get("teamId");

  const [team, setTeam] = useState<Slot[]>(() =>
    Array.from({ length: 6 }, (_, i) => (initialSpecies[i] ? slotFromSpecies(initialSpecies[i]) : emptySlot()))
  );
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState(t("defaultTeamName"));
  const [teamIsPublic, setTeamIsPublic] = useState(false);
  const [teamSlug, setTeamSlug] = useState<string | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(!!teamIdParam);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!teamIdParam) return;
    let active = true;
    getTeamForEdit(teamIdParam)
      .then((data) => {
        if (!active) return;
        setTeamId(data.id);
        setTeamName(data.name);
        setTeamIsPublic(data.isPublic);
        setTeam(data.content.map((slot) => ({ ...slot, open: false })));
      })
      .catch((err) => {
        if (active) setSaveError(err instanceof Error ? err.message : t("cantLoadTeam"));
      })
      .finally(() => {
        if (active) setLoadingTeam(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamIdParam]);

  function upd(i: number, patch: Partial<Slot>) {
    const next = [...team];
    next[i] = { ...next[i], ...patch };
    setTeam(next);
  }

  const filled = team.filter((s) => s.species).length;
  const teamSpecies = team.filter((s) => s.species).map((s) => s.species as string);

  const snapshot = useMemo(() => getMetaSnapshot(), []);
  const itemNames = useMemo(() => listItemNames(), []);
  const suggestions = useMemo(
    () => (teamSpecies.length > 0 && filled < 6 ? suggestTeammates(teamSpecies, snapshot, 6) : []),
    [teamSpecies, snapshot, filled]
  );

  function addSuggestion(name: string) {
    const emptyIndex = team.findIndex((s) => !s.species);
    if (emptyIndex === -1) return;
    upd(emptyIndex, slotFromSpecies(name));
  }

  const { status: sessionStatus } = useSession();
  const router = useRouter();

  function openSaveModal() {
    if (sessionStatus !== "authenticated") {
      signIn("google");
      return;
    }
    setSaveError(null);
    setShowSaveModal(true);
  }

  async function handleConfirmSave(name: string, isPublic: boolean) {
    setSaving(true);
    setSaveError(null);
    try {
      const content = team.map(({ open: _open, ...rest }) => rest);
      const result = teamId
        ? await updateTeam(teamId, name, content, isPublic)
        : await createTeam(name, content, isPublic);
      router.refresh();
      setTeamId(result.id);
      setTeamName(name);
      setTeamIsPublic(isPublic);
      setTeamSlug(result.slug);
      setShowSaveModal(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
      router.replace(`/builder?teamId=${result.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h2 className="font-rajdhani text-5xl font-bold text-white mb-1 leading-tight">{teamId ? teamName : t("defaultTitle")}</h2>
            <p className="text-zinc-500 text-sm">
              {loadingTeam ? t("loadingTeam") : t("configureDesc")}
              <span className="ml-2 text-zinc-600 font-mono">{filled}/6</span>
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              {filled > 0 && <PokepasteButton content={team.map(({ open: _o, ...rest }) => rest)} />}
              {teamSlug && <CopyLinkButton slug={teamSlug} />}
              <button
                onClick={openSaveModal}
                disabled={saving || filled === 0}
                title={filled === 0 ? t("addAtLeastOne") : undefined}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  justSaved ? "bg-emerald-600 text-white" : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                }`}
              >
                {justSaved ? (
                  <Check className="w-4 h-4 animate-pop" />
                ) : saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Star className="w-4 h-4" />
                )}
                {justSaved ? t("saved") : saving ? t("savingLabel") : teamId ? t("saveChanges") : t("saveTeam")}
              </button>
            </div>
            {saveError && <p className="text-red-400 text-xs max-w-[220px] text-right">{saveError}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8 p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-x-auto">
          {team.map((slot, i) => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  slot.species ? "bg-zinc-800" : "bg-zinc-900 border border-dashed border-zinc-700"
                }`}
              >
                {slot.species ? <SpriteImg name={slot.species} size={48} /> : <Plus className="w-5 h-5 text-zinc-600" />}
              </div>
              <span className="text-zinc-600 text-[10px] font-mono">
                {slot.species?.split("-")[0] ?? t("slot", { n: i + 1 })}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {team.map((slot, i) => {
            let headerEl: HTMLDivElement | null = null;
            return (
            <div
              key={i}
              className={`bg-zinc-900 rounded-2xl border transition-all relative ${
                slot.species
                  ? slot.open
                    ? "border-emerald-500/30"
                    : "border-zinc-800"
                  : "border-zinc-700 border-dashed hover:border-emerald-500/40"
              }`}
            >
              <div
                ref={(el) => {
                  headerEl = el;
                }}
                onClick={() => {
                  if (!slot.species) headerEl?.querySelector("input")?.focus();
                }}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-colors ${
                  !slot.species ? "cursor-pointer hover:bg-zinc-800/50" : ""
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    slot.species
                      ? "bg-zinc-800"
                      : "bg-zinc-800/60 border-2 border-dashed border-zinc-600 group-hover:border-emerald-500/60"
                  }`}
                >
                  {slot.species ? <SpriteImg name={slot.species} size={56} /> : <Plus className="w-6 h-6 text-zinc-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  {slot.species ? (
                    <>
                      <div className="text-white font-semibold mb-1 text-sm">{slot.species}</div>
                      <div className="flex gap-1 mb-1.5">
                        {getTypes(slot.species).map((t) => (
                          <TypeBadge key={t} type={t} />
                        ))}
                      </div>
                      <div className="text-zinc-500 text-xs font-mono truncate flex items-center gap-1">
                        <span>{slot.item} ·</span>
                        <span className="text-zinc-400 inline-flex items-center">
                          {slot.nature}
                          <InfoTooltip text={getNatureEffect(slot.nature)} />
                        </span>
                      </div>
                      <div className="text-[11px] font-mono mt-0.5">
                        <span
                          className={
                            Object.values(slot.statPoints).reduce((a, b) => a + b, 0) > STAT_POINT_TOTAL
                              ? "text-red-400"
                              : "text-emerald-500/80"
                          }
                        >
                          SP {Object.values(slot.statPoints).reduce((a, b) => a + b, 0)}/{STAT_POINT_TOTAL}
                        </span>
                      </div>
                    </>
                  ) : (
                    <SlotSpeciesPicker excluded={teamSpecies} onSelect={(name) => upd(i, slotFromSpecies(name))} />
                  )}
                </div>
                {slot.species && (
                  <button
                    onClick={() => upd(i, { open: !slot.open })}
                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all shrink-0"
                  >
                    {slot.open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {slot.open && slot.species && (
                <div className="border-t border-zinc-800 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-1.5 flex items-center">
                        {t("ability")} <InfoTooltip text={getAbilityDesc(slot.ability)} />
                      </span>
                      <input
                        value={slot.ability}
                        onChange={(e) => upd(i, { ability: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60 transition-colors"
                      />
                    </label>
                    <label className="block">
                      <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest block mb-1.5">{t("item")}</span>
                      <input
                        value={slot.item}
                        list={`items-${i}`}
                        onChange={(e) => upd(i, { item: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60 transition-colors"
                      />
                      <datalist id={`items-${i}`}>
                        {itemNames.map((name) => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest block mb-1.5">{t("teraType")}</span>
                      <select
                        value={slot.tera}
                        onChange={(e) => upd(i, { tera: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60 transition-colors"
                      >
                        {TERA_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-1.5 flex items-center">
                        {t("nature")} <span className="text-zinc-600 ml-1">{t("statAlignment")}</span>
                        <InfoTooltip text={getNatureEffect(slot.nature)} />
                      </span>
                      <select
                        value={slot.nature}
                        onChange={(e) => upd(i, { nature: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60 transition-colors"
                      >
                        {NATURES.map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest block mb-1.5">{t("moves")}</span>
                    <div className="grid grid-cols-2 gap-2">
                      {slot.moves.map((m, mi) => (
                        <div key={mi} className="flex items-center gap-1.5">
                          <SlotMovePicker
                            species={slot.species as string}
                            value={m}
                            excluded={slot.moves.filter((_, j) => j !== mi)}
                            onSelect={(name) => {
                              const moves = [...slot.moves] as [string, string, string, string];
                              moves[mi] = name;
                              upd(i, { moves });
                            }}
                          />
                          <InfoTooltip text={getMoveDesc(m)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <StatPointsEditor value={slot.statPoints} onChange={(statPoints) => upd(i, { statPoints })} />

                  <button
                    onClick={() => upd(i, emptySlot())}
                    className="text-red-400/60 hover:text-red-400 text-xs font-medium transition-colors"
                  >
                    {t("removeFromTeam")}
                  </button>
                </div>
              )}
            </div>
            );
          })}
        </div>

        {suggestions.length > 0 && (
          <div>
            <div className="mb-5">
              <h3 className="font-rajdhani text-3xl font-bold text-white leading-tight">{t("suggestionsTitle")}</h3>
              <p className="text-zinc-500 text-sm mt-1">{t("suggestionsDesc")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((s) => {
                const tier = getTier(s.usagePercent);
                const types = getTypes(s.name);
                const why = s.matchedWith
                  .slice(0, 2)
                  .map((m) => `${m.name} ${m.percent}%`)
                  .join(" · ");
                return (
                  <div key={s.name} className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 rounded-2xl p-4 transition-all">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 bg-zinc-800/60 rounded-xl flex items-center justify-center shrink-0">
                        <SpriteImg name={s.name} size={48} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TierBadge tier={tier} />
                        </div>
                        <div className="text-white font-semibold text-sm mb-1">{s.name}</div>
                        <div className="flex flex-wrap gap-1">
                          {types.map((t) => (
                            <TypeBadge key={t} type={t} />
                          ))}
                        </div>
                      </div>
                      <CompatBadge pct={s.score} />
                    </div>
                    <div className="text-zinc-500 text-xs mb-3 leading-relaxed">
                      {t("matches")} <span className="text-zinc-400">{why}</span>
                    </div>
                    <button
                      onClick={() => addSuggestion(s.name)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> {t("addToTeam")}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <SaveTeamModal
        open={showSaveModal}
        initialName={teamName}
        initialPublic={teamIsPublic}
        saving={saving}
        error={saveError}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense>
      <BuilderContent />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { useT } from "@/lib/i18n/context";

interface NicknameModalProps {
  open: boolean;
  initialNickname: string;
  onClose: () => void;
  onConfirm: (nickname: string) => Promise<void>;
}

export function NicknameModal({ open, initialNickname, onClose, onConfirm }: NicknameModalProps) {
  const t = useT("common");
  const tModal = useT("nicknameModal");
  const [value, setValue] = useState(initialNickname);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await onConfirm(value);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : tModal("error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 animate-pop">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-rajdhani text-xl font-bold text-white">{tModal("title")}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block mb-4">
          <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest block mb-1.5">
            {tModal("label")}
          </span>
          <input
            autoFocus
            value={value}
            maxLength={24}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim()) submit();
            }}
            placeholder={tModal("placeholder")}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60 transition-colors"
          />
        </label>

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 transition-all"
          >
            {t("cancel")}
          </button>
          <button
            onClick={submit}
            disabled={saving || !value.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold transition-all disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}

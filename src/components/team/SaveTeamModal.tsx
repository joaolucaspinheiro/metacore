"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock, Globe, X } from "lucide-react";

interface SaveTeamModalProps {
  open: boolean;
  initialName: string;
  initialPublic: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (name: string, isPublic: boolean) => void;
}

export function SaveTeamModal({
  open,
  initialName,
  initialPublic,
  saving,
  error,
  onClose,
  onConfirm,
}: SaveTeamModalProps) {
  const [name, setName] = useState(initialName);
  const [isPublic, setIsPublic] = useState(initialPublic);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setIsPublic(initialPublic);
    }
  }, [open, initialName, initialPublic]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 animate-pop">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-rajdhani text-xl font-bold text-white">Salvar time</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block mb-4">
          <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest block mb-1.5">Nome do time</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) onConfirm(name, isPublic);
            }}
            placeholder="Meu time"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60 transition-colors"
          />
        </label>

        <div className="mb-5">
          <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest block mb-1.5">Visibilidade</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsPublic(false)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                !isPublic
                  ? "bg-zinc-700 border-zinc-600 text-white"
                  : "bg-zinc-800/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Privado
            </button>
            <button
              onClick={() => setIsPublic(true)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                isPublic
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : "bg-zinc-800/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Público
            </button>
          </div>
          <p className="text-zinc-600 text-[11px] mt-1.5">
            {isPublic ? "Qualquer pessoa com o link pode ver, e ele aparece na busca da comunidade." : "Só você pode ver. Pode mudar isso depois."}
          </p>
        </div>

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(name, isPublic)}
            disabled={saving || !name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold transition-all disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

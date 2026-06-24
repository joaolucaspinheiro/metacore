"use client";

import { Info } from "lucide-react";

export function InfoTooltip({ text }: { text: string }) {
  if (!text) return null;
  return (
    <span className="group relative inline-flex items-center ml-1">
      <Info className="w-3 h-3 text-zinc-600 hover:text-emerald-400 cursor-help transition-colors" />
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-56 p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300 leading-relaxed z-50 shadow-xl normal-case font-sans">
        {text}
      </span>
    </span>
  );
}

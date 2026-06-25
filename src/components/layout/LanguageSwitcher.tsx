"use client";

import { useLocale } from "@/lib/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center rounded-lg border border-zinc-700 overflow-hidden text-xs font-mono font-bold shrink-0">
      <button
        onClick={() => setLocale("pt")}
        className={`px-2.5 py-1.5 transition-colors ${
          locale === "pt" ? "bg-emerald-500/15 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        PT
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1.5 transition-colors border-l border-zinc-700 ${
          locale === "en" ? "bg-emerald-500/15 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        EN
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";
import { teamToPokepaste } from "@/lib/team/pokepaste";
import { copyToClipboard } from "@/lib/clipboard";
import type { TeamContent } from "@/lib/team/schema";
import { useT } from "@/lib/i18n/context";

export function PokepasteButton({ content }: { content: TeamContent }) {
  const t = useT("pokepaste");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  async function copy() {
    const text = teamToPokepaste(content);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <button
      onClick={copy}
      title={t("tooltip")}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-white transition-all"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <ClipboardCopy className="w-4 h-4" />}
      {copied ? t("copied") : error ? t("error") : t("copy")}
    </button>
  );
}

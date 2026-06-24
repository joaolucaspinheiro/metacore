"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/teams/${slug}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 1500);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-white transition-all"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
      {copied ? "Link copiado!" : error ? "Erro ao copiar" : "Copiar link"}
    </button>
  );
}

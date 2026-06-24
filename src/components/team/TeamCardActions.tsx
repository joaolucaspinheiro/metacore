"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { deleteTeam, setTeamPublic } from "@/server/actions/team-actions";
import { CopyLinkButton } from "@/components/team/CopyLinkButton";

export function TeamCardActions({
  teamId,
  slug,
  initialPublic,
}: {
  teamId: string;
  slug: string;
  initialPublic: boolean;
}) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [busy, setBusy] = useState(false);

  async function togglePublic() {
    setBusy(true);
    try {
      await setTeamPublic(teamId, !isPublic);
      setIsPublic(!isPublic);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Excluir esse time? Essa ação não pode ser desfeita.")) return;
    setBusy(true);
    try {
      await deleteTeam(teamId);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link
        href={`/builder?teamId=${teamId}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-medium transition-all"
      >
        <Pencil className="w-3.5 h-3.5" /> Editar
      </Link>
      <button
        onClick={togglePublic}
        disabled={busy}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 ${
          isPublic
            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
            : "bg-zinc-800 border-zinc-700 text-zinc-400"
        }`}
      >
        {isPublic ? "Público" : "Privado"}
      </button>
      {isPublic && <CopyLinkButton slug={slug} />}
      <button
        onClick={handleDelete}
        disabled={busy}
        className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all disabled:opacity-50"
        title="Excluir time"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

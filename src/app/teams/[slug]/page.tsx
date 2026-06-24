import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { getAbilityDesc, getMoveDesc, getNatureEffect, getTypes } from "@/lib/pokedex";
import { SpriteImg, TypeBadge } from "@/components/pokemon/atoms";
import { CopyLinkButton } from "@/components/team/CopyLinkButton";
import { PokepasteButton } from "@/components/team/PokepasteButton";
import { InfoTooltip } from "@/components/builder/InfoTooltip";
import type { TeamSlot } from "@/lib/team/schema";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicTeamPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const team = await prisma.team.findUnique({
    where: { slug },
    include: { user: { select: { name: true, nickname: true } } },
  });

  if (!team) notFound();
  if (!team.isPublic && team.userId !== userId) notFound();

  const slots = team.content as unknown as TeamSlot[];
  const ownerDisplayName = team.user.nickname || team.user.name || "Treinador";

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="font-rajdhani text-4xl font-bold text-white mb-1 leading-tight">{team.name}</h2>
            <p className="text-zinc-500 text-sm">
              Time criado por <span className="text-zinc-300">{ownerDisplayName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {team.userId === userId && (
              <Link
                href={`/builder?teamId=${team.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-white transition-all"
              >
                <Pencil className="w-4 h-4" /> Editar
              </Link>
            )}
            <PokepasteButton content={slots} />
            <CopyLinkButton slug={team.slug} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {slots
            .filter((s) => s.species)
            .map((slot, i) => {
              const spLabels: [string, number][] = [
                ["HP", slot.statPoints.hp],
                ["Atk", slot.statPoints.atk],
                ["Def", slot.statPoints.def],
                ["SpA", slot.statPoints.spa],
                ["SpD", slot.statPoints.spd],
                ["Spe", slot.statPoints.spe],
              ];
              const spSummary = spLabels.filter(([, v]) => v > 0).map(([k, v]) => `${k}${v}`).join(" ");
              return (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col items-center text-center">
                  <div className="w-20 h-20 mb-1 flex items-center justify-center">
                    <SpriteImg name={slot.species as string} size={88} />
                  </div>
                  <div className="text-white font-semibold text-sm mb-1.5">{slot.species}</div>
                  <div className="flex gap-1 mb-2.5 justify-center">
                    {getTypes(slot.species as string).map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                  <div className="text-zinc-400 text-[11px] mb-1 truncate w-full">{slot.item || "—"}</div>
                  <div className="text-zinc-300 text-[11px] font-medium mb-1 inline-flex items-center justify-center">
                    <span className="inline-flex items-center">
                      {slot.nature}
                      <InfoTooltip text={getNatureEffect(slot.nature)} />
                    </span>
                    <span className="mx-1">·</span>
                    <span className="inline-flex items-center">
                      {slot.ability || "—"}
                      <InfoTooltip text={getAbilityDesc(slot.ability)} />
                    </span>
                  </div>
                  {spSummary && <div className="text-zinc-600 text-[10px] font-mono mb-2.5">{spSummary}</div>}
                  <div className="flex flex-col gap-0.5 w-full">
                    {slot.moves.filter(Boolean).map((m) => (
                      <div key={m} className="text-zinc-300 text-[11px] bg-zinc-800/50 rounded px-1.5 py-1 inline-flex items-center justify-center w-full">
                        {m}
                        <InfoTooltip text={getMoveDesc(m)} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

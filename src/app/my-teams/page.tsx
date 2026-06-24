import Link from "next/link";

export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SpriteImg } from "@/components/pokemon/atoms";
import { TeamCardActions } from "@/components/team/TeamCardActions";
import type { TeamSlot } from "@/lib/team/schema";

export default async function MyTeamsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-20">
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h2 className="font-rajdhani text-3xl font-bold text-white mb-3">Você precisa entrar</h2>
          <p className="text-zinc-500 text-sm">Faça login com Google para ver seus times salvos.</p>
        </div>
      </div>
    );
  }

  const teams = await prisma.team.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="font-rajdhani text-5xl font-bold text-white mb-2 leading-tight">Meus times</h2>
          <p className="text-zinc-500 text-sm">{teams.length} time(s) salvo(s).</p>
        </div>

        {teams.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm mb-4">Você ainda não salvou nenhum time.</p>
            <Link href="/builder" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
              Montar meu primeiro time →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {teams.map((team) => {
            const slots = (team.content as unknown as TeamSlot[]).filter((s) => s.species);
            return (
              <div key={team.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <Link href={`/teams/${team.slug}`} className="text-white font-semibold text-sm hover:text-emerald-400 transition-colors">
                    {team.name}
                  </Link>
                  <TeamCardActions teamId={team.id} slug={team.slug} initialPublic={team.isPublic} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {slots.map((s, i) => (
                    <div key={i} className="w-12 h-12 bg-zinc-800/60 rounded-lg flex items-center justify-center shrink-0">
                      <SpriteImg name={s.species as string} size={40} />
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

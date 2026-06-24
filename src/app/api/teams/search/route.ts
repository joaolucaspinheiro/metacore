import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TeamContent } from "@/lib/team/schema";

const PAGE_SIZE = 20;

interface SearchResultItem {
  id: string;
  source: "tournament" | "community";
  title: string;
  subtitle: string;
  date: string;
  placing: number | null;
  slug: string | null;
  roster: {
    id: string;
    name: string;
    item: string | null;
    ability: string | null;
    attacks: string[];
    nature: string | null;
    tera: string | null;
  }[];
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const speciesParam = params.get("species") ?? "";
  const species = speciesParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const sort = params.get("sort") === "recent" ? "recent" : "best";
  const source = params.get("source") === "community" ? "community" : "tournament";
  const skip = Math.max(0, Number(params.get("skip") ?? 0) || 0);
  const isDefault = species.length === 0;

  if (source === "community") {
    const teams = await prisma.team.findMany({
      where: {
        isPublic: true,
        ...(species.length > 0 ? { species: { hasEvery: species } } : {}),
      },
      include: { user: { select: { name: true, nickname: true } } },
      orderBy: sort === "recent" ? { createdAt: "desc" } : { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
    });

    const results: SearchResultItem[] = teams.map((t) => {
      const slots = t.content as unknown as TeamContent;
      const owner = t.user.nickname || t.user.name || "Treinador";
      return {
        id: t.id,
        source: "community",
        title: t.name,
        subtitle: `por ${owner}`,
        date: t.createdAt.toISOString(),
        placing: null,
        slug: t.slug,
        roster: slots
          .filter((s) => s.species)
          .map((s, i) => ({
            id: `${t.id}-${i}`,
            name: s.species as string,
            item: s.item || null,
            ability: s.ability || null,
            attacks: s.moves.filter(Boolean),
            nature: s.nature || null,
            tera: s.tera || null,
          })),
      };
    });

    return NextResponse.json({ teams: results, isDefault, hasMore: teams.length === PAGE_SIZE });
  }

  const tournamentTeams = await prisma.tournamentTeam.findMany({
    where: isDefault ? { placing: { not: null } } : { species: { hasEvery: species } },
    orderBy: sort === "recent" ? [{ tournamentDate: "desc" }] : [{ placing: "asc" }, { tournamentDate: "desc" }],
    skip,
    take: PAGE_SIZE,
  });

  const results: SearchResultItem[] = tournamentTeams.map((t) => ({
    id: t.id,
    source: "tournament",
    title: t.tournamentName,
    subtitle: t.playerName,
    date: t.tournamentDate.toISOString(),
    placing: t.placing,
    slug: null,
    roster: t.roster as unknown as SearchResultItem["roster"],
  }));

  return NextResponse.json({ teams: results, isDefault, hasMore: tournamentTeams.length === PAGE_SIZE });
}

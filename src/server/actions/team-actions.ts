"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teamContentSchema, type TeamContent } from "@/lib/team/schema";
import { generateUniqueSlug } from "@/lib/team/slug";

const MAX_TEAMS_PER_USER = 10;

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Você precisa estar logado.");
  return userId;
}

function extractSpecies(content: TeamContent): string[] {
  return content.filter((s) => s.species).map((s) => s.species as string);
}

export async function createTeam(name: string, content: TeamContent, isPublic = false) {
  const userId = await requireUserId();
  const parsed = teamContentSchema.parse(content);

  const teamCount = await prisma.team.count({ where: { userId } });
  if (teamCount >= MAX_TEAMS_PER_USER) {
    throw new Error(`Você atingiu o limite de ${MAX_TEAMS_PER_USER} times salvos. Exclua um time antes de criar outro.`);
  }

  const slug = await generateUniqueSlug();

  const team = await prisma.team.create({
    data: {
      userId,
      name: name.trim() || "Time sem nome",
      slug,
      content: parsed,
      species: extractSpecies(parsed),
      isPublic,
    },
  });

  revalidatePath("/my-teams");
  return { id: team.id, slug: team.slug };
}

export async function updateTeam(teamId: string, name: string, content: TeamContent, isPublic: boolean) {
  const userId = await requireUserId();
  const parsed = teamContentSchema.parse(content);

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.userId !== userId) throw new Error("Time não encontrado.");

  await prisma.team.update({
    where: { id: teamId },
    data: { name: name.trim() || "Time sem nome", content: parsed, species: extractSpecies(parsed), isPublic },
  });

  revalidatePath("/my-teams");
  revalidatePath(`/teams/${team.slug}`);
  return { id: team.id, slug: team.slug };
}

export async function deleteTeam(teamId: string) {
  const userId = await requireUserId();
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.userId !== userId) throw new Error("Time não encontrado.");

  await prisma.team.delete({ where: { id: teamId } });
  revalidatePath("/my-teams");
}

export async function setTeamPublic(teamId: string, isPublic: boolean) {
  const userId = await requireUserId();
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.userId !== userId) throw new Error("Time não encontrado.");

  await prisma.team.update({ where: { id: teamId }, data: { isPublic } });
  revalidatePath("/my-teams");
  revalidatePath(`/teams/${team.slug}`);
}

export async function getTeamForEdit(teamId: string) {
  const userId = await requireUserId();
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.userId !== userId) throw new Error("Time não encontrado.");
  return { id: team.id, name: team.name, isPublic: team.isPublic, content: team.content as unknown as TeamContent };
}

export async function listMyTeams() {
  const userId = await requireUserId();
  return prisma.team.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

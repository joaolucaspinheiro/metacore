import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

export async function generateUniqueSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = nanoid(8);
    const existing = await prisma.team.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  throw new Error("Não foi possível gerar um slug único, tente novamente.");
}

"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateNickname(nickname: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Você precisa estar logado.");

  const trimmed = nickname.trim().slice(0, 24);
  if (!trimmed) throw new Error("O apelido não pode ser vazio.");

  await prisma.user.update({ where: { id: userId }, data: { nickname: trimmed } });
  revalidatePath("/", "layout");
  return { nickname: trimmed };
}

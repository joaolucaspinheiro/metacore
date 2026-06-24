import { config } from "dotenv";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import metaSnapshot from "../data/meta/latest.json";

config({ path: ".env.local" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const rows = await prisma.tournamentTeam.findMany({ select: { species: true }, take: 100000 });
  const names = new Set<string>(Object.keys((metaSnapshot as { pokemon: Record<string, unknown> }).pokemon));
  rows.forEach((r) => r.species.forEach((n) => names.add(n)));

  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  const outPath = resolve(__dirname, "../data/meta/species.json");
  writeFileSync(outPath, JSON.stringify(sorted));
  console.log(`OK: ${sorted.length} espécies distintas salvas em ${outPath}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { config } from "dotenv";
import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const API_BASE = "https://play.limitlesstcg.com/api";
const LAUNCH_DATE = new Date("2026-04-08T00:00:00.000Z");
const PAGE_SIZE = 100;
const DELAY_MS = 300;

interface TournamentListItem {
  id: string;
  game: string;
  name: string;
  date: string;
  format: string;
  players: number;
}

interface StandingDecklistEntry {
  id: string;
  name: string;
  item: string | null;
  ability: string | null;
  attacks: string[];
  nature: string | null;
  tera: string | null;
}

interface StandingEntry {
  player: string;
  name: string;
  country?: string;
  placing: number | null;
  decklist?: StandingDecklistEntry[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, attempt = 1): Promise<T> {
  const res = await fetch(url);
  if (res.status === 429 && attempt <= 5) {
    const wait = 1000 * attempt;
    console.log(`  Rate limited, esperando ${wait}ms...`);
    await sleep(wait);
    return fetchJson<T>(url, attempt + 1);
  }
  if (!res.ok) {
    throw new Error(`Falha ao buscar ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function importTournament(t: TournamentListItem): Promise<number> {
  const standings = await fetchJson<StandingEntry[]>(`${API_BASE}/tournaments/${t.id}/standings`);
  let imported = 0;

  for (const entry of standings) {
    if (!entry.decklist || entry.decklist.length === 0) continue;
    const playerHandle = entry.player || entry.name;
    if (!playerHandle) continue;

    await prisma.tournamentTeam.upsert({
      where: { sourceId_playerHandle: { sourceId: t.id, playerHandle } },
      create: {
        sourceId: t.id,
        tournamentName: t.name,
        tournamentDate: new Date(t.date),
        format: t.format,
        playerName: entry.name || playerHandle,
        playerHandle,
        country: entry.country ?? null,
        placing: entry.placing,
        species: entry.decklist.map((p) => p.name),
        roster: entry.decklist as unknown as Prisma.InputJsonValue,
      },
      update: {
        placing: entry.placing,
        species: entry.decklist.map((p) => p.name),
        roster: entry.decklist as unknown as Prisma.InputJsonValue,
      },
    });
    imported++;
  }

  return imported;
}

async function main() {
  const forceFullSync = process.env.FULL_SYNC === "1";
  let cutoff = LAUNCH_DATE;

  if (!forceFullSync) {
    const latest = await prisma.tournamentTeam.findFirst({
      orderBy: { tournamentDate: "desc" },
      select: { tournamentDate: true },
    });
    if (latest) {
      // re-process the most recent day too, in case more standings were added since
      cutoff = new Date(latest.tournamentDate.getTime() - 24 * 60 * 60 * 1000);
      console.log(`Sincronização incremental: buscando torneios a partir de ${cutoff.toISOString()}`);
    }
  } else {
    console.log("Sincronização completa solicitada (FULL_SYNC=1).");
  }

  let page = 1;
  let totalTournaments = 0;
  let totalTeams = 0;
  let keepGoing = true;

  while (keepGoing) {
    console.log(`Buscando página ${page} de torneios...`);
    const tournaments = await fetchJson<TournamentListItem[]>(
      `${API_BASE}/tournaments?game=VGC&limit=${PAGE_SIZE}&page=${page}`
    );

    if (tournaments.length === 0) {
      console.log("Página vazia, parando.");
      break;
    }

    const qualifying = tournaments.filter((t) => new Date(t.date) >= cutoff);
    const oldestInPage = new Date(tournaments[tournaments.length - 1].date);

    for (const t of qualifying) {
      try {
        const imported = await importTournament(t);
        totalTournaments++;
        totalTeams += imported;
        console.log(`  [${t.date.slice(0, 10)}] ${t.name} — ${imported} times importados`);
      } catch (err) {
        console.error(`  Falha no torneio ${t.id} (${t.name}):`, err);
      }
      await sleep(DELAY_MS);
    }

    if (oldestInPage < cutoff) {
      console.log("Chegamos em torneios antes do corte, parando.");
      keepGoing = false;
    }

    page++;
    await sleep(DELAY_MS);
  }

  console.log(`\nOK: ${totalTournaments} torneios processados, ${totalTeams} times importados/atualizados.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

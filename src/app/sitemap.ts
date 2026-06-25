import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://metacore-lovat.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/builder`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/team-finder`, changeFrequency: "daily", priority: 0.9 },
  ];

  const publicTeams = await prisma.team.findMany({
    where: { isPublic: true },
    select: { slug: true, updatedAt: true },
    take: 1000,
  });

  const teamRoutes: MetadataRoute.Sitemap = publicTeams.map((t) => ({
    url: `${SITE_URL}/teams/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...teamRoutes];
}

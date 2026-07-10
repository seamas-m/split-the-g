export const dynamic = "force-dynamic";

import AppHeader from "@/components/app-header";
import Navbar from "@/components/navbar";
import LeaderboardTabs from "@/components/leaderboard-tabs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Look up the top-20 postIds by nailed-vote count, then hydrate them.
// Old behaviour fetched 500 posts + all their ratings and sorted in JS —
// this scales linearly with data volume and would fall over quickly.
async function topByNailed(sinceIso: string | null): Promise<
  { postId: string; nailedCount: number }[]
> {
  const topPostIds = await prisma.rating.groupBy({
    by: ["postId"],
    where: {
      nailed: true,
      ...(sinceIso ? { post: { createdAt: { gte: new Date(sinceIso) } } } : {}),
    },
    _count: { _all: true },
    orderBy: { _count: { postId: "desc" } },
    take: 20,
  });

  return topPostIds.map((t) => ({ postId: t.postId, nailedCount: t._count._all }));
}

async function hydrateLeaderboardEntries(
  top: { postId: string; nailedCount: number }[],
  currentUserId: string | null,
) {
  if (top.length === 0) return [];

  const posts = await prisma.post.findMany({
    where: { id: { in: top.map((t) => t.postId) } },
    include: {
      user: { select: { username: true } },
      // Filtered _count returns only the notQuite (nailed=false) count for
      // these 20 posts. No need to load individual rating rows.
      _count: { select: { ratings: { where: { nailed: false } } } },
    },
  });

  const postMap = new Map(posts.map((p) => [p.id, p]));

  return top
    .map((t) => {
      const p = postMap.get(t.postId);
      if (!p) return null;
      return {
        id: p.id,
        imageUrl: p.imageUrl,
        pubName: p.pubName,
        city: p.city,
        username: p.user.username,
        nailedCount: t.nailedCount,
        notQuiteCount: p._count.ratings,
        isOwn: p.userId === currentUserId,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

async function getWeeklyLeaderboard(currentUserId: string | null) {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const top = await topByNailed(since.toISOString());
  return hydrateLeaderboardEntries(top, currentUserId);
}

async function getAllTimeLeaderboard(currentUserId: string | null) {
  const top = await topByNailed(null);
  return hydrateLeaderboardEntries(top, currentUserId);
}

// One SQL query — GROUP BY + FILTER — replaces "fetch every post with a
// city and aggregate in JS". Uses the new Post_city_idx.
async function getCityLeaderboard() {
  const rows = await prisma.$queryRaw<
    { city: string; splits: bigint; nailed: bigint }[]
  >`
    SELECT
      p."city" AS city,
      COUNT(DISTINCT p.id) AS splits,
      COUNT(r.id) FILTER (WHERE r.nailed = TRUE) AS nailed
    FROM "Post" p
    LEFT JOIN "Rating" r ON r."postId" = p.id
    WHERE p."city" IS NOT NULL
    GROUP BY p."city"
    ORDER BY nailed DESC, splits DESC
    LIMIT 20
  `;

  return rows.map((r) => ({
    city: r.city,
    splits: Number(r.splits),
    nailed: Number(r.nailed),
  }));
}

export default async function LeaderboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id ?? null;

  const [weekly, allTime, cities] = await Promise.all([
    getWeeklyLeaderboard(currentUserId),
    getAllTimeLeaderboard(currentUserId),
    getCityLeaderboard(),
  ]);

  return (
    <>
      <AppHeader />
      <main className="flex-1 pb-24 w-full max-w-2xl mx-auto">
        <div className="px-4 pt-6 pb-2">
          <h1 className="font-display text-2xl font-bold text-cream">Leaderboard</h1>
          <p className="text-foam text-sm mt-1">The most celebrated splits in the community.</p>
        </div>
        <LeaderboardTabs weekly={weekly} allTime={allTime} cities={cities} />
      </main>
      <Navbar />
    </>
  );
}

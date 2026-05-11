export const dynamic = "force-dynamic";

import AppHeader from "@/components/app-header";
import Navbar from "@/components/navbar";
import LeaderboardTabs from "@/components/leaderboard-tabs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getWeeklyLeaderboard(currentUserId: string | null) {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const posts = await prisma.post.findMany({
    where: {
      createdAt: { gte: since },
      ratings: { some: { score: 1 } },
    },
    include: {
      user: { select: { username: true } },
      ratings: { select: { score: true, userId: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return posts
    .map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      pubName: p.pubName,
      city: p.city,
      username: p.user.username,
      nailedCount: p.ratings.filter((r) => r.score === 1).length,
      notQuiteCount: p.ratings.filter((r) => r.score === 0).length,
      isOwn: p.userId === currentUserId,
    }))
    .sort((a, b) => b.nailedCount - a.nailedCount)
    .slice(0, 20);
}

async function getAllTimeLeaderboard(currentUserId: string | null) {
  const posts = await prisma.post.findMany({
    where: { ratings: { some: { score: 1 } } },
    include: {
      user: { select: { username: true } },
      ratings: { select: { score: true, userId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return posts
    .map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      pubName: p.pubName,
      city: p.city,
      username: p.user.username,
      nailedCount: p.ratings.filter((r) => r.score === 1).length,
      notQuiteCount: p.ratings.filter((r) => r.score === 0).length,
      isOwn: p.userId === currentUserId,
    }))
    .sort((a, b) => b.nailedCount - a.nailedCount)
    .slice(0, 20);
}

async function getCityLeaderboard() {
  const posts = await prisma.post.findMany({
    where: { city: { not: null } },
    include: { ratings: { select: { score: true } } },
  });

  const cityMap: Record<string, { splits: number; nailed: number }> = {};
  for (const p of posts) {
    const city = p.city!;
    if (!cityMap[city]) cityMap[city] = { splits: 0, nailed: 0 };
    cityMap[city].splits++;
    cityMap[city].nailed += p.ratings.filter((r) => r.score === 1).length;
  }

  return Object.entries(cityMap)
    .map(([city, stats]) => ({ city, ...stats }))
    .sort((a, b) => b.nailed - a.nailed)
    .slice(0, 20);
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

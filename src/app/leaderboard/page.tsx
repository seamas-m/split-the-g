export const dynamic = "force-dynamic";

import Navbar from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import { Trophy } from "lucide-react";

async function getTopPubs() {
  const posts = await prisma.post.findMany({
    where: {
      pubName: { not: null },
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    include: { ratings: { select: { score: true } } },
  });

  const pubMap = new Map<string, { total: number; count: number; posts: number }>();

  for (const post of posts) {
    if (!post.pubName) continue;
    const key = post.pubName;
    const existing = pubMap.get(key) ?? { total: 0, count: 0, posts: 0 };
    const scores = post.ratings.map((r: { score: number }) => r.score);
    pubMap.set(key, {
      total: existing.total + scores.reduce((s: number, v: number) => s + v, 0),
      count: existing.count + scores.length,
      posts: existing.posts + 1,
    });
  }

  return Array.from(pubMap.entries())
    .map(([name, { total, count, posts }]) => ({
      name,
      avg: count > 0 ? total / count : 0,
      ratings: count,
      posts,
    }))
    .filter((p) => p.ratings >= 1)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 20);
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const pubs = await getTopPubs();

  return (
    <>
      <header className="sticky top-0 bg-black border-b border-zinc-800 px-6 py-4 z-40">
        <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
          <Trophy size={20} /> Top Pubs This Week
        </h1>
      </header>

      <main className="flex-1 p-4 pb-24 max-w-lg mx-auto w-full">
        {pubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-2">
            <span className="text-5xl">🏆</span>
            <p>No rated pints this week yet.</p>
          </div>
        ) : (
          <ol className="flex flex-col gap-3">
            {pubs.map((pub, i) => (
              <li
                key={pub.name}
                className="flex items-center gap-4 bg-zinc-900 rounded-2xl px-5 py-4 border border-zinc-800"
              >
                <span className="text-2xl w-8 text-center">
                  {MEDAL[i] ?? `${i + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{pub.name}</p>
                  <p className="text-xs text-zinc-500">
                    {pub.posts} post{pub.posts !== 1 ? "s" : ""} · {pub.ratings} rating{pub.ratings !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-black text-lg">{pub.avg.toFixed(1)}</p>
                  <p className="text-xs text-zinc-500">/ 5</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </main>

      <Navbar />
    </>
  );
}

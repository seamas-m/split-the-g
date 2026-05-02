export const dynamic = "force-dynamic";

import PostCard from "@/components/post-card";
import Navbar from "@/components/navbar";
import { prisma } from "@/lib/prisma";

async function getPosts() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { username: true, image: true } },
      ratings: { select: { score: true } },
    },
  });

  return posts.map((p) => ({
    id: p.id,
    imageUrl: p.imageUrl,
    pubName: p.pubName,
    city: p.city,
    settleSeconds: p.settleSeconds,
    createdAt: p.createdAt.toISOString(),
    user: p.user,
    avgScore: p.ratings.length
      ? p.ratings.reduce((s: number, r: { score: number }) => s + r.score, 0) / p.ratings.length
      : 0,
    totalRatings: p.ratings.length,
  }));
}

export default async function FeedPage() {
  const posts = await getPosts();

  return (
    <>
      <header className="sticky top-0 bg-black border-b border-zinc-800 px-6 py-4 z-40">
        <h1 className="text-xl font-black text-amber-400">Split the G</h1>
      </header>

      <main className="flex-1 p-4 pb-24 max-w-lg mx-auto w-full">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-2">
            <span className="text-5xl">🍺</span>
            <p>No pints yet. Be the first.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post: Parameters<typeof PostCard>[0]["post"]) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      <Navbar />
    </>
  );
}

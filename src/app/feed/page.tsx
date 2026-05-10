export const dynamic = "force-dynamic";

import PostCard from "@/components/post-card";
import AppHeader from "@/components/app-header";
import Navbar from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getPosts() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { username: true, image: true } },
      ratings: { select: { score: true } },
      comments: { select: { id: true } },
    },
  });

  return posts.map((p) => ({
    id: p.id,
    imageUrl: p.imageUrl,
    pubName: p.pubName,
    city: p.city,
    createdAt: p.createdAt.toISOString(),
    userId: p.userId,
    user: p.user,
    avgScore: p.ratings.length
      ? p.ratings.reduce((s: number, r: { score: number }) => s + r.score, 0) / p.ratings.length
      : 0,
    totalRatings: p.ratings.length,
    totalComments: p.comments.length,
  }));
}

export default async function FeedPage() {
  const [posts, session] = await Promise.all([
    getPosts(),
    auth.api.getSession({ headers: await headers() }),
  ]);

  const currentUserId = session?.user?.id ?? null;

  return (
    <>
      <AppHeader />

      <main className="flex-1 p-4 pb-24 w-full max-w-5xl mx-auto">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-foam gap-3">
            <p className="italic text-lg">No pints yet. Be the first.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="break-inside-avoid">
                <PostCard
                  post={post}
                  isOwner={currentUserId === post.userId}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <Navbar />
    </>
  );
}

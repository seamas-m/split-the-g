export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import PostCard from "@/components/post-card";
import SearchInput from "@/components/search-input";
import Navbar from "@/components/navbar";
import AppHeader from "@/components/app-header";

async function searchPosts(q: string, currentUserId: string | null) {
  if (!q.trim()) return [];

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { pubName: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    },
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
      ? p.ratings.reduce((s, r) => s + r.score, 0) / p.ratings.length
      : 0,
    totalRatings: p.ratings.length,
    totalComments: p.comments.length,
    isOwner: currentUserId === p.userId,
  }));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id ?? null;
  const posts = await searchPosts(q, currentUserId);

  return (
    <>
      <AppHeader />

      <main className="flex-1 pb-24 w-full max-w-5xl mx-auto">
        <div className="px-4 pt-4 pb-2">
          <Suspense>
            <SearchInput />
          </Suspense>
        </div>

        {q.trim() === "" ? (
          <div className="flex flex-col items-center justify-center h-48 text-foam gap-2">
            <p className="italic text-sm">Search for a pub or city</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-foam gap-2">
            <p className="italic text-sm">No pints found for &ldquo;{q}&rdquo;</p>
          </div>
        ) : (
          <div className="p-4 columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="break-inside-avoid">
                <PostCard post={post} isOwner={post.isOwner} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Navbar />
    </>
  );
}

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import PostCard from "@/components/post-card";
import SearchInput from "@/components/search-input";
import Navbar from "@/components/navbar";
import AppHeader from "@/components/app-header";
import Link from "next/link";

async function getTrendingPubs() {
  const posts = await prisma.post.groupBy({
    by: ["pubName"],
    where: { pubName: { not: null } },
    _count: { pubName: true },
    orderBy: { _count: { pubName: "desc" } },
    take: 10,
  });
  return posts.map((p) => p.pubName as string);
}

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
      ratings: { select: { score: true, userId: true } },
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
    totalCheers: p.ratings.length,
    hasCheersed: currentUserId ? p.ratings.some((r) => r.userId === currentUserId) : false,
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

  const [posts, trendingPubs] = await Promise.all([
    searchPosts(q, currentUserId),
    q.trim() === "" ? getTrendingPubs() : Promise.resolve([]),
  ]);

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
          <div className="px-4 pt-4 flex flex-col gap-4">
            {trendingPubs.length > 0 && (
              <>
                <p className="text-xs text-foam/60 uppercase tracking-widest">Trending pubs</p>
                <div className="flex flex-wrap gap-2">
                  {trendingPubs.map((pub) => (
                    <Link
                      key={pub}
                      href={`/search?q=${encodeURIComponent(pub)}`}
                      className="px-4 py-2 rounded-full bg-malt text-cream text-sm hover:bg-harp hover:text-stout transition-colors font-medium"
                    >
                      {pub}
                    </Link>
                  ))}
                </div>
              </>
            )}
            {trendingPubs.length === 0 && (
              <p className="text-foam italic text-sm text-center py-8">Search for a pub or city</p>
            )}
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

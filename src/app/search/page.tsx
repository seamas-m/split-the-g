export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import PostCard from "@/components/post-card";
import SearchInput from "@/components/search-input";
import SearchFilters from "@/components/search-filters";
import Navbar from "@/components/navbar";
import AppHeader from "@/components/app-header";
import Link from "next/link";
import { mapPost } from "@/lib/map-post";

async function getTopCities(): Promise<string[]> {
  const rows = await prisma.post.groupBy({
    by: ["city"],
    where: { city: { not: null } },
    _count: { city: true },
    orderBy: { _count: { city: "desc" } },
    take: 8,
  });
  return rows.map((r) => r.city as string);
}

async function getTrendingPubs(): Promise<string[]> {
  const posts = await prisma.post.groupBy({
    by: ["pubName"],
    where: { pubName: { not: null } },
    _count: { pubName: true },
    orderBy: { _count: { pubName: "desc" } },
    take: 10,
  });
  return posts.map((p) => p.pubName as string);
}

async function searchPosts(q: string, city: string, currentUserId: string | null) {
  const hasQuery = q.trim().length > 0;
  const hasCity = city.trim().length > 0;

  if (!hasQuery && !hasCity) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  if (hasCity) {
    where.city = { contains: city.trim(), mode: "insensitive" };
  }

  if (hasQuery) {
    where.OR = [
      { pubName: { contains: q.trim(), mode: "insensitive" } },
      { city: { contains: q.trim(), mode: "insensitive" } },
      { user: { username: { contains: q.trim(), mode: "insensitive" } } },
    ];
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { username: true, image: true } },
      ratings: { select: { nailed: true, userId: true } },
      comments: { select: { id: true } },
    },
  });

  return posts.map((p) => mapPost(p, currentUserId));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string }>;
}) {
  const { q = "", city = "" } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id ?? null;

  const hasFilter = q.trim() !== "" || city.trim() !== "";

  const [posts, topCities, trendingPubs] = await Promise.all([
    hasFilter ? searchPosts(q, city, currentUserId) : Promise.resolve([]),
    getTopCities(),
    !hasFilter ? getTrendingPubs() : Promise.resolve([]),
  ]);

  return (
    <>
      <AppHeader />

      <main className="flex-1 pb-24 w-full max-w-5xl mx-auto">
        <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
          <Suspense>
            <SearchInput />
          </Suspense>
          <Suspense>
            <SearchFilters topCities={topCities} activeCity={city} />
          </Suspense>
        </div>

        {!hasFilter ? (
          <div className="px-4 pt-2 flex flex-col gap-4">
            {trendingPubs.length > 0 && (
              <>
                <p className="text-xs text-foam/60 uppercase tracking-widest">Trending pubs</p>
                <div className="flex flex-wrap gap-2">
                  {trendingPubs.map((pub) => (
                    <Link
                      key={pub}
                      href={`/pub/${encodeURIComponent(pub)}`}
                      className="px-4 py-2 rounded-full bg-malt text-cream text-sm hover:bg-harp hover:text-cream transition-colors font-medium"
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
            <p className="italic text-sm">
              No pints found
              {q && <> for &ldquo;{q}&rdquo;</>}
              {city && <> in {city}</>}
            </p>
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

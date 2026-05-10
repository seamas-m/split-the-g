import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import PostCard from "@/components/post-card";
import { MapPin, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

async function getUserProfile(username: string) {
  const user = await prisma.user.findFirst({
    where: { username },
  });
  if (!user) return null;

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true, image: true } },
      ratings: { select: { score: true } },
      comments: { select: { id: true } },
    },
  });

  const mappedPosts = posts.map((p) => ({
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
  }));

  const allRatings = posts.flatMap((p) => p.ratings.map((r) => r.score));
  const avgRating = allRatings.length
    ? allRatings.reduce((s, r) => s + r, 0) / allRatings.length
    : null;

  // Top cities
  const cityCounts: Record<string, number> = {};
  for (const p of posts) {
    if (p.city) cityCounts[p.city] = (cityCounts[p.city] ?? 0) + 1;
  }
  const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { user, posts: mappedPosts, avgRating, topCity };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [profile, session] = await Promise.all([
    getUserProfile(username),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!profile) notFound();

  const { user, posts, avgRating, topCity } = profile;
  const isOwnProfile = session?.user?.id === user.id;

  return (
    <main className="flex-1 pb-24 w-full max-w-5xl mx-auto">
      {/* Profile hero */}
      <div className="flex flex-col items-center gap-4 px-6 py-8 border-b border-malt">
        <div className="w-20 h-20 rounded-full bg-malt flex items-center justify-center text-3xl font-bold text-harp font-display">
          {(user.username ?? user.name ?? "?")[0].toUpperCase()}
        </div>

        <div className="text-center flex flex-col items-center gap-2">
          <h1 className="text-xl font-bold text-cream">@{user.username ?? user.name}</h1>
          {isOwnProfile && (
            <Link
              href="/profile"
              className="flex items-center gap-1.5 text-xs text-foam hover:text-cream transition-colors border border-malt rounded-lg px-3 py-1.5"
            >
              <Settings size={12} /> Account settings
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-cream">{posts.length}</span>
            <span className="text-xs text-foam">pints</span>
          </div>
          {avgRating !== null && (
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-cream">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-foam">avg rating</span>
            </div>
          )}
          {topCity && (
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-cream flex items-center gap-1">
                <MapPin size={13} className="text-harp" />{topCity}
              </span>
              <span className="text-xs text-foam">top city</span>
            </div>
          )}
        </div>
      </div>

      {/* Posts grid */}
      <div className="p-4">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-foam gap-2">
            <p className="italic">No pints posted yet.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="break-inside-avoid">
                <PostCard
                  post={post}
                  isOwner={isOwnProfile}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

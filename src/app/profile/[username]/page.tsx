import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import PostCard from "@/components/post-card";
import FollowButton from "@/components/follow-button";
import { mapPost } from "@/lib/map-post";
import { MapPin, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

async function getUserProfile(username: string, currentUserId: string | null) {
  const user = await prisma.user.findFirst({ where: { username } });
  if (!user) return null;

  const [posts, followerCount, isFollowing] = await Promise.all([
    prisma.post.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true, image: true } },
        ratings: { select: { score: true, userId: true } },
        comments: { select: { id: true } },
      },
    }),
    prisma.follow.count({ where: { followingId: user.id } }),
    currentUserId
      ? prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: currentUserId, followingId: user.id } },
        }).then(Boolean)
      : Promise.resolve(false),
  ]);

  const mappedPosts = posts.map((p) => mapPost(p, currentUserId));
  const totalNailed = posts.reduce((s, p) => s + p.ratings.filter((r) => r.score === 1).length, 0);

  const cityCounts: Record<string, number> = {};
  for (const p of posts) {
    if (p.city) cityCounts[p.city] = (cityCounts[p.city] ?? 0) + 1;
  }
  const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { user, posts: mappedPosts, totalNailed, topCity, followerCount, isFollowing };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id ?? null;
  const profile = await getUserProfile(username, currentUserId);

  if (!profile) notFound();

  const { user, posts, totalNailed, topCity, followerCount, isFollowing } = profile;
  const isOwnProfile = currentUserId === user.id;

  return (
    <main className="flex-1 pb-24 w-full max-w-5xl mx-auto">
      <div className="flex flex-col items-center gap-4 px-6 py-8 border-b border-malt">
        <div className="w-20 h-20 rounded-full bg-malt flex items-center justify-center text-3xl font-bold text-harp font-display">
          {(user.username ?? user.name ?? "?")[0].toUpperCase()}
        </div>

        <div className="text-center flex flex-col items-center gap-2">
          <h1 className="text-xl font-bold text-cream">@{user.username ?? user.name}</h1>
          {isOwnProfile && (
            <Link href="/profile" className="flex items-center gap-1.5 text-xs text-foam hover:text-cream transition-colors border border-malt rounded-lg px-3 py-1.5">
              <Settings size={12} /> Account settings
            </Link>
          )}
          {!isOwnProfile && currentUserId && (
            <FollowButton
              followingId={user.id}
              initialFollowing={isFollowing}
              followerCount={followerCount}
            />
          )}
          {!isOwnProfile && !currentUserId && followerCount > 0 && (
            <span className="text-xs text-foam/50">{followerCount} follower{followerCount !== 1 ? "s" : ""}</span>
          )}
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-cream">{posts.length}</span>
            <span className="text-xs text-foam">pints</span>
          </div>
          {totalNailed > 0 && (
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-cream">{totalNailed}</span>
              <span className="text-xs text-foam">nailed it</span>
            </div>
          )}
          {isOwnProfile && (
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-cream">{followerCount}</span>
              <span className="text-xs text-foam">followers</span>
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

      <div className="p-4">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-foam gap-4">
            <p className="italic">No pints posted yet.</p>
            {isOwnProfile && (
              <Link href="/upload" className="bg-harp text-stout font-bold px-6 py-3 rounded-xl text-sm tracking-wide hover:opacity-90 transition-opacity">
                Post your first pint
              </Link>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="break-inside-avoid">
                <PostCard post={post} isOwner={isOwnProfile} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

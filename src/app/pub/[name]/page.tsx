export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AppHeader from "@/components/app-header";
import Navbar from "@/components/navbar";
import PostCard from "@/components/post-card";
import SplitVote from "@/components/split-vote";
import CommentsSheet from "@/components/comments-sheet";
import TimeAgo from "@/components/time-ago";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { mapPost } from "@/lib/map-post";
import { MapPin, Pin } from "lucide-react";

async function getPubData(pubName: string, currentUserId: string | null) {
  const posts = await prisma.post.findMany({
    where: { pubName: { equals: pubName, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true, image: true } },
      ratings: { select: { score: true, userId: true } },
      comments: { select: { id: true } },
    },
  });

  if (posts.length === 0) return null;

  const mapped = posts.map((p) => mapPost(p, currentUserId));

  // Stats
  const totalNailed = mapped.reduce((s, p) => s + p.nailedCount, 0);
  const city = posts[0].city ?? null;

  // Bar Wall — post with most nailed-it votes
  const barWall = [...mapped].sort((a, b) => b.nailedCount - a.nailedCount)[0];
  const rest = mapped.filter((p) => p.id !== barWall.id);

  // Top splitter at this pub
  const userNailed: Record<string, { username: string | null; count: number }> = {};
  for (const p of mapped) {
    const u = p.user.username ?? "anon";
    if (!userNailed[p.userId]) userNailed[p.userId] = { username: u, count: 0 };
    userNailed[p.userId].count += p.nailedCount;
  }
  const topSplitter = Object.values(userNailed).sort((a, b) => b.count - a.count)[0] ?? null;

  return { pubName: posts[0].pubName!, city, mapped, barWall, rest, totalNailed, topSplitter };
}

export default async function PubPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const pubName = decodeURIComponent(name);

  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id ?? null;

  const data = await getPubData(pubName, currentUserId);
  if (!data) notFound();

  const { city, mapped, barWall, rest, totalNailed, topSplitter } = data;

  return (
    <>
      <AppHeader />
      <main className="flex-1 pb-24 w-full max-w-5xl mx-auto">

        {/* Pub header */}
        <div className="px-6 pt-8 pb-6 border-b border-malt flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-3xl font-bold text-cream leading-tight">{data.pubName}</h1>
            {city && (
              <Link
                href={`/search?city=${encodeURIComponent(city)}`}
                className="flex items-center gap-1 text-sm text-foam hover:text-harp transition-colors w-fit"
              >
                <MapPin size={13} /> {city}
              </Link>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-cream">{mapped.length}</span>
              <span className="text-xs text-foam">split{mapped.length !== 1 ? "s" : ""}</span>
            </div>
            {totalNailed > 0 && (
              <div className="flex flex-col">
                <span className="text-xl font-bold text-cream">{totalNailed}</span>
                <span className="text-xs text-foam">nailed it</span>
              </div>
            )}
            {topSplitter && topSplitter.count > 0 && (
              <div className="flex flex-col">
                <Link
                  href={`/profile/${topSplitter.username}`}
                  className="text-sm font-bold text-harp hover:underline leading-tight"
                >
                  @{topSplitter.username}
                </Link>
                <span className="text-xs text-foam">top splitter</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col gap-6">
          {/* Bar Wall */}
          {barWall.nailedCount > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs text-harp font-semibold">
                <Pin size={12} />
                Bar Wall — best split here
              </div>
              <div className="bg-porter border border-harp/30 rounded-2xl overflow-hidden">
                <div className="relative aspect-[3/4] sm:aspect-[4/3] w-full">
                  <Image
                    src={barWall.imageUrl}
                    alt={`Best split at ${data.pubName}`}
                    fill
                    className="object-cover"
                  />
                  {/* Score badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-stout/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <span className="text-harp text-xs font-bold">✓ {barWall.nailedCount} nailed it</span>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Link href={`/profile/${barWall.user.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <div className="w-7 h-7 rounded-full bg-malt flex items-center justify-center text-xs font-bold text-harp">
                        {(barWall.user.username ?? "?")[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-cream">@{barWall.user.username ?? "anon"}</span>
                        <TimeAgo date={barWall.createdAt} />
                      </div>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-malt/50">
                    {barWall.isOwner ? (
                      <div className="flex items-center gap-2 text-xs text-foam/60">
                        <span className="text-harp/70">✓</span> {barWall.nailedCount} nailed it
                        {barWall.notQuiteCount > 0 && <> · {barWall.notQuiteCount} not quite</>}
                      </div>
                    ) : (
                      <SplitVote
                        postId={barWall.id}
                        nailedCount={barWall.nailedCount}
                        notQuiteCount={barWall.notQuiteCount}
                        userVote={barWall.userVote}
                      />
                    )}
                    <CommentsSheet
                      postId={barWall.id}
                      initialCount={barWall.totalComments}
                      imageUrl={barWall.imageUrl}
                      pubName={data.pubName}
                      city={city}
                      username={barWall.user.username}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All splits */}
          {rest.length > 0 && (
            <div className="flex flex-col gap-3">
              {barWall.nailedCount > 0 && (
                <p className="text-xs text-foam/50 font-medium uppercase tracking-wide">All splits</p>
              )}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {rest.map((post) => (
                  <div key={post.id} className="break-inside-avoid">
                    <PostCard post={post} isOwner={post.isOwner} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If bar wall has no votes, just show grid normally */}
          {barWall.nailedCount === 0 && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {mapped.map((post) => (
                <div key={post.id} className="break-inside-avoid">
                  <PostCard post={post} isOwner={post.isOwner} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Navbar />
    </>
  );
}

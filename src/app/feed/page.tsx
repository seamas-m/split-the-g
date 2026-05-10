export const dynamic = "force-dynamic";

import Link from "next/link";
import AppHeader from "@/components/app-header";
import Navbar from "@/components/navbar";
import InfiniteFeed from "@/components/infinite-feed";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { mapPost } from "@/lib/map-post";

const LIMIT = 12;

async function getInitialPosts(currentUserId: string | null) {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: LIMIT + 1,
    include: {
      user: { select: { username: true, image: true } },
      ratings: { select: { score: true, userId: true } },
      comments: { select: { id: true } },
    },
  });

  const hasMore = posts.length > LIMIT;
  const page = posts.slice(0, LIMIT);
  const nextCursor = hasMore ? page[page.length - 1].id : null;
  return { posts: page.map((p) => mapPost(p, currentUserId)), nextCursor };
}

export default async function FeedPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id ?? null;
  const { posts, nextCursor } = await getInitialPosts(currentUserId);

  return (
    <>
      <AppHeader />
      <main className="flex-1 p-4 pb-24 w-full max-w-5xl mx-auto">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-foam gap-4">
            <p className="italic text-lg">No pints yet.</p>
            <Link href="/upload" className="bg-harp text-stout font-bold px-6 py-3 rounded-xl text-sm tracking-wide hover:opacity-90 transition-opacity">
              Post the first pint
            </Link>
          </div>
        ) : (
          <InfiniteFeed initialPosts={posts} initialCursor={nextCursor} />
        )}
      </main>
      <Navbar />
    </>
  );
}

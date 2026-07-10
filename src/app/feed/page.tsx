export const dynamic = "force-dynamic";

import AppHeader from "@/components/app-header";
import Navbar from "@/components/navbar";
import FeedTabs from "@/components/feed-tabs";
import OnboardingModal from "@/components/onboarding-modal";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { mapPost } from "@/lib/map-post";

const LIMIT = 12;

async function getForYouPosts(currentUserId: string | null) {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: LIMIT + 1,
    include: {
      user: { select: { username: true, image: true } },
      ratings: { select: { nailed: true, userId: true } },
      comments: { select: { id: true } },
    },
  });

  const hasMore = posts.length > LIMIT;
  const page = posts.slice(0, LIMIT);
  const nextCursor = hasMore ? page[page.length - 1].id : null;
  return { posts: page.map((p) => mapPost(p, currentUserId)), nextCursor };
}

async function getFollowingPosts(currentUserId: string) {
  const followedUsers = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  });
  const followingIds = followedUsers.map((f) => f.followingId);

  const posts = await prisma.post.findMany({
    where: { userId: { in: followingIds } },
    orderBy: { createdAt: "desc" },
    take: LIMIT + 1,
    include: {
      user: { select: { username: true, image: true } },
      ratings: { select: { nailed: true, userId: true } },
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

  const [forYou, following] = await Promise.all([
    getForYouPosts(currentUserId),
    currentUserId
      ? getFollowingPosts(currentUserId)
      : Promise.resolve({ posts: [], nextCursor: null }),
  ]);

  return (
    <>
      <AppHeader />
      <main className="flex-1 p-4 pb-24 w-full max-w-5xl mx-auto">
        <FeedTabs
          forYouPosts={forYou.posts}
          forYouCursor={forYou.nextCursor}
          followingPosts={following.posts}
          followingCursor={following.nextCursor}
          isLoggedIn={!!currentUserId}
        />
      </main>
      <Navbar />
      <OnboardingModal />
    </>
  );
}

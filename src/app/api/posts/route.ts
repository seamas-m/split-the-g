import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { scoreSplit } from "@/lib/score-split";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") ?? 12), 50);
  const tab = searchParams.get("tab"); // "following" | null

  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id ?? null;

  // Build where clause for following feed
  let whereClause = {};
  if (tab === "following" && currentUserId) {
    const followedUsers = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    const followingIds = followedUsers.map((f) => f.followingId);
    whereClause = { userId: { in: followingIds } };
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: { username: true, image: true } },
      ratings: { select: { score: true, userId: true } },
      comments: { select: { id: true } },
    },
  });

  const hasMore = posts.length > limit;
  const page = posts.slice(0, limit);
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  const mapped = page.map((p) => {
    const myRating = currentUserId ? p.ratings.find((r) => r.userId === currentUserId) : null;
    return {
      id: p.id,
      imageUrl: p.imageUrl,
      pubName: p.pubName,
      city: p.city,
      aiScore: p.aiScore,
      createdAt: p.createdAt.toISOString(),
      userId: p.userId,
      user: p.user,
      nailedCount: p.ratings.filter((r) => r.score === 1).length,
      notQuiteCount: p.ratings.filter((r) => r.score === 0).length,
      userVote: myRating == null ? null : myRating.score === 1 ? "nailed" : "notquite",
      totalComments: p.comments.length,
      isOwner: currentUserId === p.userId,
    };
  });

  return NextResponse.json({ posts: mapped, nextCursor });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageUrl, pubName, city } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });

  // Create post first
  const post = await prisma.post.create({
    data: { userId: session.user.id, imageUrl, pubName, city },
  });

  // Score the split with AI — non-blocking, updates post in background
  scoreSplit(imageUrl).then(async (aiScore) => {
    if (aiScore !== null) {
      await prisma.post.update({ where: { id: post.id }, data: { aiScore } });
    }
  }).catch(() => {/* silently fail — score can be null */});

  return NextResponse.json(post, { status: 201 });
}

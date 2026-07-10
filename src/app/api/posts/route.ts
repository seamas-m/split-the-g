import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { scoreSplit } from "@/lib/score-split";
import { withAuth, parseBody } from "@/lib/api-auth";

const CreatePostBody = z.object({
  imageUrl: z.string().url().max(2048),
  pubName: z.string().trim().max(120).nullable().optional(),
  city:    z.string().trim().max(120).nullable().optional(),
});

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
      ratings: { select: { nailed: true, userId: true } },
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
      nailedCount: p.ratings.filter((r) => r.nailed).length,
      notQuiteCount: p.ratings.filter((r) => !r.nailed).length,
      userVote: myRating == null ? null : myRating.nailed ? "nailed" : "notquite",
      totalComments: p.comments.length,
      isOwner: currentUserId === p.userId,
    };
  });

  return NextResponse.json({ posts: mapped, nextCursor });
}

export const POST = withAuth(async (req, { session }) => {
  const { imageUrl, pubName, city } = await parseBody(req, CreatePostBody);

  // Create the post immediately with no score — user gets a fast response
  const post = await prisma.post.create({
    data: {
      userId: session.user.id,
      imageUrl,
      pubName: pubName || null,
      city: city || null,
      aiScore: null,
    },
  });

  // Score the split after the response is sent. Vercel keeps the function
  // alive for `after()` callbacks so this actually completes (unlike naked
  // fire-and-forget promises which get killed with the function).
  after(async () => {
    try {
      const aiScore = await scoreSplit(imageUrl);
      if (aiScore !== null) {
        await prisma.post.update({ where: { id: post.id }, data: { aiScore } });
      }
    } catch (err) {
      console.error("[posts] deferred scoreSplit failed:", err);
    }
  });

  return NextResponse.json(post, { status: 201 });
});

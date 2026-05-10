import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") ?? 12), 50);

  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id ?? null;

  const posts = await prisma.post.findMany({
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

  const mapped = page.map((p) => ({
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

  return NextResponse.json({ posts: mapped, nextCursor });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageUrl, pubName, city } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });

  const post = await prisma.post.create({
    data: { userId: session.user.id, imageUrl, pubName, city },
  });

  return NextResponse.json(post, { status: 201 });
}

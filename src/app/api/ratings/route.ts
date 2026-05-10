import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await req.json();
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  const existing = await prisma.rating.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  });

  if (existing) {
    // Un-cheers — delete rating and any associated notification
    await prisma.rating.delete({ where: { postId_userId: { postId, userId: session.user.id } } });
    await prisma.notification.deleteMany({
      where: { actorId: session.user.id, postId, type: "cheers" },
    });
    return NextResponse.json({ cheersed: false });
  } else {
    // Cheers — create rating
    await prisma.rating.create({ data: { postId, userId: session.user.id, score: 1 } });

    // Notify post owner (but not if they're cheersing their own post)
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
    if (post && post.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          actorId: session.user.id,
          postId,
          type: "cheers",
        },
      });
    }

    return NextResponse.json({ cheersed: true });
  }
}

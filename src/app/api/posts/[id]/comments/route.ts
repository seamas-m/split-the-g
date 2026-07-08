import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-auth";

type RouteCtx = { params: Promise<{ id: string }> };

// GET is public — anyone can read comments on a post
export async function GET(_req: NextRequest, { params }: RouteCtx) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { username: true, name: true } } },
  });
  return NextResponse.json(comments);
}

export const POST = withAuth<RouteCtx>(async (req, { session, params }) => {
  const { id } = await params;
  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });

  const [comment, post] = await Promise.all([
    prisma.comment.create({
      data: { postId: id, userId: session.user.id, text: text.trim() },
      include: { user: { select: { username: true, name: true } } },
    }),
    prisma.post.findUnique({ where: { id }, select: { userId: true } }),
  ]);

  // Notify post owner (skip if commenting on own post)
  if (post && post.userId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: post.userId,
        actorId: session.user.id,
        postId: id,
        type: "comment",
        body: text.trim().slice(0, 80),
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
});

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, parseBody } from "@/lib/api-auth";

type RouteCtx = { params: Promise<{ id: string }> };

const CommentBody = z.object({
  text: z.string().trim().min(1, "text can't be empty").max(500, "500 char limit"),
});

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
  const { text } = await parseBody(req, CommentBody);

  const [comment, post] = await Promise.all([
    prisma.comment.create({
      data: { postId: id, userId: session.user.id, text },
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
        body: text.slice(0, 80),
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
});

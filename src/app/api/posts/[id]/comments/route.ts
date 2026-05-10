import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { username: true, name: true } } },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
}

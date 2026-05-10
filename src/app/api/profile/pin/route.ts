import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST { postId } — pin a post. POST { postId: null } — unpin.
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await req.json();

  if (postId) {
    // Validate the post belongs to this user
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only pin your own posts" }, { status: 403 });
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pinnedPostId: postId ?? null },
  });

  return NextResponse.json({ pinnedPostId: postId ?? null });
}

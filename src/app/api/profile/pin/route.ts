import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, requirePostOwner } from "@/lib/api-auth";

// POST { postId } — pin a post. POST { postId: null } — unpin.
export const POST = withAuth(async (req, { session }) => {
  const { postId } = await req.json();

  if (postId) {
    // Ownership check — you can only pin your own posts
    await requirePostOwner(postId, session.user.id);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pinnedPostId: postId ?? null },
  });

  return NextResponse.json({ pinnedPostId: postId ?? null });
});

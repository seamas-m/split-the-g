import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, requirePostOwner, parseBody } from "@/lib/api-auth";

const PinBody = z.object({
  postId: z.string().min(1).nullable(),
});

// POST { postId } — pin a post. POST { postId: null } — unpin.
export const POST = withAuth(async (req, { session }) => {
  const { postId } = await parseBody(req, PinBody);

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

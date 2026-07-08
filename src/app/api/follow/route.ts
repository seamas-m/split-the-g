import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, HttpError, parseBody } from "@/lib/api-auth";

const FollowBody = z.object({
  followingId: z.string().min(1),
});

// POST { followingId } — toggle follow/unfollow, returns { following: bool }
export const POST = withAuth(async (req, { session }) => {
  const { followingId } = await parseBody(req, FollowBody);

  if (followingId === session.user.id) {
    throw new HttpError(403, "You can't follow yourself");
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId } },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: session.user.id, followingId } },
    });
    return NextResponse.json({ following: false });
  } else {
    await prisma.follow.create({
      data: { followerId: session.user.id, followingId },
    });
    return NextResponse.json({ following: true });
  }
});

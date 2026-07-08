import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, HttpError } from "@/lib/api-auth";

// POST { followingId } — toggle follow/unfollow, returns { following: bool }
export const POST = withAuth(async (req, { session }) => {
  const { followingId } = await req.json();
  if (!followingId) return NextResponse.json({ error: "followingId required" }, { status: 400 });
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

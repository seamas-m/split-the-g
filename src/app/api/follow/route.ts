import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST { followingId } — toggle follow/unfollow, returns { following: bool }
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { followingId } = await req.json();
  if (!followingId) return NextResponse.json({ error: "followingId required" }, { status: 400 });
  if (followingId === session.user.id) {
    return NextResponse.json({ error: "You can't follow yourself" }, { status: 403 });
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
}

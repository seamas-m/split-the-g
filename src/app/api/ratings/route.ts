import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// score: 1 = "nailed it", 0 = "not quite"
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, vote } = await req.json();
  if (!postId || (vote !== "nailed" && vote !== "notquite")) {
    return NextResponse.json({ error: "postId and vote (nailed|notquite) required" }, { status: 400 });
  }

  // Block self-voting — the whole point is community validation
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (post.userId === session.user.id) {
    return NextResponse.json({ error: "You can't vote on your own post" }, { status: 403 });
  }

  const score = vote === "nailed" ? 1 : 0;
  const existing = await prisma.rating.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  });

  if (existing) {
    if (existing.score === score) {
      // Same vote — toggle off
      await prisma.rating.delete({ where: { postId_userId: { postId, userId: session.user.id } } });
      await prisma.notification.deleteMany({
        where: { actorId: session.user.id, postId, type: "nailed" },
      });
      return NextResponse.json({ userVote: null });
    } else {
      // Different vote — switch
      await prisma.rating.update({
        where: { postId_userId: { postId, userId: session.user.id } },
        data: { score },
      });
      if (existing.score === 1) {
        await prisma.notification.deleteMany({
          where: { actorId: session.user.id, postId, type: "nailed" },
        });
      }
      if (score === 1) {
        await prisma.notification.create({
          data: { userId: post.userId, actorId: session.user.id, postId, type: "nailed" },
        });
      }
      return NextResponse.json({ userVote: vote });
    }
  } else {
    // New vote
    await prisma.rating.create({ data: { postId, userId: session.user.id, score } });
    if (score === 1) {
      await prisma.notification.create({
        data: { userId: post.userId, actorId: session.user.id, postId, type: "nailed" },
      });
    }
    return NextResponse.json({ userVote: vote });
  }
}

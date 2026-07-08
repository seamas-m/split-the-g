import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, HttpError, parseBody } from "@/lib/api-auth";

const RatingBody = z.object({
  postId: z.string().min(1),
  vote: z.enum(["nailed", "notquite"]),
});

// score: 1 = "nailed it", 0 = "not quite"
export const POST = withAuth(async (req, { session }) => {
  const { postId, vote } = await parseBody(req, RatingBody);

  // Block self-voting — the whole point is community validation
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
  if (!post) throw new HttpError(404, "Post not found");
  if (post.userId === session.user.id) {
    throw new HttpError(403, "You can't vote on your own post");
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
});

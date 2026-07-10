import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, HttpError, parseBody } from "@/lib/api-auth";

const RatingBody = z.object({
  postId: z.string().min(1),
  vote: z.enum(["nailed", "notquite"]),
});

export const POST = withAuth(async (req, { session }) => {
  const { postId, vote } = await parseBody(req, RatingBody);
  const userId = session.user.id;
  const nailed = vote === "nailed";

  // Block self-voting — the whole point is community validation
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
  if (!post) throw new HttpError(404, "Post not found");
  if (post.userId === userId) {
    throw new HttpError(403, "You can't vote on your own post");
  }

  const existing = await prisma.rating.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing && existing.nailed === nailed) {
    // Same vote — toggle off. Atomic: delete rating + clean up its notification.
    await prisma.$transaction([
      prisma.rating.delete({ where: { postId_userId: { postId, userId } } }),
      prisma.notification.deleteMany({
        where: { actorId: userId, postId, type: "nailed" },
      }),
    ]);
    return NextResponse.json({ userVote: null });
  }

  if (existing) {
    // Switch vote — atomic: update rating + notification bookkeeping in one txn.
    // If the switch is from "nailed" to "notquite", delete the old notification.
    // If the switch is to "nailed", create one.
    await prisma.$transaction([
      prisma.rating.update({
        where: { postId_userId: { postId, userId } },
        data: { nailed },
      }),
      ...(existing.nailed
        ? [prisma.notification.deleteMany({
            where: { actorId: userId, postId, type: "nailed" },
          })]
        : []),
      ...(nailed
        ? [prisma.notification.create({
            data: { userId: post.userId, actorId: userId, postId, type: "nailed" },
          })]
        : []),
    ]);
    return NextResponse.json({ userVote: vote });
  }

  // New vote — atomic: create rating + optional notification in one txn.
  await prisma.$transaction([
    prisma.rating.create({ data: { postId, userId, nailed } }),
    ...(nailed
      ? [prisma.notification.create({
          data: { userId: post.userId, actorId: userId, postId, type: "nailed" },
        })]
      : []),
  ]);
  return NextResponse.json({ userVote: vote });
});

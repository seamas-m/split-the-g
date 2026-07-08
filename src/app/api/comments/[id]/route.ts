import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, requireCommentOwner } from "@/lib/api-auth";

type RouteCtx = { params: Promise<{ id: string }> };

export const DELETE = withAuth<RouteCtx>(async (_req, { session, params }) => {
  const { id } = await params;
  await requireCommentOwner(id, session.user.id);

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ success: true });
});

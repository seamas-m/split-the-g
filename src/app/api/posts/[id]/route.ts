import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, requirePostOwner, parseBody } from "@/lib/api-auth";

type RouteCtx = { params: Promise<{ id: string }> };

const UpdatePostBody = z.object({
  imageUrl: z.string().url().max(2048).optional(),
  pubName:  z.string().trim().max(120).nullable().optional(),
  city:     z.string().trim().max(120).nullable().optional(),
});

export const PATCH = withAuth<RouteCtx>(async (req, { session, params }) => {
  const { id } = await params;
  await requirePostOwner(id, session.user.id);

  const { pubName, city, imageUrl } = await parseBody(req, UpdatePostBody);
  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...(imageUrl ? { imageUrl } : {}),
      pubName: pubName ?? null,
      city: city ?? null,
    },
  });

  return NextResponse.json(updated);
});

export const DELETE = withAuth<RouteCtx>(async (_req, { session, params }) => {
  const { id } = await params;
  await requirePostOwner(id, session.user.id);

  await prisma.rating.deleteMany({ where: { postId: id } });
  await prisma.post.delete({ where: { id } });

  return NextResponse.json({ success: true });
});

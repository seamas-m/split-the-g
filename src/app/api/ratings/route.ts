import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, score } = await req.json();
  if (!postId || typeof score !== "number" || score < 1 || score > 5) {
    return NextResponse.json({ error: "postId and score (1-5) required" }, { status: 400 });
  }

  const rating = await prisma.rating.upsert({
    where: { postId_userId: { postId, userId: session.user.id } },
    create: { postId, userId: session.user.id, score },
    update: { score },
  });

  return NextResponse.json(rating);
}

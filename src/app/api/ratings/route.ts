import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await req.json();
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  const existing = await prisma.rating.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.rating.delete({ where: { postId_userId: { postId, userId: session.user.id } } });
    return NextResponse.json({ cheersed: false });
  } else {
    await prisma.rating.create({ data: { postId, userId: session.user.id, score: 1 } });
    return NextResponse.json({ cheersed: true });
  }
}

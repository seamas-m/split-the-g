import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { username: true, image: true } },
      ratings: { select: { score: true } },
    },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageUrl, pubName, city, settleSeconds } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });

  const post = await prisma.post.create({
    data: { userId: session.user.id, imageUrl, pubName, city, settleSeconds },
  });

  return NextResponse.json(post, { status: 201 });
}

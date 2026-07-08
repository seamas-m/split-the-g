import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import type { ZodType } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

/**
 * HttpError lets ownership/validation helpers short-circuit a handler by
 * throwing. withAuth catches it and converts to a JSON response with the
 * right status. Handlers don't need to sprinkle early returns everywhere.
 */
export class HttpError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

/**
 * Wraps a route handler with auth + centralised HttpError → response mapping.
 *
 * Usage:
 *   export const POST = withAuth<{ params: Promise<{ id: string }> }>(
 *     async (req, { session, params }) => {
 *       const { id } = await params;
 *       const post = await requirePostOwner(id, session.user.id);
 *       // ... business logic
 *       return NextResponse.json({ ok: true });
 *     }
 *   );
 *
 * Also catches HttpError thrown by helpers like requirePostOwner so
 * handlers can express "must own X" as a single call.
 */
// Next.js always passes a { params: Promise<...> } context, even for
// non-dynamic routes. Default to Promise<{}> so wrapper handlers without
// route params still typecheck against Next's route validator.
type BaseCtx = { params: Promise<Record<string, string>> };

export function withAuth<Ctx extends BaseCtx = BaseCtx>(
  handler: (
    req: NextRequest,
    ctx: Ctx & { session: Session },
  ) => Promise<Response> | Response,
) {
  return async (req: NextRequest, ctx: Ctx): Promise<Response> => {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return await handler(req, { ...ctx, session });
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.code }, { status: err.status });
      }
      throw err;
    }
  };
}

/**
 * Parses the request body against a Zod schema, throwing HttpError(400)
 * on either a JSON parse failure or a validation failure. withAuth
 * catches these and returns a proper 400 JSON response, so route
 * handlers stay linear.
 *
 * Usage:
 *   const RatingBody = z.object({
 *     postId: z.string().uuid(),
 *     vote: z.enum(["nailed", "notquite"]),
 *   });
 *   export const POST = withAuth(async (req, { session }) => {
 *     const { postId, vote } = await parseBody(req, RatingBody);
 *     // ...
 *   });
 */
export async function parseBody<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = first.path.length > 0 ? `${first.path.join(".")}: ` : "";
    throw new HttpError(400, `${field}${first.message}`);
  }
  return parsed.data;
}

/**
 * Fetches a post and asserts the given user owns it. Throws HttpError
 * (404 or 403) if not — withAuth converts these to responses.
 */
export async function requirePostOwner(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, userId: true },
  });
  if (!post) throw new HttpError(404, "Not found");
  if (post.userId !== userId) throw new HttpError(403, "Forbidden");
  return post;
}

/**
 * Fetches a comment and asserts the given user owns it.
 */
export async function requireCommentOwner(commentId: string, userId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true },
  });
  if (!comment) throw new HttpError(404, "Not found");
  if (comment.userId !== userId) throw new HttpError(403, "Forbidden");
  return comment;
}

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  getPublishedPostIdBySlug,
  insertPostComment,
  listPublicCommentsForPost,
} from "@/features/posts/mutations";
import { commentInputSchema } from "@/features/posts/validators";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first.slice(0, 45);
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim().slice(0, 45);
  return "unknown";
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const postId = await getPublishedPostIdBySlug(slug);
  if (!postId) {
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
  }
  const comments = await listPublicCommentsForPost(postId);
  return NextResponse.json({ comments });
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const postId = await getPublishedPostIdBySlug(slug);
  if (!postId) {
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
  }

  const ip = clientIp(request);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = commentInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validação falhou", details: parsed.error.flatten() }, { status: 400 });
  }

  const ua = request.headers.get("user-agent");

  const id = await insertPostComment({
    postId,
    displayName: parsed.data.displayName,
    body: parsed.data.body,
    authorIp: ip,
    userAgent: ua,
  });

  if (!id) {
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 500 });
  }

  revalidatePath(`/posts/${slug}`);
  return NextResponse.json({ ok: true, id }, { status: 201 });
}

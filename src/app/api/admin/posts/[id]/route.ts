import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminPostById, updatePostInDb } from "@/features/posts/mutations";
import { postInputSchema } from "@/features/posts/validators";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID ausente" }, { status: 400 });
  }

  const existing = await getAdminPostById(id);
  if (!existing) {
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = postInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validação falhou", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const cover = data.coverImageUrl === undefined ? existing.coverImageUrl : data.coverImageUrl;

  try {
    const { slug } = await updatePostInDb(id, {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      markdownContent: data.markdownContent,
      status: data.status,
      coverImageUrl: cover,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      regenerateSlugFromTitle: data.regenerateSlugFromTitle,
    });

    revalidatePath("/");
    revalidatePath("/admin/posts");
    revalidatePath(`/posts/${slug}`);
    revalidatePath(`/posts/${existing.slug}`);

    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao salvar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

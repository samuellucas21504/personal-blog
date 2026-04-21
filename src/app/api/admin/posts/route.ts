import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createPostFromTitle } from "@/features/posts/mutations";
import { createPostTitleSchema } from "@/features/posts/validators";
import { ensureAppUser } from "@/lib/auth/sync-user";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createPostTitleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validação falhou", details: parsed.error.flatten() }, { status: 400 });
  }

  const displayName =
    session.githubLogin || session.email.split("@")[0] || "Autor";

  await ensureAppUser({
    id: session.id,
    email: session.email,
    displayName: displayName.slice(0, 120),
  });

  try {
    const created = await createPostFromTitle({
      authorId: session.id,
      title: parsed.data.title,
    });
    revalidatePath("/admin/posts");
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criar post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

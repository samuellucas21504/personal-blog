import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { softDeleteComment } from "@/features/posts/mutations";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID ausente" }, { status: 400 });
  }

  const ok = await softDeleteComment(id);
  if (!ok) {
    return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });
  }

  revalidatePath("/admin/comments");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

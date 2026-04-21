import { NextResponse } from "next/server";

import { listCommentsForAdmin } from "@/features/posts/mutations";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const comments = await listCommentsForAdmin();
  return NextResponse.json({ comments });
}

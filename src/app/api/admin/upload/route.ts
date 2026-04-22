import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const MAX_BYTES = 2 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "image";
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.NEXT_PUBLIC_POST_MEDIA_BUCKET ?? "post-media";

  if (!url || !serviceKey) {
    const missing: string[] = [];
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json(
      {
        error: "Upload não configurado",
        hint: `Defina na Vercel (ou .env.local): ${missing.join(", ")}. No Supabase: Settings → API → service_role. Storage: bucket público (nome em NEXT_PUBLIC_POST_MEDIA_BUCKET ou post-media).`,
      },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Form-data inválido" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Campo file obrigatório" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido (use JPEG, PNG, GIF ou WebP)." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Arquivo muito grande (máx. 2 MB)." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const safeName = sanitizeFilename(file.name);
  const path = `${session.id}/${Date.now()}-${safeName}`;

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await admin.storage.from(bucket).upload(path, buf, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: pub } = admin.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl });
}

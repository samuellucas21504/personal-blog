import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { posts } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "DATABASE_URL is not set",
        hint: "Add the Postgres connection string from Supabase (Database → Connection string → URI) to .env.local.",
      },
      { status: 503 },
    );
  }

  const started = Date.now();
  try {
    const db = getDb();
    await db.execute(sql`select 1`);
    await db.select({ id: posts.id }).from(posts).limit(1);
    return NextResponse.json({
      ok: true,
      latencyMs: Date.now() - started,
      postsTable: "reachable",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause =
      error instanceof Error && "cause" in error && error.cause instanceof Error
        ? error.cause.message
        : undefined;
    return NextResponse.json(
      {
        ok: false,
        latencyMs: Date.now() - started,
        error: message,
        ...(cause ? { cause } : {}),
      },
      { status: 503 },
    );
  }
}

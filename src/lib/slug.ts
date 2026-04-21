import { and, eq, isNull, ne } from "drizzle-orm";
import slugify from "slugify";

import { getDb } from "@/lib/db/client";
import { posts } from "@/lib/db/schema";

export function titleToSlugBase(title: string): string {
  const raw = slugify(title.trim(), {
    lower: true,
    strict: true,
    trim: true,
  });
  if (raw.length >= 3) return raw.slice(0, 200);
  const fallback = `${slugify("post", { lower: true, strict: true })}-${Date.now().toString(36)}`;
  return fallback.slice(0, 200);
}

/** Slug único em `posts` (ignora soft-deleted). Opcionalmente exclui um post ao editar. */
export async function allocateUniquePostSlug(base: string, excludePostId?: string): Promise<string> {
  const db = getDb();
  const normalized = base.slice(0, 200) || "post";

  for (let i = 0; i < 200; i += 1) {
    const candidate = i === 0 ? normalized : `${normalized}-${i + 1}`.slice(0, 200);
    const parts = [isNull(posts.deletedAt), eq(posts.slug, candidate)];
    if (excludePostId) {
      parts.push(ne(posts.id, excludePostId));
    }
    const existing = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(...parts)!)
      .limit(1);

    if (existing.length === 0) {
      return candidate;
    }
  }

  return `${normalized}-${crypto.randomUUID().slice(0, 8)}`.slice(0, 200);
}

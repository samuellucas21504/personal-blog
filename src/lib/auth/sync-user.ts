import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

/**
 * Garante linha em `public.users` com o mesmo UUID do Supabase Auth,
 * necessário para FK de `posts.author_id`.
 */
export async function ensureAppUser(params: { id: string; email: string; displayName: string }) {
  const db = getDb();
  const email = params.email.slice(0, 320);
  const displayName = params.displayName.slice(0, 120) || email.split("@")[0] || "Autor";

  await db
    .insert(users)
    .values({
      id: params.id,
      email,
      displayName,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email,
        displayName,
        updatedAt: new Date(),
      },
    });
}

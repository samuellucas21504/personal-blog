import {
  getPublishedPostBySlugFromDb,
  listAdminPostsFromDb,
  listByCategoryFromDb,
  listByTagFromDb,
  listFeaturedPostsFromDb,
  listPublishedPostsFromDb,
  listPublishedPostsPaginatedFromDb,
  searchPublishedPostsFromDb,
  setFeaturedPostInDb,
} from "@/features/posts/data";
import type { Post } from "@/features/posts/types";
import { isDatabaseConfigured } from "@/lib/db/client";

function assertDb() {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is not set. Use the Supabase project connection string (Settings → Database) and copy it into .env.local.",
    );
  }
}

export async function listPublishedPosts(): Promise<Post[]> {
  assertDb();
  return listPublishedPostsFromDb();
}

export async function listAdminPosts(): Promise<Post[]> {
  assertDb();
  return listAdminPostsFromDb();
}

export async function listPublishedPostsPaginated(page: number, pageSize: number, query = "") {
  assertDb();
  return listPublishedPostsPaginatedFromDb(page, pageSize, query);
}

export async function listFeaturedPosts(): Promise<Post[]> {
  assertDb();
  return listFeaturedPostsFromDb();
}

export async function setFeaturedPost(postId: string): Promise<boolean> {
  assertDb();
  return setFeaturedPostInDb(postId);
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  assertDb();
  return getPublishedPostBySlugFromDb(slug);
}

export async function searchPublishedPosts(query: string): Promise<Post[]> {
  assertDb();
  return searchPublishedPostsFromDb(query);
}

export async function listByTag(tagSlug: string): Promise<Post[]> {
  assertDb();
  return listByTagFromDb(tagSlug);
}

export async function listByCategory(categorySlug: string): Promise<Post[]> {
  assertDb();
  return listByCategoryFromDb(categorySlug);
}

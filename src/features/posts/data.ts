import { and, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from "drizzle-orm";

import type { Post, PostStatus } from "@/features/posts/types";
import { getDb } from "@/lib/db/client";
import {
  categories,
  postCategories,
  posts,
  postTags,
  tags,
  users,
} from "@/lib/db/schema";

function publishedConditions(): SQL {
  return and(eq(posts.status, "published"), isNull(posts.deletedAt))!;
}

/** Display name when `users` row is missing (integrity edge case). */
const authorDisplayName = sql<string>`coalesce(${users.displayName}, 'Autor')`;

const postListColumns = {
  id: posts.id,
  title: posts.title,
  slug: posts.slug,
  excerpt: posts.excerpt,
  markdownContent: posts.markdownContent,
  coverImageUrl: posts.coverImageUrl,
  status: posts.status,
  isFeatured: posts.isFeatured,
  publishedAt: posts.publishedAt,
  authorId: posts.authorId,
  authorName: authorDisplayName,
  seoTitle: posts.seoTitle,
  seoDescription: posts.seoDescription,
};

const publishedAtOrCreatedDesc = desc(sql`coalesce(${posts.publishedAt}, ${posts.createdAt})`);

/** Removes LIKE wildcards from user input so `ilike` stays predictable. */
function searchPattern(query: string): string | null {
  const t = query.trim().replace(/[%_\\]/g, "");
  if (!t) return null;
  return `%${t}%`;
}

function mapRow(
  row: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    markdownContent: string;
    coverImageUrl: string | null;
    status: PostStatus;
    isFeatured: boolean;
    publishedAt: Date | null;
    authorId: string;
    authorName: string;
    seoTitle: string | null;
    seoDescription: string | null;
  },
  tax: { tags: string[]; categories: string[] },
): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    markdownContent: row.markdownContent,
    coverImageUrl: row.coverImageUrl,
    status: row.status,
    isFeatured: row.isFeatured,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    authorId: row.authorId,
    authorName: row.authorName,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    tags: tax.tags,
    categories: tax.categories,
  };
}

type PostSelectRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  markdownContent: string;
  coverImageUrl: string | null;
  status: PostStatus;
  isFeatured: boolean;
  publishedAt: Date | null;
  authorId: string;
  authorName: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

async function loadTagsForPosts(postIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (postIds.length === 0) return map;

  const db = getDb();
  const rows = await db
    .select({ postId: postTags.postId, slug: tags.slug })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(inArray(postTags.postId, postIds));

  for (const row of rows) {
    const list = map.get(row.postId) ?? [];
    list.push(row.slug);
    map.set(row.postId, list);
  }
  return map;
}

async function loadCategoriesForPosts(postIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (postIds.length === 0) return map;

  const db = getDb();
  const rows = await db
    .select({ postId: postCategories.postId, slug: categories.slug })
    .from(postCategories)
    .innerJoin(categories, eq(postCategories.categoryId, categories.id))
    .where(inArray(postCategories.postId, postIds));

  for (const row of rows) {
    const list = map.get(row.postId) ?? [];
    list.push(row.slug);
    map.set(row.postId, list);
  }
  return map;
}

async function attachTaxonomy(rows: PostSelectRow[]): Promise<Post[]> {
  const ids = rows.map((r) => r.id);
  const [tagMap, catMap] = await Promise.all([loadTagsForPosts(ids), loadCategoriesForPosts(ids)]);
  return rows.map((r) =>
    mapRow(r, {
      tags: tagMap.get(r.id) ?? [],
      categories: catMap.get(r.id) ?? [],
    }),
  );
}

async function selectPostRows(whereExpr: SQL, limit?: number, offset?: number) {
  const db = getDb();
  const base = db
    .select(postListColumns)
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(whereExpr)
    .orderBy(publishedAtOrCreatedDesc);

  if (limit !== undefined && offset !== undefined) {
    return (await base.limit(limit).offset(offset)) as PostSelectRow[];
  }
  if (limit !== undefined) {
    return (await base.limit(limit)) as PostSelectRow[];
  }
  return (await base) as PostSelectRow[];
}

export async function listPublishedPostsFromDb(): Promise<Post[]> {
  const rows = await selectPostRows(publishedConditions());
  return attachTaxonomy(rows);
}

/** All non-deleted posts (any status), for admin lists. */
export async function listAdminPostsFromDb(): Promise<Post[]> {
  const db = getDb();
  const rows = await db
    .select(postListColumns)
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(isNull(posts.deletedAt))
    .orderBy(desc(posts.updatedAt));

  return attachTaxonomy(rows as PostSelectRow[]);
}

export async function listPublishedPostsPaginatedFromDb(
  page: number,
  pageSize: number,
  query = "",
): Promise<{ data: Post[]; hasMore: boolean }> {
  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const offset = (safePage - 1) * safePageSize;
  const pat = searchPattern(query);

  const searchClause = pat
    ? or(
        ilike(posts.title, pat),
        ilike(posts.excerpt, pat),
        ilike(posts.markdownContent, pat),
      )
    : undefined;

  const whereExpr = searchClause ? and(publishedConditions(), searchClause)! : publishedConditions();

  const rows = await selectPostRows(whereExpr, safePageSize + 1, offset);
  const hasMore = rows.length > safePageSize;
  const slice = rows.slice(0, safePageSize);
  return { data: await attachTaxonomy(slice), hasMore };
}

export async function listFeaturedPostsFromDb(): Promise<Post[]> {
  const db = getDb();
  const rows = await db
    .select(postListColumns)
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(publishedConditions(), eq(posts.isFeatured, true)))
    .orderBy(publishedAtOrCreatedDesc)
    .limit(3);

  return attachTaxonomy(rows as PostSelectRow[]);
}

export async function setFeaturedPostInDb(postId: string): Promise<boolean> {
  const db = getDb();
  return db.transaction(async (tx) => {
    await tx.update(posts).set({ isFeatured: false }).where(eq(posts.isFeatured, true));

    const updated = await tx
      .update(posts)
      .set({ isFeatured: true })
      .where(and(eq(posts.id, postId), publishedConditions()))
      .returning({ id: posts.id });

    return updated.length > 0;
  });
}

export async function getPublishedPostBySlugFromDb(slug: string): Promise<Post | null> {
  const rows = await selectPostRows(and(publishedConditions(), eq(posts.slug, slug))!, 1);
  const withTax = await attachTaxonomy(rows);
  return withTax[0] ?? null;
}

export async function searchPublishedPostsFromDb(query: string): Promise<Post[]> {
  const pat = searchPattern(query);
  if (!pat) {
    return listPublishedPostsFromDb();
  }
  const whereExpr = and(
    publishedConditions(),
    or(ilike(posts.title, pat), ilike(posts.excerpt, pat), ilike(posts.markdownContent, pat)),
  )!;
  const rows = await selectPostRows(whereExpr);
  return attachTaxonomy(rows);
}

export async function listByTagFromDb(tagSlug: string): Promise<Post[]> {
  const db = getDb();
  const [tag] = await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, tagSlug)).limit(1);
  if (!tag) return [];

  const rows = await db
    .select(postListColumns)
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .innerJoin(postTags, eq(postTags.postId, posts.id))
    .where(and(publishedConditions(), eq(postTags.tagId, tag.id)))
    .orderBy(publishedAtOrCreatedDesc);

  return attachTaxonomy(rows as PostSelectRow[]);
}

export async function listByCategoryFromDb(categorySlug: string): Promise<Post[]> {
  const db = getDb();
  const [cat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, categorySlug))
    .limit(1);
  if (!cat) return [];

  const rows = await db
    .select(postListColumns)
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .innerJoin(postCategories, eq(postCategories.postId, posts.id))
    .where(and(publishedConditions(), eq(postCategories.categoryId, cat.id)))
    .orderBy(publishedAtOrCreatedDesc);

  return attachTaxonomy(rows as PostSelectRow[]);
}

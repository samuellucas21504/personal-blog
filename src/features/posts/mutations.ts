import { and, desc, eq, isNull, sql } from "drizzle-orm";
import readingTime from "reading-time";

import type { Post, PostStatus } from "@/features/posts/types";
import { getDb } from "@/lib/db/client";
import { postComments, posts, users } from "@/lib/db/schema";
import { allocateUniquePostSlug, titleToSlugBase } from "@/lib/slug";

function computeReadingMinutes(markdown: string): number {
  const stats = readingTime(markdown);
  return Math.max(1, Math.round(stats.minutes));
}

const adminPostSelect = {
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
  authorName: sql<string>`coalesce(${users.displayName}, 'Autor')`,
  seoTitle: posts.seoTitle,
  seoDescription: posts.seoDescription,
};

type AdminPostRow = {
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

function rowToPost(row: AdminPostRow): Post {
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
    tags: [],
    categories: [],
  };
}

export async function getAdminPostBySlug(slug: string): Promise<Post | null> {
  const db = getDb();
  const [row] = await db
    .select(adminPostSelect)
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(isNull(posts.deletedAt), eq(posts.slug, slug)))
    .limit(1);

  return row ? rowToPost(row as AdminPostRow) : null;
}

export async function getAdminPostById(id: string): Promise<Post | null> {
  const db = getDb();
  const [row] = await db
    .select(adminPostSelect)
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(isNull(posts.deletedAt), eq(posts.id, id)))
    .limit(1);

  return row ? rowToPost(row as AdminPostRow) : null;
}

export type CreatePostInput = {
  authorId: string;
  title: string;
};

export async function createPostFromTitle(input: CreatePostInput): Promise<{ id: string; slug: string }> {
  const db = getDb();
  const base = titleToSlugBase(input.title);
  const slug = await allocateUniquePostSlug(base);
  const title = input.title.trim().slice(0, 160);
  const excerpt =
    title.length >= 10 ? title.slice(0, 320) : `${title} — rascunho`.slice(0, 320);
  const markdown = `# ${title}\n\nComece o conteúdo aqui.\n`;

  const [created] = await db
    .insert(posts)
    .values({
      title,
      slug,
      excerpt,
      markdownContent: markdown,
      authorId: input.authorId,
      status: "draft",
      readingTime: computeReadingMinutes(markdown),
    })
    .returning({ id: posts.id, slug: posts.slug });

  if (!created) {
    throw new Error("Falha ao criar post.");
  }
  return created;
}

export type UpdatePostInput = {
  title: string;
  slug: string;
  excerpt: string;
  markdownContent: string;
  status: PostStatus;
  coverImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  regenerateSlugFromTitle?: boolean;
};

export async function updatePostInDb(postId: string, input: UpdatePostInput): Promise<{ slug: string }> {
  const db = getDb();

  const [prev] = await db
    .select({ publishedAt: posts.publishedAt })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  let nextSlug = input.slug;
  if (input.regenerateSlugFromTitle) {
    const base = titleToSlugBase(input.title);
    nextSlug = await allocateUniquePostSlug(base, postId);
  } else {
    const resolved = await allocateUniquePostSlug(input.slug, postId);
    nextSlug = resolved;
  }

  let nextPublishedAt: Date | null = prev?.publishedAt ?? null;
  if (input.status === "published" && !nextPublishedAt) {
    nextPublishedAt = new Date();
  }

  await db
    .update(posts)
    .set({
      title: input.title.slice(0, 160),
      slug: nextSlug.slice(0, 200),
      excerpt: input.excerpt.slice(0, 320),
      markdownContent: input.markdownContent,
      status: input.status,
      coverImageUrl: input.coverImageUrl,
      seoTitle: input.seoTitle?.slice(0, 160) ?? null,
      seoDescription: input.seoDescription?.slice(0, 320) ?? null,
      readingTime: computeReadingMinutes(input.markdownContent),
      updatedAt: new Date(),
      publishedAt: nextPublishedAt,
    })
    .where(eq(posts.id, postId));

  return { slug: nextSlug };
}

export type PublicComment = {
  id: string;
  displayName: string;
  body: string;
  createdAt: string;
};

export async function listPublicCommentsForPost(postId: string): Promise<PublicComment[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: postComments.id,
      displayName: postComments.displayName,
      body: postComments.body,
      createdAt: postComments.createdAt,
    })
    .from(postComments)
    .where(and(eq(postComments.postId, postId), isNull(postComments.deletedAt)))
    .orderBy(desc(postComments.createdAt));

  return rows.map((r) => ({
    id: r.id,
    displayName: r.displayName,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function insertPostComment(params: {
  postId: string;
  displayName: string;
  body: string;
  authorIp: string;
  userAgent: string | null;
}) {
  const db = getDb();
  const [row] = await db
    .insert(postComments)
    .values({
      postId: params.postId,
      displayName: params.displayName.slice(0, 80),
      body: params.body.slice(0, 4000),
      authorIp: params.authorIp.slice(0, 45),
      userAgent: params.userAgent?.slice(0, 512) ?? null,
    })
    .returning({ id: postComments.id });

  return row?.id ?? null;
}

export type AdminCommentRow = {
  id: string;
  postId: string;
  postTitle: string;
  postSlug: string;
  displayName: string;
  body: string;
  authorIp: string;
  createdAt: string;
};

export async function listCommentsForAdmin(): Promise<AdminCommentRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: postComments.id,
      postId: postComments.postId,
      postTitle: posts.title,
      postSlug: posts.slug,
      displayName: postComments.displayName,
      body: postComments.body,
      authorIp: postComments.authorIp,
      createdAt: postComments.createdAt,
    })
    .from(postComments)
    .innerJoin(posts, eq(postComments.postId, posts.id))
    .where(isNull(postComments.deletedAt))
    .orderBy(desc(postComments.createdAt))
    .limit(500);

  return rows.map((r) => ({
    id: r.id,
    postId: r.postId,
    postTitle: r.postTitle,
    postSlug: r.postSlug,
    displayName: r.displayName,
    body: r.body,
    authorIp: r.authorIp,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function softDeleteComment(commentId: string): Promise<boolean> {
  const db = getDb();
  const updated = await db
    .update(postComments)
    .set({ deletedAt: new Date() })
    .where(and(eq(postComments.id, commentId), isNull(postComments.deletedAt)))
    .returning({ id: postComments.id });
  return updated.length > 0;
}

export async function getPublishedPostIdBySlug(slug: string): Promise<string | null> {
  const db = getDb();
  const [row] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.status, "published"), isNull(posts.deletedAt), eq(posts.slug, slug)))
    .limit(1);
  return row?.id ?? null;
}

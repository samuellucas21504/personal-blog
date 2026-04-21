export type PostStatus = "draft" | "scheduled" | "published" | "archived";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  markdownContent: string;
  coverImageUrl: string | null;
  status: PostStatus;
  isFeatured: boolean;
  publishedAt: string | null;
  authorId: string;
  authorName: string;
  seoTitle: string | null;
  seoDescription: string | null;
  tags: string[];
  categories: string[];
};

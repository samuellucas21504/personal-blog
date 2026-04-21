import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarkdownPretextArticle } from "@/components/markdown-pretext-article";
import { PostCommentForm } from "@/components/post-comment-form";
import { PostCommentsList } from "@/components/post-comments-list";
import { SiteHeader } from "@/components/site-header";
import { listPublicCommentsForPost } from "@/features/posts/mutations";
import { getPublishedPostBySlug } from "@/features/posts/repository";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  const canonicalPath = `/posts/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalPath,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const comments = await listPublicCommentsForPost(post.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: post.authorName },
  };

  return (
    <>
      <SiteHeader trail={[{ label: post.title }]} />
      <main className="container">
        <article className="prose article-post">
          <h1>{post.title}</h1>
          <p className="article-post-excerpt">{post.excerpt}</p>
          <MarkdownPretextArticle markdown={post.markdownContent} variant="public" />
        </article>
        <section className="post-comments" aria-label="Comentários">
          <h2 className="post-comments-title">Comentários</h2>
          <PostCommentsList comments={comments} />
          <PostCommentForm slug={post.slug} />
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
    </>
  );
}

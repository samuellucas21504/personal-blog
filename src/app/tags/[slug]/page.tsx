import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { listByTag } from "@/features/posts/repository";

type TagPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const posts = await listByTag(slug);

  return (
    <>
      <SiteHeader trail={[{ label: "Tags" }, { label: slug }]} />
      <main className="container">
      <h1>Tag: {slug}</h1>
      {posts.map((post) => (
        <article key={post.id} className="post-card">
          <h2>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </h2>
        </article>
      ))}
    </main>
    </>
  );
}

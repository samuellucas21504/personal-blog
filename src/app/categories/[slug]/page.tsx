import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { listByCategory } from "@/features/posts/repository";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const posts = await listByCategory(slug);

  return (
    <>
      <SiteHeader trail={[{ label: "Categorias" }, { label: slug }]} />
      <main className="container">
      <h1>Categoria: {slug}</h1>
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

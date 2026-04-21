import Link from "next/link";

import { InfinitePostList } from "@/components/infinite-post-list";
import { SiteHeader } from "@/components/site-header";
import { listFeaturedPosts, listPublishedPostsPaginated } from "@/features/posts/repository";

type HomePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const pageSize = 6;
  const [featured, firstPage] = await Promise.all([
    listFeaturedPosts(),
    listPublishedPostsPaginated(1, pageSize, query),
  ]);

  const trail = query
    ? [{ label: "Busca" }, { label: query.length > 48 ? `${query.slice(0, 48)}…` : query }]
    : [];

  return (
    <>
      <SiteHeader trail={trail} />
      <main className="container home-page">
        <section className="home-intro">
          <p className="kicker">
            A necessidade de minha expressão gerou esse cemitério de ideias.
          </p>
          <p className="home-intro-secondary">
            Aqui é onde dou um descanso à minha mente das palavras que me prendem.
          </p>
        </section>
        <section className="home-search-section" aria-label="Busca de posts">
          <form className="home-search-form" action="/" method="get">
            <input
              className="home-search-input"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Buscar por tema, titulo ou palavra-chave..."
              aria-label="Buscar posts"
            />
            <button className="home-search-button" type="submit">
              <span aria-hidden>⌕</span>
              <span className="sr-only">Buscar</span>
            </button>
          </form>
        </section>
        {featured[0] ? (
          <Link href={`/posts/${featured[0].slug}`} className="featured-link">
            <section className="hero-card hero-featured-card">
              <p className="badge">Destaque</p>
              <h1>{featured[0].title}</h1>
              <p>{featured[0].excerpt}</p>
            </section>
          </Link>
        ) : null}
        <section className="recent-section">
          <h2 className="section-title">{query ? `Resultados para "${query}"` : "Posts recentes"}</h2>
          <InfinitePostList
            key={query || "all-posts"}
            initialPosts={firstPage.data}
            initialHasMore={firstPage.hasMore}
            pageSize={pageSize}
            query={query}
          />
        </section>
      </main>
    </>
  );
}

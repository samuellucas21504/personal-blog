import Link from "next/link";

import { listAdminPosts } from "@/features/posts/repository";
import { getSessionUser } from "@/lib/auth/session";

type AdminPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getSessionUser();
  const publishedForFeatured = (await listAdminPosts()).filter((post) => post.status === "published");
  const { success, error } = await searchParams;

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <h1>Painel editorial</h1>
        <p className="feed-state">Conectado como {session?.email || session?.githubLogin}</p>
        <div className="admin-dashboard-actions">
          <Link className="admin-primary-link" href="/admin/posts">
            Ver posts
          </Link>
          <Link className="admin-secondary-link" href="/admin/posts/edit">
            Abrir editor
          </Link>
        </div>
      </header>

      {success ? <p className="feed-state">Post em destaque atualizado com sucesso.</p> : null}
      {error ? <p className="feed-state">Nao foi possivel atualizar o destaque.</p> : null}

      <section className="feature-admin-card">
        <h2>Post em destaque</h2>
        <form action="/auth/featured" method="post" className="feature-admin-form">
          <select
            name="postId"
            className="feature-select"
            defaultValue={publishedForFeatured.find((post) => post.isFeatured)?.id}
          >
            {publishedForFeatured.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
          <button className="home-search-button github-login-button" type="submit">
            Salvar destaque
          </button>
        </form>
      </section>
    </main>
  );
}

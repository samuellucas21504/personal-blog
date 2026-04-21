import Link from "next/link";

import { listAdminPosts } from "@/features/posts/repository";

export default async function AdminPostsPage() {
  const posts = await listAdminPosts();

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <h1>Posts</h1>
        <p className="feed-state">Escolha um post para abrir no editor.</p>
        <Link className="admin-primary-link" href="/admin/posts/new">
          Novo post (título)
        </Link>
        <Link className="admin-secondary-link" href="/admin/posts/edit">
          Abrir editor por slug
        </Link>
      </header>
      <ul className="admin-post-list">
        {posts.map((post) => (
          <li key={post.id}>
            <Link className="admin-post-list-link" href={`/admin/posts/edit?slug=${encodeURIComponent(post.slug)}`}>
              <span className="admin-post-list-title">{post.title}</span>
              <span className="admin-post-list-meta">
                {post.slug} · {post.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

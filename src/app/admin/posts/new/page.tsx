import Link from "next/link";

import { NewPostFromTitleForm } from "@/components/admin/new-post-from-title-form";

export default function AdminNewPostPage() {
  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <h1>Novo post</h1>
        <p className="feed-state">Informe o título. O slug será gerado automaticamente.</p>
        <Link className="admin-secondary-link" href="/admin/posts">
          Voltar à listagem
        </Link>
      </header>
      <NewPostFromTitleForm />
    </main>
  );
}

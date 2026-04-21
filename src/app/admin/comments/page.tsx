import Link from "next/link";

import { AdminCommentRow } from "@/components/admin/admin-comment-row";
import { listCommentsForAdmin } from "@/features/posts/mutations";

export default async function AdminCommentsPage() {
  const comments = await listCommentsForAdmin();

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <h1>Comentários</h1>
        <p className="feed-state">Moderação: remoção segura (soft delete).</p>
        <Link className="admin-secondary-link" href="/admin">
          Voltar ao painel
        </Link>
      </header>
      {comments.length === 0 ? (
        <p className="feed-state">Nenhum comentário ativo.</p>
      ) : (
        <ul className="admin-comment-list">
          {comments.map((row) => (
            <AdminCommentRow key={row.id} row={row} />
          ))}
        </ul>
      )}
    </main>
  );
}

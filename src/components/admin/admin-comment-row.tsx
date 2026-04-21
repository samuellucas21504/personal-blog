"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AdminCommentRow } from "@/features/posts/mutations";

type Props = {
  row: AdminCommentRow;
};

export function AdminCommentRow({ row }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm("Remover este comentário?")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/comments/${encodeURIComponent(row.id)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Falha ao remover.");
        return;
      }
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <li className="admin-comment-card">
      <div className="admin-comment-head">
        <strong>{row.displayName}</strong>
        <span className="admin-comment-ip" title="IP registrado">
          {row.authorIp}
        </span>
        <time dateTime={row.createdAt}>{new Date(row.createdAt).toLocaleString("pt-BR")}</time>
      </div>
      <p className="admin-comment-post">
        Post:{" "}
        <Link href={`/posts/${encodeURIComponent(row.postSlug)}`}>{row.postTitle}</Link>
      </p>
      <p className="admin-comment-body">{row.body}</p>
      {error ? <p className="post-comments-error">{error}</p> : null}
      <button type="button" className="admin-comment-delete" disabled={deleting} onClick={() => void remove()}>
        {deleting ? "Removendo…" : "Excluir"}
      </button>
    </li>
  );
}

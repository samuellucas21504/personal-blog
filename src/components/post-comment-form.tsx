"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PostCommentFormProps = {
  slug: string;
};

export function PostCommentForm({ slug }: PostCommentFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name, body }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Não foi possível enviar." });
        return;
      }
      setName("");
      setBody("");
      setMessage({ type: "ok", text: "Comentário publicado. Obrigado!" });
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Erro de rede." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="post-comments-form" onSubmit={onSubmit}>
      <label className="post-comments-label">
        Nome
        <input
          className="post-comments-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          required
          autoComplete="nickname"
        />
      </label>
      <label className="post-comments-label">
        Comentário
        <textarea
          className="post-comments-textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={4000}
          rows={4}
          required
        />
      </label>
      {message ? (
        <p className={message.type === "ok" ? "post-comments-success" : "post-comments-error"}>{message.text}</p>
      ) : null}
      <button type="submit" className="post-comments-submit" disabled={submitting}>
        {submitting ? "Enviando…" : "Publicar comentário"}
      </button>
    </form>
  );
}

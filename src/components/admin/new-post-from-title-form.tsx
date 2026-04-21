"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewPostFromTitleForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = (await res.json()) as { id?: string; slug?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Falha ao criar post.");
        return;
      }
      if (data.id) {
        router.push(`/admin/posts/edit?id=${encodeURIComponent(data.id)}`);
        return;
      }
      setError("Resposta inesperada do servidor.");
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="new-post-form" onSubmit={onSubmit}>
      <label className="new-post-label">
        Título
        <input
          className="new-post-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          required
          placeholder="Ex.: Notas sobre arquitetura segura"
        />
      </label>
      {error ? <p className="new-post-error">{error}</p> : null}
      <button type="submit" className="admin-primary-link new-post-submit" disabled={loading}>
        {loading ? "Criando…" : "Criar e abrir editor"}
      </button>
    </form>
  );
}

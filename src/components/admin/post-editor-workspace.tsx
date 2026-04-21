"use client";

import { markdown as markdownLang } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import type { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useMemo, useRef, useState } from "react";

import { MarkdownPretextArticle } from "@/components/markdown-pretext-article";
import type { Post, PostStatus } from "@/features/posts/types";

export type EditorViewMode = "split" | "editor" | "preview";

type PostEditorWorkspaceProps = {
  postId: string;
  initialPost: Post;
};

export function PostEditorWorkspace({ postId, initialPost }: PostEditorWorkspaceProps) {
  const cmRef = useRef<EditorView | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState(initialPost.title);
  const [slug, setSlug] = useState(initialPost.slug);
  const [excerpt, setExcerpt] = useState(initialPost.excerpt);
  const [markdownContent, setMarkdownContent] = useState(initialPost.markdownContent);
  const [status, setStatus] = useState<PostStatus>(initialPost.status);
  const [coverImageUrl, setCoverImageUrl] = useState(initialPost.coverImageUrl ?? "");
  const [seoTitle, setSeoTitle] = useState(initialPost.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initialPost.seoDescription ?? "");
  const [regenerateSlugFromTitle, setRegenerateSlugFromTitle] = useState(false);

  const [mode, setMode] = useState<EditorViewMode>("split");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const extensions = useMemo(() => [markdownLang()], []);

  const insertAtCursor = useCallback((snippet: string) => {
    const view = cmRef.current;
    if (!view) {
      setMarkdownContent((prev) => `${prev}\n\n${snippet}\n`);
      return;
    }
    const pos = view.state.selection.main.head;
    view.dispatch({
      changes: { from: pos, insert: snippet },
      selection: { anchor: pos + snippet.length },
    });
    setMarkdownContent(view.state.doc.toString());
  }, []);

  const handlePickImage = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleImageFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setUploading(true);
      setSaveMessage(null);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = (await res.json()) as { url?: string; error?: string; hint?: string };
        if (!res.ok) {
          setSaveState("err");
          setSaveMessage(data.error ?? "Falha no upload.");
          return;
        }
        if (data.url) {
          insertAtCursor(`\n![](${data.url})\n`);
        }
      } catch {
        setSaveState("err");
        setSaveMessage("Erro de rede no upload.");
      } finally {
        setUploading(false);
      }
    },
    [insertAtCursor],
  );

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    setSaveMessage(null);
    const view = cmRef.current;
    const md = view ? view.state.doc.toString() : markdownContent;
    try {
      const res = await fetch(`/api/admin/posts/${encodeURIComponent(postId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          markdownContent: md,
          status,
          coverImageUrl: coverImageUrl.trim() === "" ? null : coverImageUrl.trim(),
          seoTitle: seoTitle.trim() === "" ? null : seoTitle.trim(),
          seoDescription: seoDescription.trim() === "" ? null : seoDescription.trim(),
          regenerateSlugFromTitle,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; slug?: string; error?: string };
      if (!res.ok) {
        setSaveState("err");
        setSaveMessage(data.error ?? "Não foi possível salvar.");
        return;
      }
      if (data.slug && data.slug !== slug) {
        setSlug(data.slug);
      }
      setSaveState("ok");
      setSaveMessage("Salvo com sucesso.");
      if (regenerateSlugFromTitle) {
        setRegenerateSlugFromTitle(false);
      }
      if (typeof window !== "undefined" && data.slug) {
        const u = new URL(window.location.href);
        u.searchParams.set("slug", data.slug);
        u.searchParams.delete("id");
        window.history.replaceState(null, "", u.toString());
      }
    } catch {
      setSaveState("err");
      setSaveMessage("Erro de rede.");
    }
  }, [
    postId,
    title,
    slug,
    excerpt,
    markdownContent,
    status,
    coverImageUrl,
    seoTitle,
    seoDescription,
    regenerateSlugFromTitle,
  ]);

  return (
    <div className={`editor-workspace editor-workspace--${mode}`}>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden onChange={handleImageFile} />

      <div className="editor-workspace-toolbar editor-workspace-toolbar--wrap">
        <div className="editor-workspace-toolbar-label">Editor</div>
        <div className="editor-meta-grid">
          <label className="editor-field">
            Título
            <input className="editor-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />
          </label>
          <label className="editor-field">
            Slug
            <input className="editor-input" value={slug} onChange={(e) => setSlug(e.target.value)} maxLength={200} />
          </label>
          <label className="editor-field editor-field--check">
            <input
              type="checkbox"
              checked={regenerateSlugFromTitle}
              onChange={(e) => setRegenerateSlugFromTitle(e.target.checked)}
            />
            Regenerar slug a partir do título ao salvar
          </label>
          <label className="editor-field">
            Status
            <select className="editor-input" value={status} onChange={(e) => setStatus(e.target.value as PostStatus)}>
              <option value="draft">Rascunho</option>
              <option value="scheduled">Agendado</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
          </label>
          <label className="editor-field editor-field--full">
            Resumo
            <textarea
              className="editor-textarea"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={320}
              rows={2}
            />
          </label>
          <label className="editor-field editor-field--full">
            URL da capa (opcional)
            <input className="editor-input" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
          </label>
          <label className="editor-field editor-field--full">
            SEO título (opcional)
            <input className="editor-input" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={160} />
          </label>
          <label className="editor-field editor-field--full">
            SEO descrição (opcional)
            <textarea
              className="editor-textarea"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              maxLength={320}
              rows={2}
            />
          </label>
        </div>

        <div className="editor-actions">
          <button type="button" className="editor-mode-btn" onClick={handlePickImage} disabled={uploading}>
            {uploading ? "Enviando imagem…" : "Inserir imagem no texto"}
          </button>
          <button
            type="button"
            className="home-search-button github-login-button"
            onClick={() => void handleSave()}
            disabled={saveState === "saving"}
          >
            {saveState === "saving" ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
        {saveMessage ? (
          <p className={saveState === "ok" ? "editor-save-ok" : saveState === "err" ? "editor-save-err" : "feed-state"}>
            {saveMessage}
          </p>
        ) : null}

        <div className="editor-workspace-toolbar-label">Visualização</div>
        <div className="editor-mode-toggle" role="group" aria-label="Modo de visualização do editor">
          <button
            type="button"
            className={`editor-mode-btn${mode === "editor" ? " is-active" : ""}`}
            onClick={() => setMode("editor")}
          >
            Texto
          </button>
          <button
            type="button"
            className={`editor-mode-btn${mode === "split" ? " is-active" : ""}`}
            onClick={() => setMode("split")}
          >
            Lado a lado
          </button>
          <button
            type="button"
            className={`editor-mode-btn${mode === "preview" ? " is-active" : ""}`}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="editor-workspace-panes">
        {(mode === "editor" || mode === "split") && (
          <section className="editor-pane editor-pane--source" aria-label="Markdown">
            <header className="editor-pane-header">Conteúdo</header>
            <div className="editor-cm-wrap">
              <CodeMirror
                value={markdownContent}
                height="100%"
                minHeight="420px"
                extensions={extensions}
                theme={oneDark}
                onChange={(value) => setMarkdownContent(value)}
                onCreateEditor={(view) => {
                  cmRef.current = view;
                }}
                className="editor-cm"
              />
            </div>
          </section>
        )}

        {(mode === "preview" || mode === "split") && (
          <section className="editor-pane editor-pane--preview" aria-label="Pré-visualização">
            <header className="editor-pane-header">Markdown · Pretext por bloco</header>
            <div className="editor-preview-scroll">
              <MarkdownPretextArticle markdown={markdownContent} variant="editor" />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

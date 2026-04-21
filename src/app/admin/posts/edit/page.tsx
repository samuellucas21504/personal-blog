import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PostEditorWorkspace } from "@/components/admin/post-editor-workspace";
import { getAdminPostById, getAdminPostBySlug } from "@/features/posts/mutations";

type EditPageProps = {
  searchParams: Promise<{ slug?: string; id?: string }>;
};

export default async function AdminPostEditPage({ searchParams }: EditPageProps) {
  const { slug, id } = await searchParams;

  if (!slug && !id) {
    redirect("/admin/posts/new");
  }

  const post = id ? await getAdminPostById(id) : slug ? await getAdminPostBySlug(slug) : null;
  if (!post) {
    notFound();
  }

  return (
    <div className="editor-shell">
      <aside className="editor-shell-aside">
        <p className="editor-shell-hint">
          Editando <strong>{post.title}</strong>
        </p>
        <p className="editor-shell-meta">
          Slug: <code>{post.slug}</code>
        </p>
        <Link href="/admin/posts" className="editor-shell-back">
          Voltar à listagem
        </Link>
      </aside>
      <PostEditorWorkspace postId={post.id} initialPost={post} />
    </div>
  );
}

import type { PublicComment } from "@/features/posts/mutations";

type PostCommentsListProps = {
  comments: PublicComment[];
};

export function PostCommentsList({ comments }: PostCommentsListProps) {
  if (comments.length === 0) {
    return <p className="post-comments-muted">Seja o primeiro a comentar.</p>;
  }

  return (
    <ul className="post-comments-list">
      {comments.map((c) => (
        <li key={c.id} className="post-comments-item">
          <div className="post-comments-meta">
            <strong>{c.displayName}</strong>
            <time dateTime={c.createdAt}>
              {new Date(c.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </time>
          </div>
          <p className="post-comments-body">{c.body}</p>
        </li>
      ))}
    </ul>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Post } from "@/features/posts/types";

type InfinitePostListProps = {
  initialPosts: Post[];
  initialHasMore: boolean;
  pageSize: number;
  query: string;
};

export function InfinitePostList({ initialPosts, initialHasMore, pageSize, query }: InfinitePostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const response = await fetch(`/api/posts?page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });
    const payload: { data: Post[]; hasMore: boolean } = await response.json();

    setPosts((current) => [...current, ...payload.data]);
    setHasMore(payload.hasMore);
    setPage((current) => current + 1);
    setLoading(false);
  }, [hasMore, loading, page, pageSize, query]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    const node = sentinelRef.current;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="post-list">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.slug}`} className="post-card-link">
            <article className="post-card">
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
            </article>
          </Link>
        ))}
      </div>
      <div ref={sentinelRef} className="scroll-sentinel" aria-hidden />
      {loading ? <div className="feed-loader" aria-label="Carregando mais posts" /> : null}
      {!hasMore ? <p className="feed-state">Escrito com amor por mim. Obrigado por ler até aqui ❤️</p> : null}
    </>
  );
}

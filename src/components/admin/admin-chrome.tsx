"use client";

import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";

export function AdminChrome({ children }: { children: ReactNode }) {
  return (
    <div className="admin-app">
      <header className="admin-chrome">
        <div className="admin-chrome-inner">
          <Link href="/admin" className="admin-chrome-brand">
            Painel
          </Link>
          <nav className="admin-chrome-nav" aria-label="Seções do admin">
            <Link href="/admin/posts">Posts</Link>
            <Link href="/admin/posts/new">Novo</Link>
            <Link href="/admin/posts/edit">Editor</Link>
            <Link href="/admin/comments">Comentários</Link>
          </nav>
          <div className="admin-chrome-spacer" />
          <form action="/auth/logout" method="post" className="admin-chrome-logout">
            <button type="submit" className="admin-chrome-logout-btn">
              Sair
            </button>
          </form>
        </div>
        <Suspense fallback={<div className="admin-breadcrumbs admin-breadcrumbs--loading" />}>
          <div className="admin-chrome-inner admin-chrome-breadcrumbs">
            <AdminBreadcrumbs />
          </div>
        </Suspense>
      </header>
      <div className="admin-body">{children}</div>
    </div>
  );
}

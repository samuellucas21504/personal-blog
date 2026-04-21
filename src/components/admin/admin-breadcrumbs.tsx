"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const LABELS: Record<string, string> = {
  admin: "Painel",
  posts: "Posts",
  edit: "Editar",
  new: "Novo",
  comments: "Comentários",
};

function segmentLabel(segment: string): string {
  return LABELS[segment] ?? segment.replace(/-/g, " ");
}

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    return { segment, href, isLast };
  });

  return (
    <nav className="admin-breadcrumbs" aria-label="Navegação do painel">
      <ol className="admin-breadcrumbs-list">
        {crumbs.map(({ segment, href, isLast }) => (
          <li key={href} className="admin-breadcrumbs-item">
            {isLast ? (
              <span className="admin-breadcrumbs-current" aria-current="page">
                {segmentLabel(segment)}
                {segment === "edit" && slug ? (
                  <span className="admin-breadcrumbs-meta"> ({slug})</span>
                ) : null}
              </span>
            ) : (
              <Link href={href} className="admin-breadcrumbs-link">
                {segmentLabel(segment)}
              </Link>
            )}
            {!isLast ? (
              <span className="admin-breadcrumbs-sep" aria-hidden>
                /
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

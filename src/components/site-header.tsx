import Link from "next/link";

export type SiteCrumb = { label: string; href?: string };

type SiteHeaderProps = {
  trail?: SiteCrumb[];
};

export function SiteHeader({ trail = [] }: SiteHeaderProps) {
  const crumbs = trail.filter((c) => c.label.trim().length > 0);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <nav className="site-nav" aria-label="Principal">
          <Link href="/" className="brand">
            Samuel Lucas
          </Link>
        </nav>
        {crumbs.length > 0 ? (
          <nav className="site-breadcrumbs" aria-label="Você está em">
            <ol className="site-breadcrumbs-list">
              <li className="site-breadcrumbs-item">
                <Link href="/" className="site-breadcrumbs-link">
                  Início
                </Link>
                <span className="site-breadcrumbs-sep" aria-hidden>
                  /
                </span>
              </li>
              {crumbs.map((c, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <li key={`${c.label}-${index}`} className="site-breadcrumbs-item">
                    {isLast || !c.href ? (
                      <span
                        className={isLast ? "site-breadcrumbs-current" : "site-breadcrumbs-muted"}
                        {...(isLast ? { "aria-current": "page" as const } : {})}
                      >
                        {c.label}
                      </span>
                    ) : (
                      <Link href={c.href} className="site-breadcrumbs-link">
                        {c.label}
                      </Link>
                    )}
                    {!isLast ? (
                      <span className="site-breadcrumbs-sep" aria-hidden>
                        /
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
      </div>
    </header>
  );
}

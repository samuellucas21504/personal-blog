/**
 * Canonical public origin (scheme + host, no path, no trailing slash).
 * Used for OAuth `redirectTo`, metadata, feeds, etc.
 */
export function getPublicSiteUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

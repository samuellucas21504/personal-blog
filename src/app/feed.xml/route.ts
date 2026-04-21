import { listPublishedPosts } from "@/features/posts/repository";
import { isDatabaseConfigured } from "@/lib/db/client";

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let posts: Awaited<ReturnType<typeof listPublishedPosts>> = [];
  if (isDatabaseConfigured()) {
    try {
      posts = await listPublishedPosts();
    } catch {
      posts = [];
    }
  }
  const items = posts
    .map(
      (post) =>
        `<item><title>${escapeXml(post.title)}</title><link>${escapeXml(`${siteUrl}/posts/${post.slug}`)}</link><description>${escapeXml(post.excerpt)}</description></item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>Modern Blog</title><link>${siteUrl}</link>${items}</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

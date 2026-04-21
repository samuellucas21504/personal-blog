import type { MetadataRoute } from "next";

import { listPublishedPosts } from "@/features/posts/repository";
import { isDatabaseConfigured } from "@/lib/db/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "hourly", priority: 1 },
  ];

  if (!isDatabaseConfigured()) {
    return staticEntries;
  }

  try {
    const posts = await listPublishedPosts();
    return [
      ...staticEntries,
      ...posts.map((post) => ({
        url: `${siteUrl}/posts/${post.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticEntries;
  }
}

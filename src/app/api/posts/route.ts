import { NextResponse } from "next/server";

import { listPublishedPostsPaginated } from "@/features/posts/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "6");
  const query = searchParams.get("q") ?? "";

  const posts = await listPublishedPostsPaginated(page, pageSize, query);
  return NextResponse.json(posts, {
    headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=300" },
  });
}

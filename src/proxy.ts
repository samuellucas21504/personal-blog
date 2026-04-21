import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getRateLimiter } from "@/lib/security/rate-limit";
import { updateSupabaseSession } from "@/lib/supabase/session-proxy";

export async function proxy(request: NextRequest) {
  const sessionResponse = await updateSupabaseSession(request);

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limiter = getRateLimiter();

  const path = request.nextUrl.pathname;
  const isCommentPost =
    request.method === "POST" && /^\/api\/posts\/[^/]+\/comments\/?$/.test(path);

  if (limiter && (path.startsWith("/login") || path.startsWith("/admin") || isCommentPost)) {
    const key = isCommentPost ? `comment:${ip}` : ip;
    const { success } = await limiter.limit(key);
    if (!success) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimization.
     * Needed so Supabase auth cookies refresh on navigation.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

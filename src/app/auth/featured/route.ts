import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { setFeaturedPost } from "@/features/posts/repository";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const formData = await request.formData();
  const postId = String(formData.get("postId") ?? "");
  const updated = await setFeaturedPost(postId);
  if (!updated) {
    return NextResponse.redirect(new URL("/admin?error=featured_not_found", request.url));
  }

  revalidatePath("/");
  return NextResponse.redirect(new URL("/admin?success=featured_updated", request.url));
}

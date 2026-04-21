import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/admin";
  const origin = requestUrl.origin;
  const oauthError = requestUrl.searchParams.get("error");
  const oauthErrorDescription = requestUrl.searchParams.get("error_description");

  if (oauthError) {
    const description = oauthErrorDescription
      ? `&error_description=${encodeURIComponent(oauthErrorDescription)}`
      : "";
    return NextResponse.redirect(`${origin}/login?error=${oauthError}${description}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_code_missing`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const description = encodeURIComponent(error.message);
    return NextResponse.redirect(
      `${origin}/login?error=oauth_exchange_failed&error_description=${description}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}

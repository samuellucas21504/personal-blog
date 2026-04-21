import { NextResponse } from "next/server";

/**
 * OAuth com PKCE deve ser iniciado no browser (ver `GitHubLoginButton` em `/login`).
 * Mantemos esta rota para links antigos redirecionarem para a pagina de login.
 */
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/admin";
  return NextResponse.redirect(`${origin}/login?next=${encodeURIComponent(next)}`);
}

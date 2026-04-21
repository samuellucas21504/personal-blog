"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type GitHubLoginButtonProps = {
  nextPath?: string;
};

function safeNextPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/admin";
}

export function GitHubLoginButton({ nextPath = "/admin" }: GitHubLoginButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const origin = window.location.origin;
    const next = safeNextPath(nextPath);
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
        // Garante leitura de perfil e e-mail (GitHub pode falhar no userinfo sem isso)
        scopes: "read:user user:email",
      },
    });

    if (error || !data.url) {
      setLoading(false);
      const description = encodeURIComponent(error?.message ?? "signInWithOAuth failed");
      window.location.href = `/login?error=oauth_start_failed&error_description=${description}`;
      return;
    }

    window.location.href = data.url;
  }

  return (
    <button
      type="button"
      className="home-search-button github-login-button"
      onClick={() => void handleClick()}
      disabled={loading}
    >
      {loading ? "Redirecionando..." : "Entrar com GitHub"}
    </button>
  );
}

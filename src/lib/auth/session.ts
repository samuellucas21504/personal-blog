import { redirect } from "next/navigation";

import type { Role } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
  githubLogin?: string | null;
};

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const adminEmails = parseList(process.env.ADMIN_EMAILS);
  const adminGithubLogins = parseList(process.env.ADMIN_GITHUB_LOGINS);
  const email = user.email?.toLowerCase() ?? "";
  const githubLogin =
    typeof user.user_metadata?.user_name === "string"
      ? user.user_metadata.user_name.toLowerCase()
      : null;

  const isAdmin = adminEmails.includes(email) || (!!githubLogin && adminGithubLogins.includes(githubLogin));

  return {
    id: user.id,
    email: user.email ?? "",
    role: isAdmin ? "admin" : "visitor",
    githubLogin,
  };
}

export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || !allowedRoles.includes(user.role)) {
    redirect("/login");
  }
  return user;
}

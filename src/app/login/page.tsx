import { GitHubLoginButton } from "@/components/github-login-button";
import { getPublicSiteUrl } from "@/lib/site-url";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; error_description?: string; next?: string }>;
};

function oauthCodeMissingMessage(): string {
  const site = getPublicSiteUrl();
  const example = site ? `${site}/auth/callback` : "https://seu-dominio.vercel.app/auth/callback";
  return `O retorno nao trouxe o codigo de autenticacao. No Supabase: Authentication > URL Configuration — defina Site URL para a URL publica do site e inclua em Redirect URLs: ${example} (e localhost em dev, se precisar).`;
}

const errorMessages: Record<string, string | (() => string)> = {
  oauth_github_disabled:
    "O GitHub nao esta habilitado neste projeto Supabase. No painel: Authentication > Providers > GitHub: ative o provedor e preencha Client ID e Client Secret do OAuth App.",
  oauth_start_failed: "Nao foi possivel iniciar o login com GitHub.",
  oauth_code_missing: oauthCodeMissingMessage,
  oauth_exchange_failed:
    "O Supabase nao conseguiu obter seu perfil no GitHub. Confira: Client Secret sem espacos extras; e-mail publico no GitHub ou acesso ao escopo user:email; logs em Supabase > Authentication > Logs.",
  oauth_access_denied: "Login cancelado no GitHub.",
  access_denied: "Login cancelado no GitHub.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, error_description: errorDescription, next: nextPath } = await searchParams;
  const rawMessage = error ? errorMessages[error] : null;
  const message =
    typeof rawMessage === "function" ? rawMessage() : rawMessage ? rawMessage : error ? "Falha ao autenticar." : null;

  return (
    <main className="container">
      <h1>Login</h1>
      <p>Entre com seu GitHub para acessar a area administrativa.</p>
      {message ? <p className="feed-state">{message}</p> : null}
      {errorDescription ? (
        <p className="feed-state" role="note">
          {decodeURIComponent(errorDescription)}
        </p>
      ) : null}
      <GitHubLoginButton
        nextPath={
          nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/admin"
        }
      />
    </main>
  );
}

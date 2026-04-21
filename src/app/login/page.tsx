import { GitHubLoginButton } from "@/components/github-login-button";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; error_description?: string; next?: string }>;
};

const errorMessages: Record<string, string> = {
  oauth_github_disabled:
    "O GitHub nao esta habilitado neste projeto Supabase. No painel: Authentication > Providers > GitHub: ative o provedor e preencha Client ID e Client Secret do OAuth App.",
  oauth_start_failed: "Nao foi possivel iniciar o login com GitHub.",
  oauth_code_missing:
    "O retorno nao trouxe o codigo de autenticacao. Confirme em Supabase > Authentication > URL Configuration que esta liberado: http://localhost:3000/auth/callback (e tente de novo pelo botao abaixo).",
  oauth_exchange_failed:
    "O Supabase nao conseguiu obter seu perfil no GitHub. Confira: Client Secret sem espacos extras; e-mail publico no GitHub ou acesso ao escopo user:email; logs em Supabase > Authentication > Logs.",
  oauth_access_denied: "Login cancelado no GitHub.",
  access_denied: "Login cancelado no GitHub.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, error_description: errorDescription, next: nextPath } = await searchParams;
  const message = error ? errorMessages[error] ?? "Falha ao autenticar." : null;

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

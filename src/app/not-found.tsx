import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container">
      <h1>404</h1>
      <p>O conteúdo que você tentou acessar não existe ou foi movido.</p>
      <Link href="/">Voltar para a home</Link>
    </main>
  );
}

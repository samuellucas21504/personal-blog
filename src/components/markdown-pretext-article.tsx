"use client";

import { MarkdownRenderer } from "@/components/markdown-renderer";

type MarkdownPretextArticleProps = {
  markdown: string;
  /** `public`: artigo no site; `editor`: prévia no painel */
  variant?: "public" | "editor";
};

/**
 * Markdown sanitizado com Pretext aplicado por bloco (parágrafos, títulos, listas),
 * preservando tipografia e filhos semânticos da interface.
 */
export function MarkdownPretextArticle({ markdown, variant = "public" }: MarkdownPretextArticleProps) {
  return (
    <div className={`md-pretext-stack md-pretext-stack--${variant}`}>
      <div className="md-pretext-markdown prose">
        <MarkdownRenderer content={markdown} pretextPerBlock />
      </div>
    </div>
  );
}

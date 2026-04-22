import type { EditorView } from "@codemirror/view";
import type { Dispatch, SetStateAction } from "react";

/** Alinhado a `React.Dispatch<React.SetStateAction<string>>` do editor. */
export type SetMarkdownContent = Dispatch<SetStateAction<string>>;

function pushDoc(view: EditorView, setMarkdown: SetMarkdownContent) {
  setMarkdown(view.state.doc.toString());
}

/** Envolve a seleção (ou insere par vazio e posiciona o cursor no meio). */
export function wrapSelection(
  view: EditorView | null,
  open: string,
  close: string,
  setMarkdown: SetMarkdownContent,
): void {
  if (!view) return;
  const { from, to } = view.state.selection.main;
  const doc = view.state.doc;
  if (from === to) {
    view.dispatch({
      changes: { from, insert: open + close },
      selection: { anchor: from + open.length },
    });
  } else {
    const text = doc.sliceString(from, to);
    view.dispatch({
      changes: { from, to, insert: open + text + close },
      selection: { anchor: from + open.length + text.length + close.length },
    });
  }
  pushDoc(view, setMarkdown);
}

export function insertAtCursor(
  view: EditorView | null,
  snippet: string,
  setMarkdown: SetMarkdownContent,
): void {
  if (!view) {
    setMarkdown((prev) => `${prev}\n\n${snippet}\n`);
    return;
  }
  const pos = view.state.selection.main.head;
  view.dispatch({
    changes: { from: pos, insert: snippet },
    selection: { anchor: pos + snippet.length },
  });
  pushDoc(view, setMarkdown);
}

/** Insere prefixo no início da linha atual (títulos, listas, citação). */
export function insertLinePrefix(
  view: EditorView | null,
  prefix: string,
  setMarkdown: SetMarkdownContent,
): void {
  if (!view) {
    setMarkdown((prev) => `${prev}\n${prefix}`);
    return;
  }
  const line = view.state.doc.lineAt(view.state.selection.main.head);
  view.dispatch({
    changes: { from: line.from, insert: prefix },
    selection: { anchor: line.from + prefix.length + (view.state.selection.main.head - line.from) },
  });
  pushDoc(view, setMarkdown);
}

/** Bloco de código (fenced) com o cursor na linha vazia dentro. */
export function insertCodeFence(view: EditorView | null, setMarkdown: SetMarkdownContent): void {
  const insert = "\n```\n\n```\n";
  if (!view) {
    setMarkdown((prev) => `${prev}${insert}`);
    return;
  }
  const pos = view.state.selection.main.head;
  const cursorInside = pos + 5;
  view.dispatch({
    changes: { from: pos, insert },
    selection: { anchor: cursorInside },
  });
  pushDoc(view, setMarkdown);
}

/** Insere `[](https://)` com o cursor entre `[` e `]` para preencher o texto do link. */
export function insertLinkTemplate(view: EditorView | null, setMarkdown: SetMarkdownContent): void {
  const ins = "[](https://)";
  if (!view) {
    setMarkdown((prev) => `${prev}\n${ins}\n`);
    return;
  }
  const pos = view.state.selection.main.head;
  view.dispatch({
    changes: { from: pos, insert: ins },
    selection: { anchor: pos + 1 },
  });
  pushDoc(view, setMarkdown);
}

export function insertHorizontalRule(view: EditorView | null, setMarkdown: SetMarkdownContent): void {
  insertAtCursor(view, "\n\n---\n\n", setMarkdown);
}

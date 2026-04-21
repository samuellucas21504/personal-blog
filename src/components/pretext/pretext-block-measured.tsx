"use client";

import { layoutWithLines, prepareWithSegments } from "@chenglou/pretext";
import {
  createElement,
  useEffect,
  useState,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export type PretextBlockTag = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "li" | "blockquote";

type PretextBlockMeasuredProps = {
  as: PretextBlockTag;
  plainText: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLElement>;

/**
 * Applies Pretext line layout metrics to the same DOM node that renders Markdown children,
 * preserving inline semantics (links, emphasis) and inherited prose styles.
 */
export function PretextBlockMeasured({ as, plainText, children, style, ...rest }: PretextBlockMeasuredProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [minHeight, setMinHeight] = useState<number | undefined>(undefined);

  const { ref: _omitRef, ...domRest } = rest as HTMLAttributes<HTMLElement> & { ref?: unknown };
  void _omitRef;

  useEffect(() => {
    if (!element) return;

    const layout = () => {
      const width = Math.max(32, Math.floor(element.getBoundingClientRect().width));
      const computed = getComputedStyle(element);
      const fontSize = computed.fontSize || "17px";
      const fontFamily = computed.fontFamily || "sans-serif";
      const fontWeight = computed.fontWeight || "400";
      const font = `${fontWeight} ${fontSize} ${fontFamily}`;
      const lineHeightPx =
        parseFloat(computed.lineHeight) || (parseFloat(fontSize) || 17) * 1.55;
      const text = plainText.trim().length ? plainText : "\u00a0";

      try {
        const prepared = prepareWithSegments(text, font, { whiteSpace: "normal" });
        const { lines } = layoutWithLines(prepared, width, lineHeightPx);
        setMinHeight(Math.max(lineHeightPx, lines.length * lineHeightPx));
      } catch {
        setMinHeight(undefined);
      }
    };

    layout();
    const observer = new ResizeObserver(() => layout());
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, plainText]);

  return createElement(
    as as ElementType,
    {
      ...domRest,
      ref: setElement,
      style: { ...style, minHeight },
    },
    children,
  );
}

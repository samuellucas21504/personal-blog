"use client";

import { toString } from "hast-util-to-string";
import type { ComponentPropsWithoutRef } from "react";
import type { Components, ExtraProps } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { PretextBlockMeasured } from "@/components/pretext/pretext-block-measured";

function pretextParagraph(props: ComponentPropsWithoutRef<"p"> & ExtraProps) {
  const { node, children, ...rest } = props;
  return (
    <PretextBlockMeasured as="p" plainText={node ? toString(node) : ""} {...rest}>
      {children}
    </PretextBlockMeasured>
  );
}

function PretextH1(props: ComponentPropsWithoutRef<"h1"> & ExtraProps) {
  const { node, children, ...rest } = props;
  return (
    <PretextBlockMeasured as="h1" plainText={node ? toString(node) : ""} {...rest}>
      {children}
    </PretextBlockMeasured>
  );
}

function PretextH2(props: ComponentPropsWithoutRef<"h2"> & ExtraProps) {
  const { node, children, ...rest } = props;
  return (
    <PretextBlockMeasured as="h2" plainText={node ? toString(node) : ""} {...rest}>
      {children}
    </PretextBlockMeasured>
  );
}

function PretextH3(props: ComponentPropsWithoutRef<"h3"> & ExtraProps) {
  const { node, children, ...rest } = props;
  return (
    <PretextBlockMeasured as="h3" plainText={node ? toString(node) : ""} {...rest}>
      {children}
    </PretextBlockMeasured>
  );
}

function PretextH4(props: ComponentPropsWithoutRef<"h4"> & ExtraProps) {
  const { node, children, ...rest } = props;
  return (
    <PretextBlockMeasured as="h4" plainText={node ? toString(node) : ""} {...rest}>
      {children}
    </PretextBlockMeasured>
  );
}

function PretextH5(props: ComponentPropsWithoutRef<"h5"> & ExtraProps) {
  const { node, children, ...rest } = props;
  return (
    <PretextBlockMeasured as="h5" plainText={node ? toString(node) : ""} {...rest}>
      {children}
    </PretextBlockMeasured>
  );
}

function PretextH6(props: ComponentPropsWithoutRef<"h6"> & ExtraProps) {
  const { node, children, ...rest } = props;
  return (
    <PretextBlockMeasured as="h6" plainText={node ? toString(node) : ""} {...rest}>
      {children}
    </PretextBlockMeasured>
  );
}

function pretextLi(props: ComponentPropsWithoutRef<"li"> & ExtraProps) {
  const { node, children, ...rest } = props;
  return (
    <PretextBlockMeasured as="li" plainText={node ? toString(node) : ""} {...rest}>
      {children}
    </PretextBlockMeasured>
  );
}

function pretextBlockquote(props: ComponentPropsWithoutRef<"blockquote"> & ExtraProps) {
  const { node, children, ...rest } = props;
  return (
    <PretextBlockMeasured as="blockquote" plainText={node ? toString(node) : ""} {...rest}>
      {children}
    </PretextBlockMeasured>
  );
}

const markdownBaseComponents: Partial<Components> = {
  img: (props) => (
    // Markdown permite URLs externas (ex.: Supabase Storage); `next/image` exigiria allowlist por host.
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} loading="lazy" decoding="async" alt={typeof props.alt === "string" ? props.alt : ""} />
  ),
};

const pretextComponents: Partial<Components> = {
  p: pretextParagraph,
  h1: PretextH1,
  h2: PretextH2,
  h3: PretextH3,
  h4: PretextH4,
  h5: PretextH5,
  h6: PretextH6,
  li: pretextLi,
  blockquote: pretextBlockquote,
};

type MarkdownRendererProps = {
  content: string;
  /** Pretext line layout per block; keeps Markdown children and prose styles. */
  pretextPerBlock?: boolean;
};

export function MarkdownRenderer({ content, pretextPerBlock = false }: MarkdownRendererProps) {
  const components = pretextPerBlock
    ? { ...markdownBaseComponents, ...pretextComponents }
    : markdownBaseComponents;

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} components={components}>
      {content}
    </ReactMarkdown>
  );
}

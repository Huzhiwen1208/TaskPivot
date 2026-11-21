import { isValidElement, useEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import xml from 'highlight.js/lib/languages/xml';
import { Check, Copy } from 'lucide-react';
import './reader.css';

const highlightOptions = {
  detect: false,
  languages: { javascript, typescript, css, bash, json, python, xml },
  plainText: ['text', 'txt', 'plain', 'plaintext'],
};

function textOf(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(children)) return textOf(children.props.children);
  return '';
}

export function slugHeading(text: string): string {
  return text.trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-');
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);
  const codeChild = isValidElement(children) ? children as ReactElement<{ className?: string }> : null;
  const language = codeChild?.props.className?.match(/language-([\w-]+)/)?.[1] ?? 'text';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(preRef.current?.textContent ?? '');
      setCopyState('copied');
    } catch { setCopyState('failed'); }
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState('idle'), 4000);
  };
  return <div className="reader-code-block"><div className="reader-code-toolbar"><span>{language}</span><button type="button" onClick={copy} aria-label="复制代码">{copyState === 'copied' ? <Check size={13} /> : <Copy size={13} />}{copyState === 'copied' ? '已复制' : '复制代码'}</button></div><pre ref={preRef} tabIndex={0}>{children}</pre><span className="reader-copy-status" role="status" aria-live="polite">{copyState === 'failed' ? '自动复制失败，请选中代码后手动复制。' : copyState === 'copied' ? '代码已复制。' : ''}</span></div>;
}

export default function MarkdownContent({ content }: { content: string }) {
  return <div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeHighlight, highlightOptions]]} skipHtml components={{
    pre: CodeBlock,
    h2: ({ children }) => <h2 id={slugHeading(textOf(children))}>{children}</h2>,
    h3: ({ children }) => <h3 id={slugHeading(textOf(children))}>{children}</h3>,
    a: ({ href, children, title }) => {
      const isExternal = Boolean(href && /^https?:\/\//i.test(href));
      return <a href={href} title={title} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} onClick={event => {
        if (href?.startsWith('#')) {
          event.preventDefault();
          try { document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView({ behavior: 'smooth' }); } catch { /* Ignore a malformed Markdown anchor. */ }
        }
      }}>{children}</a>;
    },
    table: ({ children }) => <div className="reader-table-scroll"><table>{children}</table></div>,
    img: ({ src, alt, title }) => <img src={src} alt={alt ?? ''} title={title} loading="lazy" decoding="async" />,
  }}>{content}</ReactMarkdown></div>;
}


import React from 'react';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Code block with syntax highlighting via <pre><code>
// ---------------------------------------------------------------------------
function MdxCode({
  children,
  className,
  ...props
}: React.ComponentProps<'code'>) {
  // Inline code (no className) vs fenced code block (has language-* className)
  const isBlock = !!className;
  if (!isBlock) {
    return (
      <code
        className='rounded bg-[#1a1a1a] px-1.5 py-0.5 font-mono text-sm text-[#a7f950]'
        {...props}
      >
        {children}
      </code>
    );
  }
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

function MdxPre({ children, ...props }: React.ComponentProps<'pre'>) {
  return (
    <pre
      className='my-6 overflow-x-auto rounded-lg border border-[#2b2b2b] bg-[#111827] p-4 text-sm leading-relaxed'
      {...props}
    >
      {children}
    </pre>
  );
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------
function MdxTable({ children, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className='my-6 w-full overflow-x-auto rounded-lg border border-[#2b2b2b]'>
      <table
        className='w-full border-collapse text-sm text-[#d1d5db]'
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

function MdxThead({ children, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead className='bg-[#1a1a1a] text-[#ffffff]' {...props}>
      {children}
    </thead>
  );
}

function MdxTh({ children, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className='border-b border-[#2b2b2b] px-4 py-3 text-left font-semibold'
      {...props}
    >
      {children}
    </th>
  );
}

function MdxTd({ children, ...props }: React.ComponentProps<'td'>) {
  return (
    <td className='border-b border-[#2b2b2b] px-4 py-3' {...props}>
      {children}
    </td>
  );
}

function MdxTr({ children, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr className='transition-colors hover:bg-[#1a1a1a]/50' {...props}>
      {children}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Mermaid diagram — renders the raw text inside a styled container.
// Full client-side rendering would require a 'use client' wrapper + mermaid.js;
// for now we render a readable fallback with the diagram source.
// ---------------------------------------------------------------------------
function Mermaid({ children }: { children?: React.ReactNode }) {
  return (
    <div className='my-6 rounded-lg border border-[#2b2b2b] bg-[#111827] p-4'>
      <p className='mb-2 text-xs font-semibold tracking-wider text-[#6b7280] uppercase'>
        Diagram
      </p>
      <pre className='font-mono text-sm whitespace-pre-wrap text-[#d1d5db]'>
        {children}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported component map — passed to compileMDX
// ---------------------------------------------------------------------------
export const mdxComponents = {
  // HTML element overrides
  pre: MdxPre,
  code: MdxCode,
  table: MdxTable,
  thead: MdxThead,
  th: MdxTh,
  td: MdxTd,
  tr: MdxTr,
  // Named components usable inside .mdx files as <Badge> / <Mermaid>
  Badge,
  Mermaid,
};

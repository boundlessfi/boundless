import { useState, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import React from 'react';

interface UseMarkdownOptions {
  breaks?: boolean;
  gfm?: boolean;
  pedantic?: boolean;
  loadingDelay?: number;
}

interface UseMarkdownReturn {
  content: string;
  loading: boolean;
  error: string | null;
  styledContent: React.ReactElement;
}

export function useMarkdown(
  markdownText: string,
  options: UseMarkdownOptions = {}
): UseMarkdownReturn {
  const {
    breaks = true,
    gfm = true,
    pedantic = false,
    loadingDelay = 100,
  } = options;

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(!!markdownText);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parseMarkdown = async () => {
      try {
        setLoading(true);
        setError(null);

        const normalizedMarkdown = markdownText
          .replace(/\\n/g, '\n')
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .trim();

        marked.setOptions({
          breaks,
          gfm: true,
          pedantic: false,
        });

        const parsedContent = await marked.parse(normalizedMarkdown);

        if (loadingDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, loadingDelay));
        }

        setContent(parsedContent);
        setLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to parse markdown content';
        setError(errorMessage);
        setContent(markdownText);
        setLoading(false);
      }
    };

    if (markdownText) {
      parseMarkdown();
    } else {
      setContent('');
      setLoading(false);
      setError(null);
    }
  }, [markdownText, breaks, gfm, pedantic, loadingDelay]);

  const styledContent = useMemo(
    () =>
      React.createElement(
        React.Fragment,
        null,
        React.createElement('style', {
          dangerouslySetInnerHTML: {
            __html: `
          .markdown-content {
            color: #D1D5DB;
            line-height: 1.75;
            font-size: 0.9375rem;
            white-space: normal;
            word-wrap: break-word;
            max-width: 100%;
          }
          
          /* Preserve whitespace in code blocks */
          .markdown-content pre {
            white-space: pre;
            overflow-x: auto;
          }
          
          .markdown-content pre code {
            white-space: pre;
          }
          
          /* Ensure tables are properly formatted */
          .markdown-content table {
            white-space: normal;
            word-wrap: break-word;
          }
          
          /* Headings */
          .markdown-content h1 {
            color: #FFFFFF;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            margin-top: 2rem;
            line-height: 1.25;
            letter-spacing: -0.025em;
          }
          
          .markdown-content h1:first-child {
            margin-top: 0;
          }
          
          .markdown-content h2 {
            color: #FFFFFF;
            font-size: 1.625rem;
            font-weight: 600;
            margin-bottom: 1rem;
            margin-top: 1.75rem;
            line-height: 1.3;
            letter-spacing: -0.02em;
          }
          
          .markdown-content h3 {
            color: #FFFFFF;
            font-size: 1.375rem;
            font-weight: 600;
            margin-bottom: 0.875rem;
            margin-top: 1.5rem;
            line-height: 1.4;
            letter-spacing: -0.015em;
          }
          
          .markdown-content h4 {
            color: #F3F4F6;
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            margin-top: 1.25rem;
            line-height: 1.45;
          }
          
          .markdown-content h5 {
            color: #F3F4F6;
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.625rem;
            margin-top: 1rem;
            line-height: 1.5;
          }
          
          .markdown-content h6 {
            color: #F3F4F6;
            font-size: 0.9375rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            margin-top: 0.875rem;
            line-height: 1.5;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          /* Paragraphs */
          .markdown-content p {
            color: #D1D5DB;
            margin-bottom: 1.25rem;
            line-height: 1.75;
            font-size: 0.9375rem;
          }
          
          .markdown-content p:last-child {
            margin-bottom: 0;
          }
          
          /* Strong and Bold */
          .markdown-content strong,
          .markdown-content b {
            color: #FFFFFF;
            font-weight: 600;
          }
          
          /* Emphasis and Italic */
          .markdown-content em,
          .markdown-content i {
            color: #E5E7EB;
            font-style: italic;
          }
          
          /* Strikethrough */
          .markdown-content del,
          .markdown-content s {
            color: #9CA3AF;
            text-decoration: line-through;
          }
          
          /* Links */
          .markdown-content a {
            color: #A7F950;
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: all 0.2s ease;
            font-weight: 500;
          }
          
          .markdown-content a:hover {
            color: #7ED321;
            border-bottom-color: #A7F950;
          }
          
          .markdown-content a:focus {
            outline: 2px solid #A7F950;
            outline-offset: 2px;
            border-radius: 2px;
          }
          
          /* Lists */
          .markdown-content ul,
          .markdown-content ol {
            margin-bottom: 1.25rem;
            padding-left: 1.75rem;
          }
          
          .markdown-content li {
            color: #D1D5DB;
            margin-bottom: 0.625rem;
            line-height: 1.7;
            font-size: 0.9375rem;
          }
          
          .markdown-content li:last-child {
            margin-bottom: 0;
          }
          
          .markdown-content ul li {
            list-style-type: disc;
          }
          
          .markdown-content ol li {
            list-style-type: decimal;
          }
          
          .markdown-content ul ul li {
            list-style-type: circle;
          }
          
          .markdown-content ul ul ul li {
            list-style-type: square;
          }
          
          /* Nested Lists */
          .markdown-content ul ul,
          .markdown-content ol ol,
          .markdown-content ul ol,
          .markdown-content ol ul {
            margin-top: 0.625rem;
            margin-bottom: 0.625rem;
          }
          
          /* List items with paragraphs */
          .markdown-content li > p {
            margin-bottom: 0.625rem;
          }
          
          .markdown-content li > p:last-child {
            margin-bottom: 0;
          }
          
          /* Blockquotes */
          .markdown-content blockquote {
            border-left: 4px solid #A7F950;
            padding: 1rem 1.25rem;
            margin: 1.5rem 0;
            font-style: italic;
            color: #D1D5DB;
            background: rgba(167, 249, 80, 0.05);
            border-radius: 0.375rem;
          }
          
          .markdown-content blockquote p {
            margin-bottom: 0.75rem;
            color: #D1D5DB;
          }
          
          .markdown-content blockquote p:last-child {
            margin-bottom: 0;
          }
          
          .markdown-content blockquote > :first-child {
            margin-top: 0;
          }
          
          .markdown-content blockquote cite {
            color: #9CA3AF;
            font-size: 0.875rem;
            font-style: normal;
            display: block;
            margin-top: 0.5rem;
          }
          
          /* Inline Code */
          .markdown-content code {
            background: #1F2937;
            color: #A7F950;
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            font-family: 'Monaco', 'Menlo', 'Consolas', 'Ubuntu Mono', monospace;
            border: 1px solid #374151;
            font-weight: 500;
          }
          
          .markdown-content a code {
            color: #7ED321;
          }
          
          /* Code Blocks */
          .markdown-content pre {
            background: #111827;
            border: 1px solid #1F2937;
            border-radius: 0.5rem;
            padding: 1.25rem;
            margin: 1.5rem 0;
            overflow-x: auto;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
          }
          
          .markdown-content pre code {
            background: transparent;
            color: #E5E7EB;
            padding: 0;
            border-radius: 0;
            font-size: 0.875rem;
            line-height: 1.7;
            border: none;
            font-weight: 400;
          }
          
          /* Tables */
          .markdown-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.75rem 0;
            background: #111827;
            border: 1px solid #1F2937;
            border-radius: 0.5rem;
            overflow: hidden;
            display: table;
            font-size: 0.875rem;
          }
          
          .markdown-content thead {
            background: #1F2937;
          }
          
          .markdown-content th {
            background: #1F2937;
            color: #FFFFFF;
            padding: 0.875rem 1rem;
            text-align: left;
            font-weight: 600;
            font-size: 0.875rem;
            border-bottom: 2px solid #374151;
            border-right: 1px solid #374151;
            line-height: 1.5;
          }
          
          .markdown-content th:last-child {
            border-right: none;
          }
          
          .markdown-content tbody {
            background: #111827;
          }
          
          .markdown-content td {
            color: #D1D5DB;
            padding: 0.875rem 1rem;
            border-top: 1px solid #1F2937;
            border-right: 1px solid #1F2937;
            font-size: 0.875rem;
            line-height: 1.6;
            vertical-align: top;
          }
          
          .markdown-content td:last-child {
            border-right: none;
          }
          
          .markdown-content tbody tr:nth-child(even) {
            background: rgba(31, 41, 55, 0.4);
          }
          
          .markdown-content tbody tr:hover {
            background: rgba(31, 41, 55, 0.6);
            transition: background 0.15s ease;
          }
          
          .markdown-content td code {
            font-size: 0.8125rem;
          }
          
          /* Horizontal Rules */
          .markdown-content hr {
            border: none;
            height: 1px;
            background: linear-gradient(to right, transparent, #374151, transparent);
            margin: 2.5rem 0;
          }
          
          /* Images */
          .markdown-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 1.75rem 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
            border: 1px solid #1F2937;
          }
          
          /* Keyboard Keys */
          .markdown-content kbd {
            background: #1F2937;
            color: #FFFFFF;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.8125rem;
            font-family: 'Monaco', 'Menlo', 'Consolas', 'Ubuntu Mono', monospace;
            border: 1px solid #374151;
            box-shadow: 0 2px 0 #111827, 0 3px 0 #000000;
            font-weight: 500;
          }
          
          /* Mark/Highlight */
          .markdown-content mark {
            background: rgba(167, 249, 80, 0.25);
            color: #FFFFFF;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
          }
          
          /* Small Text */
          .markdown-content small {
            color: #9CA3AF;
            font-size: 0.8125rem;
          }
          
          /* Subscript and Superscript */
          .markdown-content sub,
          .markdown-content sup {
            font-size: 0.75rem;
            color: #9CA3AF;
            line-height: 0;
          }
          
          /* Abbreviations */
          .markdown-content abbr[title] {
            text-decoration: underline dotted;
            cursor: help;
            color: #E5E7EB;
          }
          
          /* Definition Lists */
          .markdown-content dl {
            margin: 1.25rem 0;
          }
          
          .markdown-content dt {
            color: #FFFFFF;
            font-weight: 600;
            margin-top: 1rem;
            font-size: 0.9375rem;
          }
          
          .markdown-content dd {
            color: #D1D5DB;
            margin-left: 1.5rem;
            margin-bottom: 0.625rem;
            line-height: 1.7;
          }
          
          /* Task Lists */
          .markdown-content input[type="checkbox"] {
            margin-right: 0.5rem;
            accent-color: #A7F950;
            cursor: pointer;
            width: 1rem;
            height: 1rem;
          }
          
          .markdown-content li input[type="checkbox"] {
            margin-left: -1.75rem;
          }
          
          /* Details/Summary */
          .markdown-content details {
            background: #111827;
            border: 1px solid #1F2937;
            border-radius: 0.375rem;
            padding: 1rem;
            margin: 1.25rem 0;
          }
          
          .markdown-content summary {
            color: #FFFFFF;
            font-weight: 600;
            cursor: pointer;
            user-select: none;
          }
          
          .markdown-content summary:hover {
            color: #A7F950;
          }
          
          .markdown-content details[open] summary {
            margin-bottom: 0.75rem;
          }
          
          /* Figure and Figcaption */
          .markdown-content figure {
            margin: 1.75rem 0;
          }
          
          .markdown-content figcaption {
            color: #9CA3AF;
            font-size: 0.875rem;
            text-align: center;
            margin-top: 0.5rem;
            font-style: italic;
          }
          
          /* Footnotes */
          .markdown-content .footnote-ref {
            color: #A7F950;
            font-size: 0.75rem;
            vertical-align: super;
          }
          
          .markdown-content .footnotes {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #374151;
            font-size: 0.875rem;
          }
          
          /* Responsive Design */
          @media (max-width: 768px) {
            .markdown-content {
              font-size: 0.875rem;
            }
            
            .markdown-content h1 {
              font-size: 1.625rem;
            }
            
            .markdown-content h2 {
              font-size: 1.375rem;
            }
            
            .markdown-content h3 {
              font-size: 1.125rem;
            }
            
            .markdown-content h4 {
              font-size: 1rem;
            }
            
            .markdown-content h5 {
              font-size: 0.9375rem;
            }
            
            .markdown-content h6 {
              font-size: 0.875rem;
            }
            
            .markdown-content p,
            .markdown-content li {
              font-size: 0.875rem;
            }
            
            .markdown-content pre {
              padding: 0.875rem;
              font-size: 0.8125rem;
            }
            
            .markdown-content table {
              font-size: 0.8125rem;
              display: block;
              overflow-x: auto;
            }
            
            .markdown-content th,
            .markdown-content td {
              padding: 0.625rem 0.75rem;
              font-size: 0.8125rem;
            }
            
            .markdown-content blockquote {
              padding: 0.875rem 1rem;
            }
            
            .markdown-content ul,
            .markdown-content ol {
              padding-left: 1.5rem;
            }
          }
          
          /* Print Styles */
          @media print {
            .markdown-content {
              color: #000000;
            }
            
            .markdown-content h1,
            .markdown-content h2,
            .markdown-content h3,
            .markdown-content h4,
            .markdown-content h5,
            .markdown-content h6 {
              color: #000000;
              page-break-after: avoid;
            }
            
            .markdown-content pre,
            .markdown-content blockquote,
            .markdown-content table {
              page-break-inside: avoid;
            }
            
            .markdown-content a {
              color: #000000;
              text-decoration: underline;
            }
          }
        `,
          },
        }),
        React.createElement('div', {
          className: 'markdown-content',
          dangerouslySetInnerHTML: { __html: content },
        })
      ),
    [content]
  );

  return { content, loading, error, styledContent };
}

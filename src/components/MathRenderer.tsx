'use client';

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

export default function MathRenderer({ content, className = '' }: MathRendererProps) {
  if (!content) return null;

  // Split content by $$ (display math) and $ (inline math)
  const parts: React.ReactNode[] = [];
  const displayRegex = /\$\$([\s\S]+?)\$\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // First pass: extract block math $$...$$
  const textBlocks: { type: 'text' | 'displayMath'; value: string }[] = [];
  while ((match = displayRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      textBlocks.push({ type: 'text', value: content.substring(lastIndex, match.index) });
    }
    textBlocks.push({ type: 'displayMath', value: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    textBlocks.push({ type: 'text', value: content.substring(lastIndex) });
  }

  // Second pass: inside text blocks, parse inline math $...$
  return (
    <div className={`leading-relaxed space-y-2 ${className}`}>
      {textBlocks.map((block, bIdx) => {
        if (block.type === 'displayMath') {
          try {
            const html = katex.renderToString(block.value.trim(), {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <div
                key={bIdx}
                className="my-3 overflow-x-auto py-2 px-3 bg-slate-900/60 rounded-lg border border-slate-800 text-center"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch (e) {
            return <div key={bIdx} className="font-mono text-amber-400">{block.value}</div>;
          }
        }

        // Parse inline math $...$
        const inlineRegex = /\$([^\$\n]+?)\$/g;
        const inlineParts: React.ReactNode[] = [];
        let inlineLastIndex = 0;
        let inlineMatch: RegExpExecArray | null;

        while ((inlineMatch = inlineRegex.exec(block.value)) !== null) {
          if (inlineMatch.index > inlineLastIndex) {
            inlineParts.push(block.value.substring(inlineLastIndex, inlineMatch.index));
          }
          try {
            const html = katex.renderToString(inlineMatch[1].trim(), {
              displayMode: false,
              throwOnError: false,
            });
            inlineParts.push(
              <span
                key={`${bIdx}-${inlineMatch.index}`}
                className="inline-block px-1"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch (e) {
            inlineParts.push(inlineMatch[1]);
          }
          inlineLastIndex = inlineMatch.index + inlineMatch[0].length;
        }

        if (inlineLastIndex < block.value.length) {
          inlineParts.push(block.value.substring(inlineLastIndex));
        }

        return <span key={bIdx}>{inlineParts}</span>;
      })}
    </div>
  );
}

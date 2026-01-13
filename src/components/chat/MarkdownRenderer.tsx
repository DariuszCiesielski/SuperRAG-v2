
import React from 'react';
import { MessageSegment, Citation } from '@/types/message';
import CitationButton from './CitationButton';

interface MarkdownRendererProps {
  content: string | { segments: MessageSegment[]; citations: Citation[] };
  className?: string;
  onCitationClick?: (citation: Citation) => void;
  isUserMessage?: boolean;
}

const MarkdownRenderer = ({ content, className = '', onCitationClick, isUserMessage = false }: MarkdownRendererProps) => {
  // Handle enhanced content with citations
  if (typeof content === 'object' && 'segments' in content) {
    return (
      <div className={className}>
        {processMarkdownWithCitations(content.segments, content.citations, onCitationClick, isUserMessage)}
      </div>
    );
  }

  // For legacy string content, convert to simple format
  const segments: MessageSegment[] = [{ text: typeof content === 'string' ? content : '' }];
  const citations: Citation[] = [];

  return (
    <div className={className}>
      {processMarkdownWithCitations(segments, citations, onCitationClick, isUserMessage)}
    </div>
  );
};

// Function to process markdown with citations inline
const processMarkdownWithCitations = (
  segments: MessageSegment[],
  citations: Citation[],
  onCitationClick?: (citation: Citation) => void,
  isUserMessage: boolean = false
) => {
  // For user messages, render as inline content without paragraph breaks
  if (isUserMessage) {
    return (
      <span>
        {segments.map((segment, index) => (
          <span key={index}>
            {processInlineMarkdown(segment.text)}
            {segment.citation_id && onCitationClick && (
              <CitationButton
                chunkIndex={(() => {
                  const citation = citations.find(c => c.citation_id === segment.citation_id);
                  return citation?.chunk_index || 0;
                })()}
                onClick={() => {
                  const citation = citations.find(c => c.citation_id === segment.citation_id);
                  if (citation) {
                    onCitationClick(citation);
                  }
                }}
              />
            )}
          </span>
        ))}
      </span>
    );
  }

  // For AI messages, combine all segments and process as rich markdown
  const fullText = segments.map(s => s.text).join('');
  const allCitations = segments
    .filter(s => s.citation_id)
    .map(s => {
      const citation = citations.find(c => c.citation_id === s.citation_id);
      return { segmentText: s.text, citation };
    });

  return processRichMarkdown(fullText, allCitations, onCitationClick);
};

// Process rich markdown with support for headers, lists, bold, italic, etc.
const processRichMarkdown = (
  text: string,
  citationMappings: { segmentText: string; citation: Citation | undefined }[],
  onCitationClick?: (citation: Citation) => void
) => {
  const elements: JSX.Element[] = [];

  // Safety check for null/undefined text
  if (!text || typeof text !== 'string') {
    return <p className="mb-4 leading-relaxed text-gray-700"></p>;
  }

  // Pre-process: convert inline lists to proper format
  // Clean up any empty brackets that might be citation placeholders
  let processedText = text.replace(/\[\]\s*/g, ' ');
  // Clean up [.] placeholders
  processedText = processedText.replace(/\[\.\]\s*/g, ' ');

  // === NUMBERED LISTS ===
  // Detect inline numbered lists like "1) text 2) text" or "1. text 2. text"
  const numberedItemsMatch = processedText.match(/\d+[\.\)]\s+/g);
  const hasInlineNumberedList = numberedItemsMatch && numberedItemsMatch.length >= 2;

  if (hasInlineNumberedList) {
    // Add newline before numbered items 2, 3, 4, etc. (not before 1)
    // This catches any number >= 2 followed by ) or . that appears after some text
    processedText = processedText.replace(/(\S)\s+(\d+[\.\)])\s+/g, (match, before, num) => {
      const numValue = parseInt(num);
      // Only add newline for numbers 2 and above (list continuations)
      if (numValue >= 2) {
        return before + '\n' + num + ' ';
      }
      return match;
    });

    // Find where "1)" or "1." appears and add double newline before it (to separate from intro)
    processedText = processedText.replace(/(\S[^\n]*?)\s+(1[\.\)])\s+/m, '$1\n\n$2 ');
  }

  // === BULLET LISTS ===
  // Detect inline bullet lists with • or - markers
  // Pattern: "text: • item1, • item2" or "text: - item1 - item2"
  const bulletMatches = processedText.match(/[•\-]\s*[^•\-]+/g);
  const hasInlineBulletList = bulletMatches && bulletMatches.length >= 2;

  if (hasInlineBulletList) {
    // Add newline before each bullet point
    processedText = processedText.replace(/([,:.])\s*([•\-])\s+/g, '$1\n$2 ');
    processedText = processedText.replace(/,\s*([•\-])\s+/g, '\n$1 ');

    // Separate intro text from bullet list
    processedText = processedText.replace(/^([^\n]*?)(\n)([•\-])/m, '$1\n\n$3');
  }

  // Clean up excessive spaces (but preserve newlines)
  processedText = processedText.replace(/[ \t]{2,}/g, ' ');

  // Split by double newlines first to get blocks
  const blocks = processedText.split(/\n\n+/);

  blocks.forEach((block, blockIndex) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return;

    // Check for headers
    const headerMatch = trimmedBlock.match(/^(#{1,6})\s+(.+)$/m);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;
      const headerClasses: { [key: number]: string } = {
        1: 'text-xl font-bold mt-6 mb-3 text-gray-900',
        2: 'text-lg font-bold mt-5 mb-2 text-gray-900',
        3: 'text-base font-semibold mt-4 mb-2 text-gray-800',
        4: 'text-sm font-semibold mt-3 mb-1 text-gray-800',
        5: 'text-sm font-medium mt-2 mb-1 text-gray-700',
        6: 'text-xs font-medium mt-2 mb-1 text-gray-700',
      };
      elements.push(
        <HeaderTag key={blockIndex} className={headerClasses[level]}>
          {processInlineFormatting(headerText)}
        </HeaderTag>
      );
      return;
    }

    // Check for unordered list (lines starting with -, *, or •)
    const unorderedListMatch = trimmedBlock.match(/^[\-\*•]\s*/m);
    if (unorderedListMatch) {
      const listItems = trimmedBlock.split('\n').filter(line => line.trim() && line.match(/^[\-\*•]/));
      elements.push(
        <ul key={blockIndex} className="list-disc list-outside ml-5 mb-4 space-y-1.5">
          {listItems.map((item, itemIndex) => {
            const itemText = item.replace(/^[\-\*•]\s*/, '').trim();
            return (
              <li key={itemIndex} className="text-gray-700 leading-relaxed pl-1">
                {processInlineFormatting(itemText)}
              </li>
            );
          })}
        </ul>
      );
      return;
    }

    // Check for ordered list (lines starting with number. or number))
    const orderedListMatch = trimmedBlock.match(/^\d+[\.\)]\s+/m);
    if (orderedListMatch) {
      const listItems = trimmedBlock.split('\n').filter(line => line.trim() && line.match(/^\d+[\.\)]/));
      if (listItems.length > 0) {
        elements.push(
          <ol key={blockIndex} className="list-decimal list-outside ml-5 mb-4 space-y-2">
            {listItems.map((item, itemIndex) => {
              const itemText = item.replace(/^\d+[\.\)]\s*/, '').trim();
              return (
                <li key={itemIndex} className="text-gray-700 leading-relaxed pl-1">
                  {processInlineFormatting(itemText)}
                </li>
              );
            })}
          </ol>
        );
        return;
      }
    }

    // Check for blockquote
    if (trimmedBlock.startsWith('>')) {
      const quoteText = trimmedBlock.replace(/^>\s*/gm, '').trim();
      elements.push(
        <blockquote key={blockIndex} className="border-l-4 border-gray-300 pl-4 py-2 mb-4 italic text-gray-600 bg-gray-50 rounded-r">
          {processInlineFormatting(quoteText)}
        </blockquote>
      );
      return;
    }

    // Check for code block
    if (trimmedBlock.startsWith('```')) {
      const codeMatch = trimmedBlock.match(/^```(\w*)\n?([\s\S]*?)```$/);
      if (codeMatch) {
        const code = codeMatch[2].trim();
        elements.push(
          <pre key={blockIndex} className="bg-gray-100 rounded-lg p-4 mb-4 overflow-x-auto">
            <code className="text-sm font-mono text-gray-800">{code}</code>
          </pre>
        );
        return;
      }
    }

    // Regular paragraph - process with inline formatting and line breaks
    const lines = trimmedBlock.split('\n');
    const paragraphContent = lines.map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {processInlineFormatting(line)}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    ));

    // Find and add citations for this block
    const blockCitations = citationMappings.filter(cm =>
      cm.citation && trimmedBlock.includes(cm.segmentText.substring(0, 50))
    );

    elements.push(
      <p key={blockIndex} className="mb-4 leading-relaxed text-gray-700">
        {paragraphContent}
        {blockCitations.map((cm, idx) => cm.citation && onCitationClick && (
          <CitationButton
            key={idx}
            chunkIndex={cm.citation.chunk_index || 0}
            onClick={() => onCitationClick(cm.citation!)}
          />
        ))}
      </p>
    );
  });

  // If no elements were created, return the text as a simple paragraph
  if (elements.length === 0) {
    return <p className="mb-4 leading-relaxed text-gray-700">{processInlineFormatting(text)}</p>;
  }

  return elements;
};

// Process inline formatting: bold, italic, inline code, links
const processInlineFormatting = (text: string): React.ReactNode => {
  // Safety check
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Pattern for all inline formatting
  const pattern = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|__.*?__|_.*?_|`[^`]+`|\[.*?\]\(.*?\))/g;

  const parts = text.split(pattern);

  return parts.map((part, index) => {
    // Bold + Italic (***text***)
    if (part.match(/^\*\*\*(.*)\*\*\*$/)) {
      const content = part.replace(/^\*\*\*(.*)\*\*\*$/, '$1');
      return <strong key={index}><em>{content}</em></strong>;
    }
    // Bold (**text** or __text__)
    if (part.match(/^\*\*(.*)\*\*$/)) {
      const content = part.replace(/^\*\*(.*)\*\*$/, '$1');
      return <strong key={index} className="font-semibold text-gray-900">{content}</strong>;
    }
    if (part.match(/^__(.*?)__$/)) {
      const content = part.replace(/^__(.*?)__$/, '$1');
      return <strong key={index} className="font-semibold text-gray-900">{content}</strong>;
    }
    // Italic (*text* or _text_)
    if (part.match(/^\*(.*)\*$/) && !part.match(/^\*\*/)) {
      const content = part.replace(/^\*(.*)\*$/, '$1');
      return <em key={index} className="italic">{content}</em>;
    }
    if (part.match(/^_(.*?)_$/) && !part.match(/^__/)) {
      const content = part.replace(/^_(.*?)_$/, '$1');
      return <em key={index} className="italic">{content}</em>;
    }
    // Inline code (`code`)
    if (part.match(/^`([^`]+)`$/)) {
      const content = part.replace(/^`([^`]+)`$/, '$1');
      return <code key={index} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600">{content}</code>;
    }
    // Link ([text](url))
    if (part.match(/^\[(.*?)\]\((.*?)\)$/)) {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match) {
        return (
          <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {match[1]}
          </a>
        );
      }
    }
    // Regular text
    return part;
  });
};

// Function to process markdown inline without creating paragraph breaks (for user messages)
const processInlineMarkdown = (text: string) => {
  return processInlineFormatting(text.replace(/\n/g, ' '));
};

export default MarkdownRenderer;

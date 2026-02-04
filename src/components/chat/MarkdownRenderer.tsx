
import React from 'react';
import { MessageSegment, Citation } from '@/types/message';
import CitationButton from './CitationButton';

interface MarkdownRendererProps {
  content: string | { segments: MessageSegment[]; citations: Citation[] };
  className?: string;
  onCitationClick?: (citation: Citation) => void;
  isUserMessage?: boolean;
}

// Component to display list of sources at the end of AI response
const CitationsList = ({
  citations,
  onCitationClick
}: {
  citations: Citation[];
  onCitationClick?: (citation: Citation) => void;
}) => {
  // Get unique sources by source_id
  const uniqueSources = [...new Map(citations.map(c => [c.source_id, c])).values()];

  if (uniqueSources.length === 0) return null;

  return (
    <div
      className="mt-4 pt-3 border-t"
      style={{ borderColor: 'var(--border-primary)' }}
    >
      <p
        className="text-xs font-semibold mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        Źródła:
      </p>
      <div className="flex flex-wrap gap-2">
        {uniqueSources.map((citation, index) => (
          <button
            key={citation.source_id}
            onClick={() => onCitationClick?.(citation)}
            className="inline-flex items-center px-2 py-1 rounded text-xs transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <span
              className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center mr-1.5 flex-shrink-0"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-inverse)'
              }}
            >
              {index + 1}
            </span>
            <span
              className="truncate max-w-[200px]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {citation.source_title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const MarkdownRenderer = ({ content, className = '', onCitationClick, isUserMessage = false }: MarkdownRendererProps) => {
  // Handle enhanced content with citations
  if (typeof content === 'object' && 'segments' in content) {
    return (
      <div className={className}>
        {processMarkdownWithCitations(content.segments, content.citations, onCitationClick, isUserMessage)}
        {!isUserMessage && content.citations.length > 0 && (
          <CitationsList citations={content.citations} onCitationClick={onCitationClick} />
        )}
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
            {segment.citation_id && onCitationClick && (() => {
              const citation = citations.find(c => c.citation_id === segment.citation_id);
              return citation ? (
                <CitationButton
                  chunkIndex={citation.chunk_index || 0}
                  sourceTitle={citation.source_title}
                  excerpt={citation.excerpt}
                  onClick={() => onCitationClick(citation)}
                />
              ) : null;
            })()}
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
    return <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}></p>;
  }

  // Pre-process: normalize markdown structure
  let processedText = text;

  // Remove ALL ## markers - n8n uses them incorrectly as separators
  processedText = processedText.replace(/\s*##\s*/g, ' ');

  // Clean up any empty brackets that might be citation placeholders
  processedText = processedText.replace(/\[\]\s*/g, ' ');

  // Split before numbered items like "2)" or "3)" or "2." when preceded by text
  // Use single newline to keep list items grouped together
  processedText = processedText.replace(/(\S)\s+(\d+)\)\s+/g, '$1\n$2) ');
  processedText = processedText.replace(/(\S)\s+(\d+)\.\s+/g, '$1\n$2. ');

  // Normalize multiple newlines to double newlines (but keep single newlines for lists)
  processedText = processedText.replace(/\n{3,}/g, '\n\n');

  // Ensure there's a paragraph break before the first list item if preceded by non-list text
  // But keep consecutive list items together with single newlines
  processedText = processedText.replace(/([^\n])\n(1[\.\)])\s+/g, '$1\n\n$2 ');

  // Split by double newlines to get blocks
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
        1: 'text-xl font-bold mt-6 mb-3',
        2: 'text-lg font-bold mt-5 mb-2',
        3: 'text-base font-semibold mt-4 mb-2',
        4: 'text-sm font-semibold mt-3 mb-1',
        5: 'text-sm font-medium mt-2 mb-1',
        6: 'text-xs font-medium mt-2 mb-1',
      };
      elements.push(
        <HeaderTag key={blockIndex} className={headerClasses[level]} style={{ color: 'var(--text-secondary)' }}>
          {processInlineFormatting(headerText)}
        </HeaderTag>
      );
      return;
    }

    // Check for unordered list (lines starting with - or *)
    const unorderedListMatch = trimmedBlock.match(/^[\-\*]\s+/m);
    if (unorderedListMatch) {
      const listItems = trimmedBlock.split('\n').filter(line => line.trim());
      elements.push(
        <ul key={blockIndex} className="list-disc list-outside ml-5 mb-4 space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
          {listItems.map((item, itemIndex) => {
            const itemText = item.replace(/^[\-\*]\s+/, '').trim();
            return (
              <li key={itemIndex} className="leading-relaxed pl-1" style={{ color: 'var(--text-secondary)' }}>
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
      // Split by newlines and filter for list items
      const lines = trimmedBlock.split('\n');
      const listItems: string[] = [];
      let currentItem = '';

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.match(/^\d+[\.\)]\s+/)) {
          // New list item - save previous if exists
          if (currentItem) {
            listItems.push(currentItem);
          }
          currentItem = trimmedLine.replace(/^\d+[\.\)]\s*/, '').trim();
        } else if (currentItem && trimmedLine) {
          // Continuation of current item
          currentItem += ' ' + trimmedLine;
        }
      });
      // Don't forget the last item
      if (currentItem) {
        listItems.push(currentItem);
      }

      if (listItems.length > 0) {
        elements.push(
          <ol key={blockIndex} className="list-decimal list-outside ml-5 mb-4 space-y-2" style={{ color: 'var(--text-secondary)' }}>
            {listItems.map((itemText, itemIndex) => (
              <li key={itemIndex} className="leading-relaxed pl-1" style={{ color: 'var(--text-secondary)' }}>
                {processInlineFormatting(itemText)}
              </li>
            ))}
          </ol>
        );
        return;
      }
    }

    // Check for blockquote
    if (trimmedBlock.startsWith('>')) {
      const quoteText = trimmedBlock.replace(/^>\s*/gm, '').trim();
      elements.push(
        <blockquote
          key={blockIndex}
          className="border-l-4 pl-4 py-2 mb-4 italic rounded-r"
          style={{
            borderColor: 'var(--border-primary)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-tertiary)'
          }}
        >
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
          <pre
            key={blockIndex}
            className="rounded-lg p-4 mb-4 overflow-x-auto"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <code className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{code}</code>
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
      <p key={blockIndex} className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {paragraphContent}
        {blockCitations.map((cm, idx) => cm.citation && onCitationClick && (
          <CitationButton
            key={idx}
            chunkIndex={cm.citation.chunk_index || 0}
            sourceTitle={cm.citation.source_title}
            excerpt={cm.citation.excerpt}
            onClick={() => onCitationClick(cm.citation!)}
          />
        ))}
      </p>
    );
  });

  // If no elements were created, return the text as a simple paragraph
  if (elements.length === 0) {
    return <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{processInlineFormatting(text)}</p>;
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
      return <strong key={index} className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{content}</strong>;
    }
    if (part.match(/^__(.*?)__$/)) {
      const content = part.replace(/^__(.*?)__$/, '$1');
      return <strong key={index} className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{content}</strong>;
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
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded text-sm font-mono"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-hover)' }}
        >
          {content}
        </code>
      );
    }
    // Link ([text](url))
    if (part.match(/^\[(.*?)\]\((.*?)\)$/)) {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match) {
        return (
          <a
            key={index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: 'var(--accent-primary)' }}
          >
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

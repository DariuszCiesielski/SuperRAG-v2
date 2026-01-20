/**
 * Transformery wiadomości chatu
 * Wyodrębnione z useChatMessages.tsx i useLegalChat.tsx
 */

import {
  NotebookMessage,
  LegalMessage,
  NotebookCitation,
  LegalCitation,
  MessageSegment,
  StructuredContent,
  SourceMap,
  RawCitationMatch,
  ParsedRawCitation,
  CleanedTextResult,
  N8nNotebookResponse,
  N8nLegalResponse,
} from '@/types/unified-chat';

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * Generuje excerpt z zawartości źródła na podstawie zakresu linii
 */
export const generateExcerpt = (
  sourceContent: string | null | undefined,
  linesFrom: number,
  linesTo: number,
  maxLength: number = 150
): string => {
  if (!sourceContent) {
    return `Lines ${linesFrom}-${linesTo}`;
  }

  const lines = sourceContent.split('\n');
  const startLine = Math.max(0, (linesFrom || 1) - 1);
  const endLine = Math.min(lines.length, linesTo || linesFrom || 1);

  const excerptLines = lines.slice(startLine, endLine);
  const excerptText = excerptLines.join(' ').trim().replace(/\s+/g, ' ');

  if (excerptText.length === 0) {
    return `Lines ${linesFrom}-${linesTo}`;
  }

  return excerptText.length > maxLength
    ? excerptText.substring(0, maxLength) + '...'
    : excerptText;
};

/**
 * Wykrywa surowe cytacje JSON w tekście
 */
export const detectRawCitations = (text: string): RawCitationMatch[] => {
  try {
    const regexObject = /\{["\s]*chunk_index["\s]*:\s*\d+[^}]*\}/g;
    const regexArray = /\[["\s]*chunk_index["\s]*:\s*\d+[^\]]*\]/g;
    const matches: RawCitationMatch[] = [];
    let match;

    while ((match = regexObject.exec(text)) !== null) {
      matches.push({
        match: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    while ((match = regexArray.exec(text)) !== null) {
      matches.push({
        match: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    return matches;
  } catch (error) {
    console.warn('Error detecting raw citations:', error);
    return [];
  }
};

/**
 * Parsuje surowy JSON cytacji
 */
export const parseRawCitation = (jsonString: string): ParsedRawCitation | null => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.chunk_index !== undefined && parsed.chunk_source_id) {
      return {
        chunk_index: parsed.chunk_index,
        chunk_source_id: parsed.chunk_source_id,
        chunk_lines_from: parsed.chunk_lines_from || 0,
        chunk_lines_to: parsed.chunk_lines_to || 0,
      };
    }
  } catch {
    // Fallback: regex extraction for malformed JSON
    try {
      const chunkIndexMatch = jsonString.match(/chunk_index["\s]*:\s*(\d+)/);
      const chunkSourceIdMatch = jsonString.match(/chunk_source_id["\s]*:\s*["']([^"']+)["']/);
      const chunkLinesFromMatch = jsonString.match(/chunk_lines_from["\s]*:\s*(\d+)/);
      const chunkLinesToMatch = jsonString.match(/chunk_lines_to["\s]*:\s*(\d+)/);

      if (chunkIndexMatch && chunkSourceIdMatch) {
        return {
          chunk_index: parseInt(chunkIndexMatch[1]),
          chunk_source_id: chunkSourceIdMatch[1],
          chunk_lines_from: chunkLinesFromMatch ? parseInt(chunkLinesFromMatch[1]) : 0,
          chunk_lines_to: chunkLinesToMatch ? parseInt(chunkLinesToMatch[1]) : 0,
        };
      }
    } catch (regexError) {
      console.warn('Failed to parse raw citation with regex:', regexError);
    }
  }

  return null;
};

/**
 * Czyści tekst z surowych cytacji i wyodrębnia je do struktury
 */
export const cleanAndExtractCitations = (
  text: string,
  sourceMap: SourceMap,
  startingCitationId: number
): CleanedTextResult => {
  try {
    const rawMatches = detectRawCitations(text);

    if (rawMatches.length === 0) {
      return {
        cleanedText: text,
        extractedCitations: [],
        nextCitationId: startingCitationId,
      };
    }

    const sortedMatches = [...rawMatches].sort((a, b) => b.startIndex - a.startIndex);

    let cleanedText = text;
    const extractedCitations: NotebookCitation[] = [];
    let citationId = startingCitationId;

    for (const rawMatch of sortedMatches) {
      const parsedCitation = parseRawCitation(rawMatch.match);

      if (parsedCitation) {
        const sourceInfo = sourceMap.get(parsedCitation.chunk_source_id);

        extractedCitations.unshift({
          citation_id: citationId,
          source_id: parsedCitation.chunk_source_id,
          source_title: sourceInfo?.title || 'Unknown Source',
          source_type: (sourceInfo?.type as NotebookCitation['source_type']) || 'pdf',
          chunk_lines_from: parsedCitation.chunk_lines_from,
          chunk_lines_to: parsedCitation.chunk_lines_to,
          chunk_index: parsedCitation.chunk_index,
          excerpt: generateExcerpt(
            sourceInfo?.content,
            parsedCitation.chunk_lines_from,
            parsedCitation.chunk_lines_to
          ),
        });

        cleanedText =
          cleanedText.substring(0, rawMatch.startIndex) +
          cleanedText.substring(rawMatch.endIndex);

        citationId++;
      }
    }

    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

    return {
      cleanedText,
      extractedCitations,
      nextCitationId: citationId,
    };
  } catch (error) {
    console.warn('Error cleaning and extracting citations:', error);
    return {
      cleanedText: text,
      extractedCitations: [],
      nextCitationId: startingCitationId,
    };
  }
};

// ============================================================================
// TRANSFORMERY NOTEBOOKLM
// ============================================================================

/**
 * Transformuje wiadomość z bazy danych NotebookLM do formatu UI
 */
export const transformNotebookMessage = (
  item: Record<string, unknown>,
  sourceMap: SourceMap
): NotebookMessage => {
  const messageObj = item.message as {
    type: 'human' | 'ai';
    content: string | StructuredContent;
    additional_kwargs?: Record<string, unknown>;
    response_metadata?: Record<string, unknown>;
    tool_calls?: unknown[];
    invalid_tool_calls?: unknown[];
  };

  // Sprawdź czy to wiadomość AI z JSON content do sparsowania
  if (messageObj.type === 'ai' && typeof messageObj.content === 'string') {
    try {
      const parsedContent = JSON.parse(messageObj.content) as N8nNotebookResponse;

      if (parsedContent.output && Array.isArray(parsedContent.output)) {
        const segments: MessageSegment[] = [];
        const citations: NotebookCitation[] = [];
        let citationIdCounter = 1;

        parsedContent.output.forEach((outputItem) => {
          const { cleanedText, extractedCitations, nextCitationId } =
            cleanAndExtractCitations(outputItem.text, sourceMap, citationIdCounter);

          const allCitations = [
            ...(outputItem.citations || []),
            ...extractedCitations.map((ec) => ({
              chunk_index: ec.chunk_index,
              chunk_source_id: ec.source_id,
              chunk_lines_from: ec.chunk_lines_from,
              chunk_lines_to: ec.chunk_lines_to,
            })),
          ];

          segments.push({
            text: cleanedText,
            citation_id: allCitations.length > 0 ? citationIdCounter : undefined,
          });

          if (allCitations.length > 0) {
            allCitations.forEach((citation) => {
              const sourceInfo = sourceMap.get(citation.chunk_source_id);
              citations.push({
                citation_id: citationIdCounter,
                source_id: citation.chunk_source_id,
                source_title: sourceInfo?.title || 'Unknown Source',
                source_type: (sourceInfo?.type as NotebookCitation['source_type']) || 'pdf',
                chunk_lines_from: citation.chunk_lines_from,
                chunk_lines_to: citation.chunk_lines_to,
                chunk_index: citation.chunk_index,
                excerpt: generateExcerpt(
                  sourceInfo?.content,
                  citation.chunk_lines_from,
                  citation.chunk_lines_to
                ),
              });
            });
            citationIdCounter = nextCitationId;
          }
        });

        return {
          id: item.id as number,
          session_id: item.session_id as string,
          message: {
            type: 'ai',
            content: { segments, citations },
            additional_kwargs: messageObj.additional_kwargs,
            response_metadata: messageObj.response_metadata,
            tool_calls: messageObj.tool_calls,
            invalid_tool_calls: messageObj.invalid_tool_calls,
          },
        };
      }
    } catch {
      // Próba wyodrębnienia cytacji z surowego tekstu
      const { cleanedText, extractedCitations } = cleanAndExtractCitations(
        messageObj.content,
        sourceMap,
        1
      );

      if (extractedCitations.length > 0) {
        return {
          id: item.id as number,
          session_id: item.session_id as string,
          message: {
            type: 'ai',
            content: {
              segments: [{ text: cleanedText, citation_id: 1 }],
              citations: extractedCitations,
            },
            additional_kwargs: messageObj.additional_kwargs,
            response_metadata: messageObj.response_metadata,
            tool_calls: messageObj.tool_calls,
            invalid_tool_calls: messageObj.invalid_tool_calls,
          },
        };
      }
    }
  }

  // Zwróć wiadomość bez zmian (human lub AI bez struktury)
  return {
    id: item.id as number,
    session_id: item.session_id as string,
    message: {
      type: messageObj.type,
      content: messageObj.content || 'Empty message',
      additional_kwargs: messageObj.additional_kwargs,
      response_metadata: messageObj.response_metadata,
      tool_calls: messageObj.tool_calls,
      invalid_tool_calls: messageObj.invalid_tool_calls,
    },
  };
};

// ============================================================================
// TRANSFORMERY LEGAL
// ============================================================================

/**
 * Transformuje wiadomość z bazy danych Legal do formatu UI
 */
export const transformLegalMessage = (
  item: Record<string, unknown>
): LegalMessage => {
  const messageObj = item.message as {
    type: 'human' | 'ai';
    content: string | StructuredContent;
  };

  // Jeśli to wiadomość AI z JSON content, spróbuj sparsować
  if (messageObj.type === 'ai' && typeof messageObj.content === 'string') {
    try {
      const parsedContent = JSON.parse(messageObj.content) as N8nLegalResponse;

      if (parsedContent.output && Array.isArray(parsedContent.output)) {
        const segments: MessageSegment[] = [];
        const citations: LegalCitation[] = [];
        let citationIdCounter = 1;

        parsedContent.output.forEach((outputItem) => {
          segments.push({
            text: outputItem.text,
            citation_id:
              outputItem.citations && outputItem.citations.length > 0
                ? citationIdCounter
                : undefined,
          });

          if (outputItem.citations && outputItem.citations.length > 0) {
            outputItem.citations.forEach((citation) => {
              citations.push({
                citation_id: citationIdCounter,
                source_type: citation.source_type,
                source_id: citation.source_id,
                source_title: citation.source_title,
                article: citation.article,
                paragraph: citation.paragraph,
                excerpt: citation.excerpt,
              });
            });
            citationIdCounter++;
          }
        });

        return {
          id: item.id as number,
          session_id: item.session_id as string,
          user_id: item.user_id as string,
          message: {
            type: 'ai',
            content: { segments, citations },
          },
          sources_used: item.sources_used as LegalMessage['sources_used'],
          created_at: item.created_at as string,
        };
      }
    } catch {
      // Zostaw jako plain text
      console.log('Could not parse legal AI response as JSON, treating as plain text');
    }
  }

  // Zwróć wiadomość bez zmian
  return {
    id: item.id as number,
    session_id: item.session_id as string,
    user_id: item.user_id as string,
    message: messageObj,
    sources_used: item.sources_used as LegalMessage['sources_used'],
    created_at: item.created_at as string,
  };
};

/**
 * Zunifikowane typy dla systemu chatu
 * Obsługuje zarówno NotebookLM jak i Legal Assistant
 */

// ============================================================================
// BAZOWE TYPY CYTOWAŃ
// ============================================================================

export interface BaseCitation {
  citation_id: number;
  source_id: string;
  source_title: string;
  excerpt?: string;
}

export interface NotebookCitation extends BaseCitation {
  source_type: 'pdf' | 'text' | 'website' | 'youtube' | 'audio';
  chunk_index?: number;
  chunk_lines_from?: number;
  chunk_lines_to?: number;
  page_number?: number;
}

export interface LegalCitation extends BaseCitation {
  source_type: 'regulation' | 'ruling' | 'template' | 'case_document';
  article?: string;
  paragraph?: string;
}

export type UnifiedCitation = NotebookCitation | LegalCitation;

// ============================================================================
// TYPY WIADOMOŚCI
// ============================================================================

export interface MessageSegment {
  text: string;
  citation_id?: number;
}

export interface StructuredContent {
  segments: MessageSegment[];
  citations: UnifiedCitation[];
}

export interface BaseMessage {
  id: number;
  session_id: string;
  message: {
    type: 'human' | 'ai';
    content: string | StructuredContent;
    additional_kwargs?: Record<string, unknown>;
    response_metadata?: Record<string, unknown>;
    tool_calls?: unknown[];
    invalid_tool_calls?: unknown[];
  };
}

export interface NotebookMessage extends BaseMessage {
  // NotebookLM nie ma dodatkowych pól poza bazowymi
}

export interface LegalMessage extends BaseMessage {
  user_id: string;
  sources_used: Array<{
    source_type: string;
    source_id: string;
    similarity: number;
  }> | null;
  created_at: string;
}

export type UnifiedMessage = NotebookMessage | LegalMessage;

// ============================================================================
// KONFIGURACJA HOOKA
// ============================================================================

export type ChatType = 'notebook' | 'legal';

export interface NotebookChatConfig {
  type: 'notebook';
  sessionId: string;
  notebookId: string;
}

export interface LegalChatConfig {
  type: 'legal';
  sessionId: string;
  caseId: string;
  categories?: string[];
  includeRegulations?: boolean;
  includeRulings?: boolean;
  includeTemplates?: boolean;
  includeCaseDocs?: boolean;
}

export type UnifiedChatConfig = NotebookChatConfig | LegalChatConfig;

// ============================================================================
// PARAMETRY WYSYŁANIA
// ============================================================================

export interface NotebookSendParams {
  message: string;
  notebookId: string;
  role?: 'user' | 'assistant';
}

export interface LegalSendParams {
  message: string;
  caseId: string;
  categories?: string[];
  includeRegulations?: boolean;
  includeRulings?: boolean;
  includeTemplates?: boolean;
  includeCaseDocs?: boolean;
}

export type UnifiedSendParams = NotebookSendParams | LegalSendParams;

// ============================================================================
// TYPY ZWRACANE Z HOOKA
// ============================================================================

export interface UnifiedChatReturn<TMessage, TSendParams> {
  messages: TMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (params: TSendParams) => void;
  sendMessageAsync: (params: TSendParams) => Promise<unknown>;
  isSending: boolean;
  deleteChatHistory: (sessionId: string) => void;
  isDeletingChatHistory: boolean;
}

export type NotebookChatReturn = UnifiedChatReturn<NotebookMessage, NotebookSendParams>;
export type LegalChatReturn = UnifiedChatReturn<LegalMessage, LegalSendParams>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isNotebookConfig(config: UnifiedChatConfig): config is NotebookChatConfig {
  return config.type === 'notebook';
}

export function isLegalConfig(config: UnifiedChatConfig): config is LegalChatConfig {
  return config.type === 'legal';
}

export function isNotebookCitation(citation: UnifiedCitation): citation is NotebookCitation {
  return ['pdf', 'text', 'website', 'youtube', 'audio'].includes(citation.source_type);
}

export function isLegalCitation(citation: UnifiedCitation): citation is LegalCitation {
  return ['regulation', 'ruling', 'template', 'case_document'].includes(citation.source_type);
}

export function isStructuredContent(content: string | StructuredContent): content is StructuredContent {
  return typeof content === 'object' && 'segments' in content && 'citations' in content;
}

// ============================================================================
// RAW CITATION TYPES (dla parsowania z N8N)
// ============================================================================

export interface RawCitationMatch {
  match: string;
  startIndex: number;
  endIndex: number;
}

export interface ParsedRawCitation {
  chunk_index: number;
  chunk_source_id: string;
  chunk_lines_from: number;
  chunk_lines_to: number;
}

export interface CleanedTextResult {
  cleanedText: string;
  extractedCitations: NotebookCitation[];
  nextCitationId: number;
}

// ============================================================================
// N8N RESPONSE TYPES
// ============================================================================

export interface N8nNotebookResponse {
  output: Array<{
    text: string;
    citations?: Array<{
      chunk_index: number;
      chunk_source_id: string;
      chunk_lines_from: number;
      chunk_lines_to: number;
    }>;
  }>;
}

export interface N8nLegalResponse {
  output: Array<{
    text: string;
    citations?: Array<{
      source_type: 'regulation' | 'ruling' | 'template' | 'case_document';
      source_id: string;
      source_title: string;
      article?: string;
      paragraph?: string;
      excerpt: string;
    }>;
  }>;
}

// ============================================================================
// SOURCE MAP TYPES
// ============================================================================

export interface SourceInfo {
  id: string;
  title: string;
  type: string;
  content?: string;
}

export type SourceMap = Map<string, SourceInfo>;

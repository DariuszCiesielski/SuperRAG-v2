/**
 * Konfiguracja systemu chatu per typ
 */

export const CHAT_CONFIG = {
  notebook: {
    table: 'n8n_chat_histories' as const,
    edgeFunction: 'unified-chat-message' as const,
    queryKeyPrefix: 'chat-messages' as const,
    realtimeChannelPrefix: 'chat-messages' as const,
    webhookEnvVar: 'NOTEBOOK_CHAT_URL' as const,
    sourcesTable: 'sources' as const,
    sourcesFilterColumn: 'notebook_id' as const,
  },
  legal: {
    table: 'legal_chat_histories' as const,
    edgeFunction: 'unified-chat-message' as const,
    queryKeyPrefix: 'legal-chat-messages' as const,
    realtimeChannelPrefix: 'legal-chat' as const,
    webhookEnvVar: 'LEGAL_CHAT_WEBHOOK_URL' as const,
    ownershipTable: 'legal_cases' as const,
  },
} as const;

export type ChatConfigKey = keyof typeof CHAT_CONFIG;
export type NotebookConfig = typeof CHAT_CONFIG.notebook;
export type LegalConfig = typeof CHAT_CONFIG.legal;

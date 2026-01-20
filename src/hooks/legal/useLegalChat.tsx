/**
 * Hook do obsługi chatu prawnego z AI
 * Wrapper wokół zunifikowanego useUnifiedChat
 */

import { useUnifiedChat } from '@/hooks/useUnifiedChat';
import { LegalCategory } from '@/types/legal';

// Parametry wysyłania wiadomości (zachowane dla backwards compatibility)
export interface SendLegalMessageParams {
  caseId: string;
  message: string;
  categories?: LegalCategory[];
  includeRegulations?: boolean;
  includeRulings?: boolean;
  includeTemplates?: boolean;
  includeCaseDocs?: boolean;
}

export const useLegalChat = (caseId?: string) => {
  const result = useUnifiedChat({
    type: 'legal',
    sessionId: caseId || '',
    caseId: caseId || '',
  });

  // Wrapper dla sendMessage aby zachować oryginalny interfejs
  const sendMessage = (params: SendLegalMessageParams) => {
    result.sendMessage({
      message: params.message,
      caseId: params.caseId,
      categories: params.categories,
      includeRegulations: params.includeRegulations,
      includeRulings: params.includeRulings,
      includeTemplates: params.includeTemplates,
      includeCaseDocs: params.includeCaseDocs,
    });
  };

  const sendMessageAsync = (params: SendLegalMessageParams) => {
    return result.sendMessageAsync({
      message: params.message,
      caseId: params.caseId,
      categories: params.categories,
      includeRegulations: params.includeRegulations,
      includeRulings: params.includeRulings,
      includeTemplates: params.includeTemplates,
      includeCaseDocs: params.includeCaseDocs,
    });
  };

  return {
    messages: result.messages,
    isLoading: result.isLoading,
    error: result.error,
    sendMessage,
    sendMessageAsync,
    isSending: result.isSending,
    deleteChatHistory: result.deleteChatHistory,
    isDeletingChatHistory: result.isDeletingChatHistory,
  };
};

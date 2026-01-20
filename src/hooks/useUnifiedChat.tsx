/**
 * Zunifikowany hook do obsługi chatu
 * Obsługuje zarówno NotebookLM jak i Legal Assistant
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { CHAT_CONFIG } from '@/config/chat-config';
import {
  UnifiedChatConfig,
  NotebookChatConfig,
  LegalChatConfig,
  NotebookMessage,
  LegalMessage,
  NotebookSendParams,
  LegalSendParams,
  NotebookChatReturn,
  LegalChatReturn,
  isNotebookConfig,
  isLegalConfig,
  SourceMap,
} from '@/types/unified-chat';
import {
  transformNotebookMessage,
  transformLegalMessage,
} from '@/utils/chat-transformers';

// Overloaded signatures
export function useUnifiedChat(config: NotebookChatConfig): NotebookChatReturn;
export function useUnifiedChat(config: LegalChatConfig): LegalChatReturn;

// Implementation
export function useUnifiedChat(
  config: UnifiedChatConfig
): NotebookChatReturn | LegalChatReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const chatConfig = CHAT_CONFIG[config.type];
  const queryKey = [chatConfig.queryKeyPrefix, config.sessionId];

  // ===== QUERY =====
  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!config.sessionId) return [];

      // Pobierz wiadomości z odpowiedniej tabeli
      const { data, error } = await supabase
        .from(chatConfig.table)
        .select('*')
        .eq('session_id', config.sessionId)
        .order('id', { ascending: true });

      if (error) throw error;

      // Typ-specyficzna transformacja
      if (isNotebookConfig(config)) {
        // Pobierz sources dla NotebookLM
        const notebookConfig = CHAT_CONFIG.notebook;
        const { data: sourcesData } = await supabase
          .from(notebookConfig.sourcesTable)
          .select('id, title, type, content')
          .eq(notebookConfig.sourcesFilterColumn, config.notebookId);

        const sourceMap: SourceMap = new Map(
          sourcesData?.map((s) => [s.id, s]) || []
        );

        return (data || []).map((item) =>
          transformNotebookMessage(item as Record<string, unknown>, sourceMap)
        );
      } else {
        // Legal chat - prostsza transformacja
        return (data || []).map((item) =>
          transformLegalMessage(item as Record<string, unknown>)
        );
      }
    },
    enabled: !!config.sessionId && !!user,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // ===== REALTIME SUBSCRIPTION =====
  useEffect(() => {
    if (!config.sessionId || !user) return;

    // Unikalna nazwa kanału per typ i sesja
    const channelName = isNotebookConfig(config)
      ? chatConfig.realtimeChannelPrefix
      : `${chatConfig.realtimeChannelPrefix}-${config.sessionId}`;

    console.log('Setting up Realtime subscription:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: chatConfig.table,
          filter: `session_id=eq.${config.sessionId}`,
        },
        async (payload) => {
          console.log('Realtime: New message received:', payload);

          let newMessage;

          if (isNotebookConfig(config)) {
            // Pobierz sources dla transformacji
            const notebookConfig = CHAT_CONFIG.notebook;
            const { data: sourcesData } = await supabase
              .from(notebookConfig.sourcesTable)
              .select('id, title, type, content')
              .eq(notebookConfig.sourcesFilterColumn, config.notebookId);

            const sourceMap: SourceMap = new Map(
              sourcesData?.map((s) => [s.id, s]) || []
            );

            newMessage = transformNotebookMessage(
              payload.new as Record<string, unknown>,
              sourceMap
            );
          } else {
            newMessage = transformLegalMessage(
              payload.new as Record<string, unknown>
            );
          }

          // Aktualizuj cache
          queryClient.setQueryData(
            queryKey,
            (oldMessages: (NotebookMessage | LegalMessage)[] = []) => {
              const messageExists = oldMessages.some(
                (msg) => msg.id === newMessage.id
              );
              if (messageExists) {
                console.log('Message already exists, skipping:', newMessage.id);
                return oldMessages;
              }

              console.log('Adding new message to cache:', newMessage.id);
              return [...oldMessages, newMessage];
            }
          );
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up Realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [config.sessionId, user, queryClient, config.type]);

  // ===== SEND MUTATION =====
  const sendMutation = useMutation({
    mutationFn: async (params: NotebookSendParams | LegalSendParams) => {
      if (!user) throw new Error('User not authenticated');

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        throw new Error('Unable to get authentication session');
      }

      // Zbuduj body w zależności od typu
      let body: Record<string, unknown>;

      if (isNotebookConfig(config)) {
        const notebookParams = params as NotebookSendParams;
        body = {
          chat_type: 'notebook',
          session_id: notebookParams.notebookId,
          message: notebookParams.message,
          user_id: user.id,
        };
      } else {
        const legalParams = params as LegalSendParams;
        const legalConfig = config as LegalChatConfig;
        body = {
          chat_type: 'legal',
          session_id: legalParams.caseId,
          message: legalParams.message,
          user_id: user.id,
          case_id: legalParams.caseId,
          categories:
            legalParams.categories || legalConfig.categories || [],
          include_regulations:
            legalParams.includeRegulations ??
            legalConfig.includeRegulations ??
            true,
          include_rulings:
            legalParams.includeRulings ?? legalConfig.includeRulings ?? true,
          include_templates:
            legalParams.includeTemplates ??
            legalConfig.includeTemplates ??
            false,
          include_case_docs:
            legalParams.includeCaseDocs ?? legalConfig.includeCaseDocs ?? true,
        };
      }

      console.log('Sending to unified-chat-message:', body.chat_type);

      const response = await supabase.functions.invoke('unified-chat-message', {
        body,
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(`Error sending message: ${response.error.message}`);
      }

      return response.data;
    },
    onSuccess: () => {
      console.log('Message sent successfully');
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({
        title: config.type === 'notebook' ? 'Error' : 'Błąd',
        description:
          config.type === 'notebook'
            ? 'Failed to send message. Please try again.'
            : 'Nie udało się wysłać wiadomości. Spróbuj ponownie.',
        variant: 'destructive',
      });
    },
  });

  // ===== DELETE MUTATION =====
  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting chat history for session:', sessionId);

      const { error } = await supabase
        .from(chatConfig.table)
        .delete()
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error deleting chat history:', error);
        throw error;
      }

      console.log('Chat history deleted successfully');
      return sessionId;
    },
    onSuccess: (sessionId) => {
      toast({
        title:
          config.type === 'notebook' ? 'Chat history cleared' : 'Historia usunięta',
        description:
          config.type === 'notebook'
            ? 'All messages have been deleted successfully.'
            : 'Historia czatu została wyczyszczona.',
      });

      queryClient.setQueryData(queryKey, []);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      toast({
        title: config.type === 'notebook' ? 'Error' : 'Błąd',
        description:
          config.type === 'notebook'
            ? 'Failed to clear chat history. Please try again.'
            : 'Nie udało się usunąć historii czatu.',
        variant: 'destructive',
      });
    },
  });

  return {
    messages,
    isLoading,
    error: error as Error | null,
    sendMessage: sendMutation.mutate,
    sendMessageAsync: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    deleteChatHistory: deleteMutation.mutate,
    isDeletingChatHistory: deleteMutation.isPending,
  } as NotebookChatReturn | LegalChatReturn;
}

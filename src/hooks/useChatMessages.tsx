
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedChatMessage, Citation, MessageSegment, RawCitationMatch, ParsedRawCitation, CleanedTextResult } from '@/types/message';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

// Type for the expected message structure from n8n_chat_histories
interface N8nMessageFormat {
  type: 'human' | 'ai';
  content: string | {
    segments: Array<{ text: string; citation_id?: number }>;
    citations: Array<{
      citation_id: number;
      source_id: string;
      source_title: string;
      source_type: string;
      page_number?: number;
      chunk_index?: number;
      excerpt?: string;
    }>;
  };
  additional_kwargs?: any;
  response_metadata?: any;
  tool_calls?: any[];
  invalid_tool_calls?: any[];
}

// Type for the AI response structure from n8n
interface N8nAiResponseContent {
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

// Utility function to detect raw citation JSON in text
const detectRawCitations = (text: string): RawCitationMatch[] => {
  try {
    // Detect both object {chunk_index...} and array ["chunk_index"...] formats
    const regexObject = /\{["\s]*chunk_index["\s]*:\s*\d+[^}]*\}/g;
    const regexArray = /\[["\s]*chunk_index["\s]*:\s*\d+[^\]]*\]/g;
    const matches: RawCitationMatch[] = [];
    let match;

    // Find object format citations
    while ((match = regexObject.exec(text)) !== null) {
      matches.push({
        match: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }

    // Find array format citations
    while ((match = regexArray.exec(text)) !== null) {
      matches.push({
        match: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }

    if (matches.length > 0) {
      console.log(`Detected ${matches.length} raw citation(s) in text:`, matches);
    }

    return matches;
  } catch (error) {
    console.warn('Error detecting raw citations:', error);
    return [];
  }
};

// Utility function to parse a raw citation JSON string
const parseRawCitation = (jsonString: string): ParsedRawCitation | null => {
  try {
    // Try JSON.parse first
    const parsed = JSON.parse(jsonString);
    if (parsed.chunk_index !== undefined && parsed.chunk_source_id) {
      console.log('Parsed citation with JSON.parse:', parsed);
      return {
        chunk_index: parsed.chunk_index,
        chunk_source_id: parsed.chunk_source_id,
        chunk_lines_from: parsed.chunk_lines_from || 0,
        chunk_lines_to: parsed.chunk_lines_to || 0
      };
    }
  } catch (parseError) {
    // Fallback: use regex extraction for malformed JSON (including array format)
    try {
      const chunkIndexMatch = jsonString.match(/chunk_index["\s]*:\s*(\d+)/);
      const chunkSourceIdMatch = jsonString.match(/chunk_source_id["\s]*:\s*["']([^"']+)["']/);
      const chunkLinesFromMatch = jsonString.match(/chunk_lines_from["\s]*:\s*(\d+)/);
      const chunkLinesToMatch = jsonString.match(/chunk_lines_to["\s]*:\s*(\d+)/);

      if (chunkIndexMatch && chunkSourceIdMatch) {
        const parsed = {
          chunk_index: parseInt(chunkIndexMatch[1]),
          chunk_source_id: chunkSourceIdMatch[1],
          chunk_lines_from: chunkLinesFromMatch ? parseInt(chunkLinesFromMatch[1]) : 0,
          chunk_lines_to: chunkLinesToMatch ? parseInt(chunkLinesToMatch[1]) : 0
        };
        console.log('Parsed citation with regex fallback:', parsed, 'from:', jsonString);
        return parsed;
      } else {
        console.warn('Failed to extract citation data from:', jsonString);
      }
    } catch (regexError) {
      console.warn('Failed to parse raw citation with regex:', regexError);
    }
  }

  return null;
};

// Utility function to clean text and extract citations
const cleanAndExtractCitations = (
  text: string,
  sourceMap: Map<string, any>,
  startingCitationId: number
): CleanedTextResult => {
  try {
    const rawMatches = detectRawCitations(text);

    if (rawMatches.length === 0) {
      return {
        cleanedText: text,
        extractedCitations: [],
        nextCitationId: startingCitationId
      };
    }

    // Sort matches by startIndex (descending) for safe removal
    const sortedMatches = [...rawMatches].sort((a, b) => b.startIndex - a.startIndex);

    let cleanedText = text;
    const extractedCitations: Citation[] = [];
    let citationId = startingCitationId;

    // Process each match
    for (const rawMatch of sortedMatches) {
      const parsedCitation = parseRawCitation(rawMatch.match);

      if (parsedCitation) {
        const sourceInfo = sourceMap.get(parsedCitation.chunk_source_id);

        extractedCitations.unshift({
          citation_id: citationId,
          source_id: parsedCitation.chunk_source_id,
          source_title: sourceInfo?.title || 'Unknown Source',
          source_type: sourceInfo?.type || 'pdf',
          chunk_lines_from: parsedCitation.chunk_lines_from,
          chunk_lines_to: parsedCitation.chunk_lines_to,
          chunk_index: parsedCitation.chunk_index,
          excerpt: `Lines ${parsedCitation.chunk_lines_from}-${parsedCitation.chunk_lines_to}`
        });

        // Remove raw JSON from text
        cleanedText = cleanedText.substring(0, rawMatch.startIndex) +
                     cleanedText.substring(rawMatch.endIndex);

        citationId++;
      }
    }

    // Clean up extra whitespace
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

    return {
      cleanedText,
      extractedCitations,
      nextCitationId: citationId
    };
  } catch (error) {
    console.warn('Error cleaning and extracting citations:', error);
    return {
      cleanedText: text,
      extractedCitations: [],
      nextCitationId: startingCitationId
    };
  }
};

const transformMessage = (item: any, sourceMap: Map<string, any>): EnhancedChatMessage => {
  console.log('Processing item:', item);
  
  // Handle the message format based on your JSON examples
  let transformedMessage: EnhancedChatMessage['message'];
  
  // Check if message is an object and has the expected structure
  if (item.message && 
      typeof item.message === 'object' && 
      !Array.isArray(item.message) &&
      'type' in item.message && 
      'content' in item.message) {
    
    // Type assertion with proper checking
    const messageObj = item.message as unknown as N8nMessageFormat;
    
    // Check if this is an AI message with JSON content that needs parsing
    if (messageObj.type === 'ai' && typeof messageObj.content === 'string') {
      try {
        const parsedContent = JSON.parse(messageObj.content) as N8nAiResponseContent;
        
        if (parsedContent.output && Array.isArray(parsedContent.output)) {
          // Transform the parsed content into segments and citations
          const segments: MessageSegment[] = [];
          const citations: Citation[] = [];
          let citationIdCounter = 1;

          parsedContent.output.forEach((outputItem) => {
            // Clean text and extract any embedded raw citations
            const { cleanedText, extractedCitations, nextCitationId } =
              cleanAndExtractCitations(outputItem.text, sourceMap, citationIdCounter);

            // Merge extracted citations with explicit ones
            const allCitations = [
              ...(outputItem.citations || []),
              ...extractedCitations.map(ec => ({
                chunk_index: ec.chunk_index,
                chunk_source_id: ec.source_id,
                chunk_lines_from: ec.chunk_lines_from,
                chunk_lines_to: ec.chunk_lines_to
              }))
            ];

            // Add the text segment with cleaned text
            segments.push({
              text: cleanedText,
              citation_id: allCitations.length > 0 ? citationIdCounter : undefined
            });

            // Process all citations (both explicit and extracted)
            if (allCitations.length > 0) {
              allCitations.forEach((citation) => {
                const sourceInfo = sourceMap.get(citation.chunk_source_id);
                citations.push({
                  citation_id: citationIdCounter,
                  source_id: citation.chunk_source_id,
                  source_title: sourceInfo?.title || 'Unknown Source',
                  source_type: sourceInfo?.type || 'pdf',
                  chunk_lines_from: citation.chunk_lines_from,
                  chunk_lines_to: citation.chunk_lines_to,
                  chunk_index: citation.chunk_index,
                  excerpt: `Lines ${citation.chunk_lines_from}-${citation.chunk_lines_to}`
                });
              });
              citationIdCounter++;
            }
          });
          
          transformedMessage = {
            type: 'ai',
            content: {
              segments,
              citations
            },
            additional_kwargs: messageObj.additional_kwargs,
            response_metadata: messageObj.response_metadata,
            tool_calls: messageObj.tool_calls,
            invalid_tool_calls: messageObj.invalid_tool_calls
          };
        } else {
          // Fallback for AI messages that don't match expected format
          transformedMessage = {
            type: 'ai',
            content: messageObj.content,
            additional_kwargs: messageObj.additional_kwargs,
            response_metadata: messageObj.response_metadata,
            tool_calls: messageObj.tool_calls,
            invalid_tool_calls: messageObj.invalid_tool_calls
          };
        }
      } catch (parseError) {
        console.log('Failed to parse AI content as JSON, attempting to extract raw citations:', parseError);

        // Try to extract citations from raw text before giving up
        const { cleanedText, extractedCitations } =
          cleanAndExtractCitations(messageObj.content, sourceMap, 1);

        if (extractedCitations.length > 0) {
          // Found citations! Create structured format
          transformedMessage = {
            type: 'ai',
            content: {
              segments: [{ text: cleanedText, citation_id: 1 }],
              citations: extractedCitations
            },
            additional_kwargs: messageObj.additional_kwargs,
            response_metadata: messageObj.response_metadata,
            tool_calls: messageObj.tool_calls,
            invalid_tool_calls: messageObj.invalid_tool_calls
          };
        } else {
          // No citations found, treat as plain text
          transformedMessage = {
            type: 'ai',
            content: messageObj.content,
            additional_kwargs: messageObj.additional_kwargs,
            response_metadata: messageObj.response_metadata,
            tool_calls: messageObj.tool_calls,
            invalid_tool_calls: messageObj.invalid_tool_calls
          };
        }
      }
    } else {
      // Handle non-AI messages or AI messages that don't need parsing
      transformedMessage = {
        type: messageObj.type === 'human' ? 'human' : 'ai',
        content: messageObj.content || 'Empty message',
        additional_kwargs: messageObj.additional_kwargs,
        response_metadata: messageObj.response_metadata,
        tool_calls: messageObj.tool_calls,
        invalid_tool_calls: messageObj.invalid_tool_calls
      };
    }
  } else if (typeof item.message === 'string') {
    // Handle case where message is just a string
    transformedMessage = {
      type: 'human',
      content: item.message
    };
  } else {
    // Fallback for any other cases
    transformedMessage = {
      type: 'human',
      content: 'Unable to parse message'
    };
  }

  console.log('Transformed message:', transformedMessage);

  return {
    id: item.id,
    session_id: item.session_id,
    message: transformedMessage
  };
};

export const useChatMessages = (notebookId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat-messages', notebookId],
    queryFn: async () => {
      if (!notebookId) return [];
      
      const { data, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', notebookId)
        .order('id', { ascending: true });

      if (error) throw error;
      
      // Also fetch sources to get proper source titles
      const { data: sourcesData } = await supabase
        .from('sources')
        .select('id, title, type')
        .eq('notebook_id', notebookId);
      
      const sourceMap = new Map(sourcesData?.map(s => [s.id, s]) || []);
      
      console.log('Raw data from database:', data);
      console.log('Sources map:', sourceMap);
      
      // Transform the data to match our expected format
      return data.map((item) => transformMessage(item, sourceMap));
    },
    enabled: !!notebookId && !!user,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Set up Realtime subscription for new messages
  useEffect(() => {
    if (!notebookId || !user) return;

    console.log('Setting up Realtime subscription for notebook:', notebookId);

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'n8n_chat_histories',
          filter: `session_id=eq.${notebookId}`
        },
        async (payload) => {
          console.log('Realtime: New message received:', payload);
          
          // Fetch sources for proper transformation
          const { data: sourcesData } = await supabase
            .from('sources')
            .select('id, title, type')
            .eq('notebook_id', notebookId);
          
          const sourceMap = new Map(sourcesData?.map(s => [s.id, s]) || []);
          
          // Transform the new message
          const newMessage = transformMessage(payload.new, sourceMap);
          
          // Update the query cache with the new message
          queryClient.setQueryData(['chat-messages', notebookId], (oldMessages: EnhancedChatMessage[] = []) => {
            // Check if message already exists to prevent duplicates
            const messageExists = oldMessages.some(msg => msg.id === newMessage.id);
            if (messageExists) {
              console.log('Message already exists, skipping:', newMessage.id);
              return oldMessages;
            }
            
            console.log('Adding new message to cache:', newMessage);
            return [...oldMessages, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up Realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [notebookId, user, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async (messageData: {
      notebookId: string;
      role: 'user' | 'assistant';
      content: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Get the current session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        throw new Error('Unable to get authentication session');
      }

      console.log('Session found, token expires at:', new Date(session.expires_at! * 1000).toISOString());
      console.log('Token starts with:', session.access_token.substring(0, 20) + '...');

      // Call the n8n webhook - let Supabase handle auth automatically
      const webhookResponse = await supabase.functions.invoke('send-chat-message', {
        body: {
          session_id: messageData.notebookId,
          message: messageData.content,
          user_id: user.id
        }
      });

      if (webhookResponse.error) {
        console.error('Edge function error:', webhookResponse.error);
        // Try to get more details from the error
        const errorContext = webhookResponse.error.context;
        if (errorContext) {
          try {
            const errorBody = await errorContext.json();
            console.error('Error body:', errorBody);
          } catch {
            const errorText = await errorContext.text();
            console.error('Error text:', errorText);
          }
        }
        throw new Error(`Webhook error: ${webhookResponse.error.message}`);
      }

      return webhookResponse.data;
    },
    onSuccess: () => {
      // The response will appear via Realtime, so we don't need to do anything here
      console.log('Message sent to webhook successfully');
    },
  });

  const deleteChatHistory = useMutation({
    mutationFn: async (notebookId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting chat history for notebook:', notebookId);
      
      const { error } = await supabase
        .from('n8n_chat_histories')
        .delete()
        .eq('session_id', notebookId);

      if (error) {
        console.error('Error deleting chat history:', error);
        throw error;
      }
      
      console.log('Chat history deleted successfully');
      return notebookId;
    },
    onSuccess: (notebookId) => {
      console.log('Chat history cleared for notebook:', notebookId);
      toast({
        title: "Chat history cleared",
        description: "All messages have been deleted successfully.",
      });
      
      // Clear the query data and refetch to confirm
      queryClient.setQueryData(['chat-messages', notebookId], []);
      queryClient.invalidateQueries({
        queryKey: ['chat-messages', notebookId]
      });
    },
    onError: (error) => {
      console.error('Failed to delete chat history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessage.mutate,
    sendMessageAsync: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
    deleteChatHistory: deleteChatHistory.mutate,
    isDeletingChatHistory: deleteChatHistory.isPending,
  };
};

/**
 * Zunifikowana Edge Function dla chatu
 * Obsługuje zarówno NotebookLM jak i Legal Assistant
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Typy żądania
interface BaseRequest {
  chat_type: 'notebook' | 'legal';
  session_id: string;
  message: string;
  user_id: string;
}

interface NotebookRequest extends BaseRequest {
  chat_type: 'notebook';
}

interface LegalRequest extends BaseRequest {
  chat_type: 'legal';
  case_id: string;
  categories?: string[];
  include_regulations?: boolean;
  include_rulings?: boolean;
  include_templates?: boolean;
  include_case_docs?: boolean;
}

type ChatRequest = NotebookRequest | LegalRequest;

// Konfiguracja per typ
const CONFIG = {
  notebook: {
    webhookEnvVar: 'NOTEBOOK_CHAT_URL',
    historyTable: 'n8n_chat_histories',
    requiresOwnershipCheck: false,
  },
  legal: {
    webhookEnvVar: 'LEGAL_CHAT_WEBHOOK_URL',
    historyTable: 'legal_chat_histories',
    requiresOwnershipCheck: true,
  },
} as const;

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ChatRequest = await req.json();
    const { chat_type, session_id, message, user_id } = requestData;

    console.log('Unified chat request:', { chat_type, session_id, user_id });

    // Walidacja wymaganych pól
    if (!chat_type || !session_id || !message || !user_id) {
      throw new Error('Missing required fields: chat_type, session_id, message, user_id');
    }

    const config = CONFIG[chat_type];
    if (!config) {
      throw new Error(`Invalid chat_type: ${chat_type}`);
    }

    // Pobierz zmienne środowiskowe
    const webhookUrl = Deno.env.get(config.webhookEnvVar);
    const authHeader = Deno.env.get('NOTEBOOK_GENERATION_AUTH');

    if (!webhookUrl) {
      throw new Error(`${config.webhookEnvVar} environment variable not set`);
    }
    if (!authHeader) {
      throw new Error('NOTEBOOK_GENERATION_AUTH environment variable not set');
    }

    // Inicjalizacja Supabase (dla legal ownership check)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let categories: string[] = [];

    // Dla legal - sprawdź ownership i pobierz kategorię
    if (chat_type === 'legal' && config.requiresOwnershipCheck) {
      const legalReq = requestData as LegalRequest;

      const { data: caseData, error: caseError } = await supabase
        .from('legal_cases')
        .select('id, user_id, category')
        .eq('id', legalReq.case_id)
        .eq('user_id', user_id)
        .single();

      if (caseError || !caseData) {
        console.error('Case verification failed:', caseError);
        throw new Error('Case not found or access denied');
      }

      // Wypełnij categories z case jeśli puste
      if ((!legalReq.categories || legalReq.categories.length === 0) && caseData.category) {
        categories = [caseData.category];
      } else {
        categories = legalReq.categories || [];
      }

      // Zapisz wiadomość użytkownika do historii
      const { error: insertError } = await supabase
        .from(config.historyTable)
        .insert({
          session_id: legalReq.case_id,
          user_id,
          message: { type: 'human', content: message },
          sources_used: null,
        });

      if (insertError) {
        console.error('Failed to save user message:', insertError);
        // Nie rzucaj błędu - to nie jest krytyczne
      }
    }

    // Zbuduj body dla webhooka
    let webhookBody: Record<string, unknown>;

    if (chat_type === 'notebook') {
      webhookBody = {
        session_id,
        message,
        user_id,
        timestamp: new Date().toISOString(),
      };
    } else {
      const legalReq = requestData as LegalRequest;
      webhookBody = {
        session_id,
        message,
        user_id,
        case_id: legalReq.case_id,
        categories,
        include_regulations: legalReq.include_regulations ?? true,
        include_rulings: legalReq.include_rulings ?? true,
        include_templates: legalReq.include_templates ?? false,
        include_case_docs: legalReq.include_case_docs ?? true,
        timestamp: new Date().toISOString(),
        context: {
          language: 'pl',
          jurisdiction: 'PL',
          assistant_type: 'legal',
        },
      };
    }

    console.log('Sending to webhook:', config.webhookEnvVar);

    // Wyślij do N8N
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(webhookBody),
    });

    if (!webhookResponse.ok) {
      console.error(`Webhook responded with status: ${webhookResponse.status}`);
      const errorText = await webhookResponse.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`Webhook responded with status: ${webhookResponse.status}`);
    }

    const webhookData = await webhookResponse.json();
    console.log('Webhook response received for', chat_type);

    return new Response(
      JSON.stringify({ success: true, data: webhookData }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in unified-chat-message:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process chat message',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

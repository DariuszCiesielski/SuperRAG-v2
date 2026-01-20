/**
 * Edge Function: legal-chat-message
 * Wysyła wiadomość do N8N workflow dla chatu prawnego z hybrydowym RAG
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LegalChatRequest {
  session_id: string;      // case_id
  message: string;
  user_id: string;
  case_id: string;
  categories?: string[];   // ['cywilne', 'administracyjne', etc.]
  include_regulations?: boolean;
  include_rulings?: boolean;
  include_templates?: boolean;
  include_case_docs?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: LegalChatRequest = await req.json();

    const {
      session_id,
      message,
      user_id,
      case_id,
      categories = [],
      include_regulations = true,
      include_rulings = true,
      include_templates = false,
      include_case_docs = true,
    } = requestData;

    console.log('Legal chat request:', {
      session_id,
      message: message.substring(0, 100),
      user_id,
      case_id,
      categories
    });

    // Validate required fields
    if (!session_id || !message || !user_id) {
      throw new Error('Missing required fields: session_id, message, user_id');
    }

    // Get the webhook URL and auth header from environment
    const webhookUrl = Deno.env.get('LEGAL_CHAT_WEBHOOK_URL');
    const authHeader = Deno.env.get('NOTEBOOK_GENERATION_AUTH');

    if (!webhookUrl) {
      throw new Error('LEGAL_CHAT_WEBHOOK_URL environment variable not set');
    }

    if (!authHeader) {
      throw new Error('NOTEBOOK_GENERATION_AUTH environment variable not set');
    }

    // Initialize Supabase client to verify case ownership
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify that the user owns this case
    if (case_id) {
      const { data: caseData, error: caseError } = await supabase
        .from('legal_cases')
        .select('id, user_id, category')
        .eq('id', case_id)
        .eq('user_id', user_id)
        .single();

      if (caseError || !caseData) {
        console.error('Case verification failed:', caseError);
        throw new Error('Case not found or access denied');
      }

      // If no categories specified, use the case category
      if (categories.length === 0 && caseData.category) {
        categories.push(caseData.category);
      }
    }

    console.log('Sending to legal chat webhook');

    // Send message to n8n webhook with authentication
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        session_id,
        message,
        user_id,
        case_id,
        categories,
        include_regulations,
        include_rulings,
        include_templates,
        include_case_docs,
        timestamp: new Date().toISOString(),
        // Additional context for the legal assistant
        context: {
          language: 'pl',
          jurisdiction: 'PL',
          assistant_type: 'legal',
        }
      })
    });

    if (!webhookResponse.ok) {
      console.error(`Webhook responded with status: ${webhookResponse.status}`);
      const errorText = await webhookResponse.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`Webhook responded with status: ${webhookResponse.status}`);
    }

    const webhookData = await webhookResponse.json();
    console.log('Legal chat webhook response received');

    // Optionally save the user message to legal_chat_histories
    // (The AI response will be saved by the N8N workflow callback)
    const { error: insertError } = await supabase
      .from('legal_chat_histories')
      .insert({
        session_id: case_id || session_id,
        user_id,
        message: {
          type: 'human',
          content: message,
        },
        sources_used: null,
      });

    if (insertError) {
      console.error('Failed to save user message:', insertError);
      // Don't throw - this is not critical
    }

    return new Response(
      JSON.stringify({ success: true, data: webhookData }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in legal-chat-message:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to send message to legal chat webhook'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

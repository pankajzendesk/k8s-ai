import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_URL = "http://localhost:11434/api/chat";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { model, messages } = await req.json();

    if (!messages || messages.length === 0) {
      throw new Error('Messages array is required');
    }

    if (!model) {
      throw new Error('Model selection is required');
    }

    const data = {
      model: model,
      messages: messages,
      stream: false,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.message?.content) {
      throw new Error('Invalid response format from Ollama');
    }

    return new Response(
      JSON.stringify({ response: result.message.content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message,
        hint: 'Make sure Ollama is running locally and the selected model is installed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

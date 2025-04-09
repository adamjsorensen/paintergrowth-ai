
import { corsHeaders } from "./utils.ts";

export async function callOpenRouterAPI(systemPrompt, openRouterApiKey) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openRouterApiKey}`,
      'HTTP-Referer': 'https://lovable.dev',
      'X-Title': 'Proposal Generator'
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate a detailed proposal based on the information provided.' }
      ],
      temperature: 0.7,
      max_tokens: 1500
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API error:', errorText);
    throw new Error(`OpenRouter API error: ${response.status}`);
  }
  
  return await response.json();
}

export function createErrorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export function createSuccessResponse(data) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}


export async function callOpenRouterAPI(
  fullPrompt: string,
  model: string,
  temperature: number
) {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not found in environment variables');
  }

  console.log('=== DEBUGGING: FULL PROMPT SENT TO AI ===');
  console.log(fullPrompt);
  console.log('=== END PROMPT ===');

  const requestBody = {
    model: model,
    messages: [
      {
        role: 'user',
        content: fullPrompt
      }
    ],
    temperature: temperature,
    max_tokens: 4000
  };

  const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://supabase.com',
      'X-Title': 'Estimate Generator V2'
    },
    body: JSON.stringify(requestBody)
  });

  if (!openRouterResponse.ok) {
    const errorText = await openRouterResponse.text();
    console.error(`OpenRouter API error (${openRouterResponse.status}):`, errorText);
    throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${errorText}`);
  }

  const result = await openRouterResponse.json();
  
  // Log the raw AI response for debugging
  const rawResponse = result.choices?.[0]?.message?.content || '';
  console.log('=== DEBUGGING: RAW AI RESPONSE ===');
  console.log(rawResponse);
  console.log('=== END AI RESPONSE ===');
  
  return result;
}

export function parseAIResponse(response: string): any {
  // Try to extract JSON from the response
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                   response.match(/```\s*([\s\S]*?)\s*```/) ||
                   response.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    try {
      const jsonContent = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonContent);
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse extracted JSON:', parseError);
      throw new Error(`Invalid JSON in AI response: ${parseError.message}`);
    }
  }
  
  // If no clear JSON blocks found, try to parse the entire response
  try {
    const parsed = JSON.parse(response);
    return parsed;
  } catch (parseError) {
    console.error('Failed to parse response as JSON:', parseError);
    throw new Error(`No valid JSON found in AI response. Response: ${response.substring(0, 200)}...`);
  }
}

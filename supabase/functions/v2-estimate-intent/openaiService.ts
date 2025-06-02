
export async function callOpenRouterAPI(
  fullPrompt: string,
  model: string,
  temperature: number
) {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not found in environment variables');
  }

  console.log(`Calling OpenRouter with model: ${model}, temperature: ${temperature}`);
  console.log(`FULL PROMPT SENT TO AI:\n${fullPrompt.substring(0, 500)}...(truncated)`);

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

  console.log('OpenRouter request body prepared');

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
  console.log('OpenRouter API call successful');
  
  // Log the raw AI response before any processing
  const rawResponse = result.choices?.[0]?.message?.content || '';
  console.log(`RAW AI RESPONSE:\n${rawResponse}`);
  
  return result;
}

export function parseAIResponse(response: string): any {
  console.log('Parsing AI response for JSON content');
  
  // Try to extract JSON from the response
  // Look for content between ```json and ``` or just raw JSON
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                   response.match(/```\s*([\s\S]*?)\s*```/) ||
                   response.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    try {
      const jsonContent = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonContent);
      console.log('Successfully parsed JSON from AI response');
      console.log(`PARSED CONTENT STRUCTURE: ${Object.keys(parsed).join(', ')}`);
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse extracted JSON:', parseError);
      console.log(`PROBLEMATIC CONTENT: ${jsonMatch[1] || jsonMatch[0]}`);
      throw new Error(`Invalid JSON in AI response: ${parseError.message}`);
    }
  }
  
  // If no clear JSON blocks found, try to parse the entire response
  try {
    const parsed = JSON.parse(response);
    console.log('Successfully parsed entire response as JSON');
    console.log(`PARSED CONTENT STRUCTURE: ${Object.keys(parsed).join(', ')}`);
    return parsed;
  } catch (parseError) {
    console.error('Failed to parse response as JSON:', parseError);
    console.log(`RESPONSE SAMPLE: ${response.substring(0, 200)}...`);
    throw new Error(`No valid JSON found in AI response. Response: ${response.substring(0, 200)}...`);
  }
}

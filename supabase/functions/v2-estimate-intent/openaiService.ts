
export async function callOpenRouterAPI(
  fullPrompt: string,
  functionDefinition: any,
  model: string,
  temperature: number
) {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not found in environment variables');
  }

  console.log(`Calling OpenRouter with model: ${model}, temperature: ${temperature}`);

  // Convert the function definition to the new tools format
  const toolDefinition = {
    type: "function",
    function: functionDefinition
  };

  const requestBody = {
    model: model,
    messages: [
      {
        role: 'user',
        content: fullPrompt
      }
    ],
    tools: [toolDefinition],
    tool_choice: { type: "function", function: { name: "generate_pdf_content" } },
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
  
  return result;
}

export function createFunctionDefinition() {
  return {
    name: "generate_pdf_content",
    description: "Generate structured PDF content for painting estimates matching the content editor format",
    parameters: {
      type: "object",
      properties: {
        projectOverview: {
          type: "string",
          description: "Overview of the painting project including client details and project summary"
        },
        scopeOfWork: {
          type: "string", 
          description: "Detailed description of all work to be performed"
        },
        materialsAndLabor: {
          type: "string",
          description: "Information about materials to be used and labor details"
        },
        timeline: {
          type: "string",
          description: "Project timeline and scheduling information"
        },
        termsAndConditions: {
          type: "string",
          description: "Terms and conditions for the project"
        },
        additionalNotes: {
          type: "string",
          description: "Any additional notes or special considerations"
        }
      },
      required: ["projectOverview", "scopeOfWork", "materialsAndLabor", "timeline", "termsAndConditions", "additionalNotes"]
    }
  };
}
